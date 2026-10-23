/** A lens and its glint. The dot sits where the loupe's highlight falls (GLINT in lib/lens.ts). */
export function LensMark({ className, weight = 3.5 }: { className?: string; weight?: number }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeLinecap="round" className={className} aria-hidden="true">
      <circle cx="32" cy="32" r="25" strokeWidth={weight} />
      <circle cx="23" cy="23" r={weight * 1.3} fill="currentColor" stroke="none" />
    </svg>
  );
}

export function Arrow({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" aria-hidden="true">
      {dir === 'left' ? <path d="M19 12H5m6-6-6 6 6 6" /> : <path d="M5 12h14m-6-6 6 6-6 6" />}
    </svg>
  );
}

export function Cross() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" aria-hidden="true">
      <path d="M5 5l14 14M19 5 5 19" />
    </svg>
  );
}
