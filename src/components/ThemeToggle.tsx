import { useId, type MouseEvent } from 'react';
import { flushSync } from 'react-dom';
import { useTheme } from '@/hooks/useTheme';
import { prefersReducedMotion } from '@/lib/util';

/** Sun / moon switch. Night falls as a widening circle from the button. */
export function ThemeToggle() {
  const [theme, setTheme] = useTheme();
  const maskId = `moon${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const dark = theme === 'dark';

  const toggle = (e: MouseEvent<HTMLButtonElement>) => {
    const next = dark ? 'light' : 'dark';
    if (!document.startViewTransition || prefersReducedMotion()) {
      setTheme(next);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const transition = document.startViewTransition(() => flushSync(() => setTheme(next)));
    transition.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
        { duration: 1100, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', pseudoElement: '::view-transition-new(root)' },
      );
    });
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? 'Switch to day mode' : 'Switch to night mode'}
      aria-pressed={dark}
      className="group grid size-9 place-items-center rounded-full text-ink transition-colors hover:bg-ink/5"
    >
      <svg viewBox="0 0 24 24" className="size-[18px] overflow-visible" aria-hidden="true">
        <mask id={maskId}>
          <rect x="-4" y="-4" width="32" height="32" fill="white" />
          <circle
            cx={dark ? 17 : 30}
            cy={dark ? 7 : -6}
            r="6.5"
            fill="black"
            className="transition-all duration-700 ease-(--ease-silk)"
          />
        </mask>
        <circle
          cx="12"
          cy="12"
          r={dark ? 8 : 4.5}
          fill="currentColor"
          mask={`url(#${maskId})`}
          className="transition-all duration-700 ease-(--ease-silk)"
        />
        <g
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          className="origin-center transition-all duration-700 ease-(--ease-silk)"
          style={{ opacity: dark ? 0 : 1, transform: dark ? 'rotate(-60deg) scale(0.4)' : 'none' }}
        >
          {Array.from({ length: 8 }, (_, i) => {
            const a = (i * Math.PI) / 4;
            return (
              <line
                key={i}
                x1={12 + Math.cos(a) * 7.5}
                y1={12 + Math.sin(a) * 7.5}
                x2={12 + Math.cos(a) * 9.5}
                y2={12 + Math.sin(a) * 9.5}
              />
            );
          })}
        </g>
      </svg>
    </button>
  );
}
