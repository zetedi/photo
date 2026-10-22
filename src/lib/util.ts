export const cx = (...classes: (string | false | null | undefined)[]) => classes.filter(Boolean).join(' ');

export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const prefersReducedMotion = () =>
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export const pad = (n: number) => String(n).padStart(2, '0');
