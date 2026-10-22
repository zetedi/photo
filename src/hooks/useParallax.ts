import { useEffect, useRef } from 'react';
import { clamp, prefersReducedMotion } from '@/lib/util';

/*
 * One scroll listener and one animation frame drive every parallax layer.
 * A layer is measured through its parent (which never moves), so the
 * transform never feeds back into its own position.
 */

interface Layer {
  el: HTMLElement;
  frame: HTMLElement;
  amount: number;
}

const layers = new Set<Layer>();
let pending = 0;

function update() {
  pending = 0;
  const vh = window.innerHeight;
  for (const { el, frame, amount } of layers) {
    const r = frame.getBoundingClientRect();
    if (r.bottom < -vh * 0.25 || r.top > vh * 1.25) continue;
    // -1 while the frame enters at the bottom, 0 when centred, 1 as it leaves at the top.
    const progress = clamp((vh / 2 - (r.top + r.height / 2)) / (vh / 2 + r.height / 2), -1, 1);
    el.style.transform = `translate3d(0, ${(progress * amount * r.height).toFixed(2)}px, 0)`;
  }
}

function schedule() {
  if (!pending) pending = requestAnimationFrame(update);
}

/**
 * Moves an element against the scroll. `amount` is the travel either side of
 * centre as a fraction of the parent's height — a layer that overhangs its
 * frame by 10% top and bottom can use 0.1 without ever showing an edge.
 */
export function useParallax<T extends HTMLElement>(amount: number) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    const frame = el?.parentElement;
    if (!el || !frame || prefersReducedMotion()) return;

    const layer = { el, frame, amount };
    layers.add(layer);
    if (layers.size === 1) {
      window.addEventListener('scroll', schedule, { passive: true });
      window.addEventListener('resize', schedule);
    }
    schedule();

    return () => {
      layers.delete(layer);
      el.style.transform = '';
      if (!layers.size) {
        window.removeEventListener('scroll', schedule);
        window.removeEventListener('resize', schedule);
      }
    };
  }, [amount]);

  return ref;
}
