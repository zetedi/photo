import { useRef, type ReactNode } from 'react';
import { shine, useFlash } from '@/hooks/useFlash';
import { useParallax } from '@/hooks/useParallax';
import { works, type PhotoId } from '@/photos';
import { cx } from '@/lib/util';
import { Glass } from './Glass';
import { Loupe } from './Loupe';
import { Picture } from './Picture';
import { Reveal } from './Reveal';

interface InterludeProps {
  /** One of the works; its alt text comes from the portfolio. */
  id: PhotoId;
  /** Mark the word that catches the flash with `data-shine="<the word>"`. */
  quote: ReactNode;
  /** Where the glass sits: centred, or low and to the right to keep the subject clear. */
  place?: 'center' | 'low-end';
  /** A loupe over the photo: where it rests (0–1 of the photo), its size and its strength. */
  lens?: { rest: [number, number]; size: number; magnification: number };
  className?: string;
}

/** A breath between pages of work: one photograph, a line of words seen through glass. */
const Interlude = ({ id, quote, place = 'center', lens, className }: InterludeProps) => {
  const layer = useParallax<HTMLDivElement>(0.12);
  const words = useRef<HTMLQuoteElement>(null);
  const { bind, flash } = useFlash(() => shine(words.current?.querySelector('[data-shine]'), { swell: true }));
  const alt = works.find((w) => w.id === id)?.alt ?? '';

  return (
    <section aria-label="Interlude" className={cx('relative h-[88svh] min-h-[32rem] overflow-hidden', className)}>
      <div ref={layer} {...bind} className="absolute inset-x-0 -top-[12%] h-[124%]">
        <Picture id={id} alt={alt} sizes="100vw" className="size-full object-cover" />
        {lens && <Loupe id={id} rest={lens.rest} size={lens.size} magnification={lens.magnification} />}
        {flash}
      </div>
      {/* Lets the photo underneath take the pointer; only the glass itself is solid. */}
      <div
        className={cx(
          'pointer-events-none relative grid h-full px-gutter',
          place === 'center'
            ? 'place-items-center'
            : 'items-end justify-items-center pb-[9svh] md:justify-items-end md:pr-[7vw] md:pb-[11svh]',
        )}
      >
        {/* The pane itself never fades: a translucent ancestor would cut it off from the photo behind. */}
        <Glass
          as="figure"
          radius={36}
          bezel={30}
          depth={1.1}
          className="glass-strong pointer-events-auto max-w-[34rem] px-9 py-10 text-center sm:px-14 sm:py-12"
        >
          <Reveal>
            <blockquote ref={words} className="text-[clamp(1.9rem,3.4vw,3rem)] leading-[1.08] italic">
              {quote}
            </blockquote>
          </Reveal>
        </Glass>
      </div>
    </section>
  );
};

export default Interlude;
