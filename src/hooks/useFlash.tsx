import { useRef, type MouseEvent, type PointerEvent } from 'react';
import { prefersReducedMotion } from '@/lib/util';

const DOUBLE_TAP = { ms: 350, px: 40 };

/**
 * A camera flash for a photograph: it blooms white from where it was fired, then
 * decays. A click fires it; on touch screens a single tap moves the loupe, so it
 * takes a double tap. Spread `bind` on the element that holds the photo and
 * render `flash` inside it.
 */
export function useFlash(onFire?: () => void) {
  const layer = useRef<HTMLDivElement>(null);
  const byTouch = useRef(false);
  const lastTap = useRef({ t: -Infinity, x: 0, y: 0 });

  const fire = (x: number, y: number) => {
    const el = layer.current!;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--fx', `${x - rect.left}px`);
    el.style.setProperty('--fy', `${y - rect.top}px`);
    const gentle = prefersReducedMotion();
    el.getAnimations().forEach((a) => a.cancel());
    el.animate([{ opacity: 0 }, { opacity: gentle ? 0.3 : 1, offset: 0.05 }, { opacity: 0 }], {
      duration: gentle ? 1400 : 1000,
      easing: 'cubic-bezier(0.2, 0.6, 0.3, 1)',
    });
    onFire?.();
  };

  const bind = {
    onPointerDown: (e: PointerEvent) => {
      byTouch.current = e.pointerType === 'touch';
    },
    onClick: (e: MouseEvent) => {
      if (!byTouch.current) return fire(e.clientX, e.clientY);
      const prev = lastTap.current;
      if (e.timeStamp - prev.t < DOUBLE_TAP.ms && Math.hypot(e.clientX - prev.x, e.clientY - prev.y) < DOUBLE_TAP.px) {
        lastTap.current = { t: -Infinity, x: 0, y: 0 };
        fire(e.clientX, e.clientY);
      } else {
        lastTap.current = { t: e.timeStamp, x: e.clientX, y: e.clientY };
      }
    },
    // Double taps are ours, not the browser's zoom.
    style: { touchAction: 'manipulation' },
  } as const;

  const flash = <div ref={layer} aria-hidden="true" className="flash pointer-events-none absolute inset-0 opacity-0" />;

  return { bind, flash };
}

/** Let a word catch the flash (see `.shine`); `swell` also makes it bolder for a moment. */
export function shine(el: Element | null | undefined, { swell = false } = {}) {
  if (!el) return;
  el.classList.remove('shine', 'swell');
  void (el as HTMLElement).offsetWidth; // restart the animation on a repeat flash
  el.classList.add('shine', ...(swell ? ['swell'] : []));
  el.addEventListener('animationend', () => el.classList.remove('shine', 'swell'), { once: true });
}
