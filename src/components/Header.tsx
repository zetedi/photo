import { useEffect, useState } from 'react';
import { Link, usePath } from '@/router';
import { pages, site } from '@/site';
import { cx, pad } from '@/lib/util';
import { Glass } from './Glass';
import { LensMark } from './icons';
import { ThemeToggle } from './ThemeToggle';

const Header = () => {
  const [open, setOpen] = useState(false);
  const path = usePath();

  useEffect(() => {
    if (!open) return;
    document.documentElement.dataset.locked = '';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      delete document.documentElement.dataset.locked;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <>
      <header className="site-header pointer-events-none fixed inset-x-0 top-0 z-50 flex items-start justify-between gap-4 p-[calc(var(--gutter)*0.6)] pt-4 md:pt-5">
        <Glass
          as={Link}
          to="/"
          onClick={() => setOpen(false)}
          bezel={13}
          className="pointer-events-auto flex h-12 items-center gap-2 pr-5 pl-2.5 text-ink"
          aria-label={`${site.name} — home`}
        >
          {/* Centred in the pill's rounded end, so the ring sits concentric with the glass. */}
          <LensMark className="size-7" />
          <span className="font-serif text-[1.3rem] leading-none italic">{site.name}</span>
        </Glass>

        <Glass bezel={13} className="pointer-events-auto flex h-12 items-center gap-1 pr-1.5 pl-2 md:pl-6">
          <nav aria-label="Main" className="hidden items-center gap-7 pr-4 md:flex">
            {pages.map((p) => (
              <Link
                key={p.path}
                to={p.path}
                aria-current={path === p.path ? 'page' : undefined}
                className="link-line eyebrow pb-0.5 text-ink! transition-colors"
              >
                {p.label}
              </Link>
            ))}
          </nav>
          <span className="mr-1 hidden h-4 w-px bg-line md:block" aria-hidden="true" />
          <ThemeToggle />
          <button
            type="button"
            className="eyebrow grid h-9 place-items-center rounded-full px-3 text-ink! md:hidden"
            aria-expanded={open}
            aria-controls="menu"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? 'Close' : 'Menu'}
          </button>
        </Glass>
      </header>

      <div
        id="menu"
        className={cx(
          'fixed inset-0 z-40 flex flex-col justify-end bg-paper px-gutter pb-14 transition-[opacity,visibility] duration-500 ease-(--ease-silk) md:hidden',
          open ? 'visible opacity-100' : 'invisible opacity-0',
        )}
        aria-hidden={!open}
      >
        <nav aria-label="Mobile" className="flex flex-col gap-2">
          {pages.map((p, i) => (
            <Link
              key={p.path}
              to={p.path}
              aria-current={path === p.path ? 'page' : undefined}
              onClick={() => setOpen(false)}
              tabIndex={open ? 0 : -1}
              className={cx(
                'display flex items-baseline gap-4 text-[3.75rem] transition-[translate,opacity] duration-700 ease-(--ease-silk)',
                open ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0',
              )}
              style={{ transitionDelay: open ? `${120 + i * 70}ms` : '0ms' }}
            >
              <span className="eyebrow">{pad(i + 1)}</span>
              {p.label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Header;
