import { prefersReducedMotion } from '@/lib/util';
import { site } from '@/site';
import { LensMark } from './icons';

const Footer = () => {
  return (
    <footer className="@container overflow-hidden px-gutter pt-[clamp(5rem,10vw,9rem)] pb-8">
      <div className="flex flex-wrap items-center justify-between gap-6 border-t border-line pt-8">
        <nav aria-label="Social" className="flex gap-8">
          {site.socials.map((s) => (
            <a key={s.label} href={s.href} className="eyebrow link-line pb-0.5 text-ink-2!">
              {s.label}
            </a>
          ))}
        </nav>
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'instant' : 'smooth' })}
          className="eyebrow link-line cursor-pointer pb-0.5 text-ink-2!"
        >
          Back to top ↑
        </button>
      </div>

      <p
        className="display mt-[clamp(3rem,8vw,7rem)] flex items-center gap-[0.12em] text-[14.2cqi] leading-[0.85] tracking-[-0.03em] whitespace-nowrap"
        aria-hidden="true"
      >
        {/* Pulled left by the ring's inset in its viewBox, so the ink starts on the margin. */}
        <LensMark weight={1.4} className="-ml-[0.09em] size-[0.95em] shrink-0" />
        <span>
          The Divine <em>Story</em>
        </span>
      </p>

      <div className="mt-10 flex flex-wrap justify-between gap-4">
        <p className="eyebrow">
          &copy; {new Date().getFullYear()} {site.name}
        </p>
        <p className="eyebrow">Photography by {site.photographer}</p>
      </div>
    </footer>
  );
};

export default Footer;
