import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { shine, useFlash } from '@/hooks/useFlash';
import { useParallax } from '@/hooks/useParallax';
import { Link } from '@/router';
import { site } from '@/site';
import { cx } from '@/lib/util';
import { Glass } from './Glass';
import { Loupe } from './Loupe';
import { Picture } from './Picture';

const Hero = () => {
  const [shown, setShown] = useState(false);
  const photo = useParallax<HTMLDivElement>(0.08);
  const copy = useParallax<HTMLDivElement>(-0.06);
  const word = useRef<HTMLElement>(null);
  // The flash lights up the headline's last word.
  const { bind, flash } = useFlash(() => shine(word.current, { swell: true }));

  const lines = [<>Creating worlds</>, <>through capturing</>, <em ref={word}>light</em>];

  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <section className={cx('relative lg:grid lg:min-h-svh lg:grid-cols-12', shown && 'is-in')}>
      <div className="relative flex flex-col px-gutter pt-32 pb-14 lg:col-span-5 lg:pt-40 lg:pb-[calc(var(--gutter)*1.2)]">
        <div ref={copy} className="flex flex-1 flex-col">
          <p className="eyebrow reveal" style={{ '--delay': '150ms' } as CSSProperties}>
            {site.photographer} — Photography
          </p>

          <h1 className="display mt-auto pt-16 text-[clamp(3.1rem,5vw,8rem)] lg:pt-0">
            {lines.map((line, i) => (
              <span key={i} className="line-mask">
                <span style={{ '--delay': `${250 + i * 110}ms` } as CSSProperties}>{line}</span>
              </span>
            ))}
          </h1>

          <p className="reveal mt-8 max-w-[26rem] text-[0.95rem] leading-relaxed text-ink-2" style={{ '--delay': '700ms' } as CSSProperties}>
            Creative photography without limitations. It’s your time and the place of your choice.
          </p>

          <div className="reveal mt-10 flex flex-wrap items-center gap-x-8 gap-y-4" style={{ '--delay': '820ms' } as CSSProperties}>
            <Glass as={Link} to="/contact" bezel={12} className="eyebrow group inline-flex h-12 items-center gap-3 px-6 text-ink!">
              Book a session
              <span aria-hidden="true" className="transition-transform duration-500 ease-(--ease-silk) group-hover:translate-x-1">
                →
              </span>
            </Glass>
            <Link to="/work" className="eyebrow link-line pb-0.5 text-ink-2!">
              View the work
            </Link>
          </div>
        </div>

        <div className="reveal mt-16 hidden items-center gap-4 lg:flex" style={{ '--delay': '1100ms' } as CSSProperties} aria-hidden="true">
          <span className="relative h-10 w-px overflow-hidden bg-line">
            <span className="scroll-cue absolute inset-0 bg-ink" />
          </span>
          <span className="eyebrow">Scroll</span>
        </div>
      </div>

      <div
        {...bind}
        className="relative mx-gutter aspect-[4/5] overflow-hidden sm:aspect-[3/2] lg:col-span-7 lg:mx-0 lg:aspect-auto lg:h-svh"
      >
        <div ref={photo} className="absolute inset-x-0 -top-[8%] h-[116%]">
          <Picture
            id="bg"
            alt="Seaweed-covered rocks at low tide, glowing gold in the low evening light."
            sizes="(min-width: 1024px) 58vw, 100vw"
            priority
            className="size-full object-cover"
          />
          <Loupe id="bg" rest={[0.52, 0.48]} />
        </div>
        {flash}
      </div>
    </section>
  );
};

export default Hero;
