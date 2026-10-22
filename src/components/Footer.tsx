import { site } from '@/site';
import { LensMark } from './icons';

const Footer = () => {
  return (
    <footer className="overflow-hidden px-gutter pt-[clamp(5rem,10vw,9rem)] pb-8">
      <div className="flex flex-wrap items-center justify-between gap-6 border-t border-line pt-8">
        <nav aria-label="Social" className="flex gap-8">
          {site.socials.map((s) => (
            <a key={s.label} href={s.href} className="eyebrow link-line pb-0.5 text-ink-2!">
              {s.label}
            </a>
          ))}
        </nav>
        <a href="#top" className="eyebrow link-line pb-0.5 text-ink-2!">
          Back to top ↑
        </a>
      </div>

      <p
        className="display mt-[clamp(3rem,8vw,7rem)] flex items-center gap-[0.12em] text-[13.6vw] leading-[0.85] tracking-[-0.03em] whitespace-nowrap"
        aria-hidden="true"
      >
        <LensMark weight={1.6} className="size-[0.6em] shrink-0 translate-y-[0.04em]" />
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
