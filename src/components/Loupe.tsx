import { useEffect, useRef } from 'react';
import { LensRenderer } from '@/lib/lens';
import { clamp, prefersReducedMotion } from '@/lib/util';
import { photo, src, type PhotoId } from '@/photos';

/** Centre magnification of the dome (see lib/lens.ts). */
const MAGNIFICATION = 1.8;

interface LoupeProps {
  /** The photo to magnify; it must be laid out to fill the parent element. */
  id: PhotoId;
  /** How the photo fills its parent: `cover` (object-fit) or exactly (`fill`). */
  fit?: 'cover' | 'fill';
  /** Where the lens rests (0–1 of the parent) when no pointer is over it; null hides it instead. */
  rest?: [number, number] | null;
  /** Lens radius as a fraction of the parent's shorter side. */
  size?: number;
}

/**
 * A glass loupe that follows the pointer across a photograph. Mount it as the
 * last child of the element that holds the image; it listens to that element.
 */
export function Loupe({ id, fit = 'cover', rest = null, size = 0.15 }: LoupeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;
    const renderer = LensRenderer.create(canvas);
    if (!renderer) return;

    const still = prefersReducedMotion();
    const s = {
      x: 0,
      y: 0,
      alpha: 0,
      placed: false,
      pointer: null as { x: number; y: number } | null,
      pinned: null as [number, number] | null,
      start: performance.now(),
      last: performance.now(),
    };
    let w = 0;
    let h = 0;
    let radius = 0;
    let box = 0;
    let raf = 0;
    let ready = false;
    let visible = false;
    let disposed = false;

    const layout = () => {
      w = host.clientWidth;
      h = host.clientHeight;
      radius = clamp(Math.min(w, h) * size, 56, 170);
      box = Math.ceil(radius * 2.9);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = canvas.height = Math.round(box * dpr);
      canvas.style.width = canvas.style.height = `${box}px`;
    };

    const frame = (now: number) => {
      raf = 0;
      const dt = Math.min((now - s.last) / 1000, 1 / 20);
      s.last = now;

      let tx: number;
      let ty: number;
      let ta = 1;
      if (s.pointer) {
        const rect = host.getBoundingClientRect();
        tx = s.pointer.x - rect.left;
        ty = s.pointer.y - rect.top;
      } else if (s.pinned) {
        [tx, ty] = [s.pinned[0] * w, s.pinned[1] * h];
      } else if (rest) {
        // Idle: drift slowly around the resting point, like a lens nudged on a light table.
        const t = (now - s.start) / 1000;
        const sway = still ? 0 : 1;
        tx = w * (rest[0] + sway * (0.06 * Math.sin(t * 0.27) + 0.02 * Math.sin(t * 0.71)));
        ty = h * (rest[1] + sway * (0.05 * Math.sin(t * 0.21 + 1.3) + 0.015 * Math.cos(t * 0.63)));
      } else {
        tx = s.x;
        ty = s.y;
        ta = 0;
      }

      if (!s.placed) {
        s.x = tx;
        s.y = ty;
        s.placed = true;
      }
      const follow = 1 - Math.exp(-dt * (still ? 40 : 9));
      s.x += (tx - s.x) * follow;
      s.y += (ty - s.y) * follow;
      s.alpha += (ta - s.alpha) * (1 - Math.exp(-dt * 7));

      const ox = s.x - box / 2;
      const oy = s.y - box / 2;
      canvas.style.transform = `translate3d(${ox.toFixed(2)}px, ${oy.toFixed(2)}px, 0)`;
      renderer.render({
        host: [w, h],
        origin: [ox, oy],
        size: [box, box],
        center: [s.x, s.y],
        radius: radius * (0.86 + 0.14 * s.alpha),
        cover: fit === 'cover',
        alpha: s.alpha,
      });

      const settled = Math.abs(tx - s.x) < 0.05 && Math.abs(ty - s.y) < 0.05 && Math.abs(ta - s.alpha) < 0.002;
      const drifting = !still && !s.pointer && !s.pinned && rest;
      if (visible && (!settled || drifting)) raf = requestAnimationFrame(frame);
    };

    const kick = () => {
      if (raf || !ready || !visible || disposed) return;
      s.last = performance.now();
      raf = requestAnimationFrame(frame);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      s.pointer = { x: e.clientX, y: e.clientY };
      kick();
    };
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      s.pointer = null;
      kick();
    };
    // On touch screens a tap places the lens; dragging is left to scrolling.
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== 'touch' || !rest) return;
      const rect = host.getBoundingClientRect();
      s.pinned = [(e.clientX - rect.left) / rect.width, (e.clientY - rect.top) / rect.height];
      kick();
    };

    host.addEventListener('pointermove', onMove);
    host.addEventListener('pointerleave', onLeave);
    host.addEventListener('pointerdown', onDown);
    window.addEventListener('scroll', kick, { passive: true });

    const resize = new ResizeObserver(() => {
      layout();
      kick();
    });
    resize.observe(host);

    const view = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) kick();
    });
    view.observe(host);

    // Fetch the smallest variant that stays sharp under magnification at this size.
    const { width: iw, height: ih } = photo(id);
    const shown = fit === 'cover' ? Math.max(host.clientWidth, host.clientHeight * (iw / ih)) : host.clientWidth;
    // Wait for the page itself to finish loading so the texture never competes with it.
    const image = new Image();
    const load = () => {
      image.decoding = 'async';
      image.fetchPriority = 'low';
      image.src = src(id, shown * Math.min(window.devicePixelRatio || 1, 2) * MAGNIFICATION);
      image
        .decode()
        .then(() => {
          if (disposed) return;
          renderer.setImage(image);
          ready = true;
          kick();
        })
        .catch(() => {});
    };
    if (document.readyState === 'complete') load();
    else window.addEventListener('load', load, { once: true });

    return () => {
      disposed = true;
      window.removeEventListener('load', load);
      cancelAnimationFrame(raf);
      host.removeEventListener('pointermove', onMove);
      host.removeEventListener('pointerleave', onLeave);
      host.removeEventListener('pointerdown', onDown);
      window.removeEventListener('scroll', kick);
      resize.disconnect();
      view.disconnect();
      renderer.dispose();
    };
  }, [id, fit, rest?.[0], rest?.[1], size]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute top-0 left-0 size-0 will-change-transform"
    />
  );
}
