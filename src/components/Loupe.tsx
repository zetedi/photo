import { useEffect, useRef } from 'react';
import { LensRenderer, baseFor } from '@/lib/lens';
import { clamp, prefersReducedMotion } from '@/lib/util';
import { photo, src, type PhotoId } from '@/photos';

interface LoupeProps {
  /** The photo to magnify; it must be laid out to fill the parent element. */
  id: PhotoId;
  /** How the photo fills its parent: `cover` (object-fit) or exactly (`fill`). */
  fit?: 'cover' | 'fill';
  /** Where the lens rests (0–1 of the parent) when no pointer is over it; null hides it instead. */
  rest?: [number, number] | null;
  /** Lens radius as a fraction of the parent's shorter side. */
  size?: number;
  /** How much the centre of the lens enlarges. */
  magnification?: number;
}

/**
 * A glass loupe that follows the pointer across a photograph; on touch screens
 * it can be picked up and carried with a finger. Mount it inside the element
 * that holds the image, after the image; it listens to that element.
 */
export function Loupe({ id, fit = 'cover', rest = null, size = 0.15, magnification = 1.8 }: LoupeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const handle = handleRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;
    const renderer = LensRenderer.create(canvas);
    if (!renderer) return;

    const still = prefersReducedMotion();
    const base = baseFor(magnification);
    const s = {
      x: 0,
      y: 0,
      alpha: 0,
      lift: 0,
      flare: 0,
      held: false,
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
      radius = clamp(Math.min(w, h) * size, 44, 190);
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
      // A carried lens keeps up with the finger; otherwise it glides.
      const follow = 1 - Math.exp(-dt * (still || s.held ? 34 : 9));
      const [px, py] = [s.x, s.y];
      s.x += (tx - s.x) * follow;
      s.y += (ty - s.y) * follow;
      // Moving glass catches the light: it flares with speed (in radii a second), so
      // the idle drift stays clear, and the flare rises quickly and fades slowly.
      const speed = Math.hypot(s.x - px, s.y - py) / Math.max(dt, 1e-3) / radius;
      const tf = still ? 0 : clamp((speed - 0.4) / 3, 0, 1);
      s.flare += (tf - s.flare) * (1 - Math.exp(-dt * (tf > s.flare ? 10 : 2.5)));
      s.alpha += (ta - s.alpha) * (1 - Math.exp(-dt * 7));
      const tl = s.held ? 1 : 0;
      s.lift += (tl - s.lift) * (1 - Math.exp(-dt * 12));

      const ox = s.x - box / 2;
      const oy = s.y - box / 2;
      const r = radius * (0.86 + 0.14 * s.alpha) * (1 + 0.04 * s.lift);
      canvas.style.transform = `translate3d(${ox.toFixed(2)}px, ${oy.toFixed(2)}px, 0)`;
      if (handle) {
        handle.style.width = handle.style.height = `${(r * 2).toFixed(1)}px`;
        handle.style.transform = `translate3d(${(s.x - r).toFixed(2)}px, ${(s.y - r).toFixed(2)}px, 0)`;
      }
      renderer.render({
        host: [w, h],
        origin: [ox, oy],
        size: [box, box],
        center: [s.x, s.y],
        radius: r,
        cover: fit === 'cover',
        alpha: s.alpha,
        base,
        flare: s.flare,
      });

      const settled =
        Math.abs(tx - s.x) < 0.05 && Math.abs(ty - s.y) < 0.05 && Math.abs(ta - s.alpha) < 0.002 && Math.abs(tl - s.lift) < 0.002 && s.flare < 0.002;
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
    // Touch: a finger that lands on the lens picks it up and carries it; the lens's
    // handle takes no part in scrolling, so the page holds still. Anywhere else the
    // page scrolls as usual (which cancels the touch), and a tap sets the lens down.
    let touch: { id: number; x: number; y: number; dx: number; dy: number; carry: boolean; moved: boolean } | null = null;
    const local = (e: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      return [e.clientX - rect.left, e.clientY - rect.top] as const;
    };
    const place = (x: number, y: number) => {
      s.pinned = [clamp(x / w, 0, 1), clamp(y / h, 0, 1)];
      kick();
    };

    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== 'touch' || !rest || touch) return;
      const [x, y] = local(e);
      const carry = e.target === handle;
      if (carry) handle!.setPointerCapture(e.pointerId);
      touch = { id: e.pointerId, x: e.clientX, y: e.clientY, dx: s.x - x, dy: s.y - y, carry, moved: false };
      s.held = carry;
      kick();
    };
    const onCarry = (e: PointerEvent) => {
      if (e.pointerId !== touch?.id) return;
      touch.moved ||= Math.hypot(e.clientX - touch.x, e.clientY - touch.y) > 8;
      if (!touch.carry) return;
      const [x, y] = local(e);
      place(x + touch.dx, y + touch.dy);
    };
    const onUp = (e: PointerEvent) => {
      if (e.pointerId !== touch?.id) return;
      if (e.type === 'pointerup' && !touch.moved) place(...local(e));
      touch = null;
      s.held = false;
      kick();
    };

    host.addEventListener('pointermove', onMove);
    host.addEventListener('pointerleave', onLeave);
    host.addEventListener('pointerdown', onDown);
    host.addEventListener('pointermove', onCarry);
    host.addEventListener('pointerup', onUp);
    host.addEventListener('pointercancel', onUp);
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
      image.src = src(id, shown * Math.min(window.devicePixelRatio || 1, 2) * magnification);
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
      host.removeEventListener('pointermove', onCarry);
      host.removeEventListener('pointerup', onUp);
      host.removeEventListener('pointercancel', onUp);
      window.removeEventListener('scroll', kick);
      resize.disconnect();
      view.disconnect();
      renderer.dispose();
    };
  }, [id, fit, rest?.[0], rest?.[1], size, magnification]);

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 size-0 will-change-transform"
      />
      {/* What a finger grabs: round, so it never claims a touch beside the lens. */}
      {rest && <div ref={handleRef} aria-hidden="true" className="absolute top-0 left-0 size-0 touch-none rounded-full" />}
    </>
  );
}
