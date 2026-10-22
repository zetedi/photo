import type { ReactNode } from 'react';
import { useParallax } from '@/hooks/useParallax';
import { works, type PhotoId } from '@/photos';
import { site } from '@/site';
import { cx } from '@/lib/util';
import { Glass } from './Glass';
import { Picture } from './Picture';
import { Reveal } from './Reveal';

interface InterludeProps {
  /** One of the works; its alt text comes from the portfolio. */
  id: PhotoId;
  quote: ReactNode;
  /** Where the glass sits: centred, or low and to the right to keep the subject clear. */
  place?: 'center' | 'low-end';
  className?: string;
}

/** A breath between pages of work: one photograph, a line of words seen through glass. */
const Interlude = ({ id, quote, place = 'center', className }: InterludeProps) => {
  const layer = useParallax<HTMLDivElement>(0.12);
  const alt = works.find((w) => w.id === id)?.alt ?? '';

  return (
    <section aria-label="Interlude" className={cx('relative h-[88svh] min-h-[32rem] overflow-hidden', className)}>
      <div ref={layer} className="absolute inset-x-0 -top-[12%] h-[124%]">
        <Picture id={id} alt={alt} sizes="100vw" className="size-full object-cover" />
      </div>
      <div
        className={cx(
          'relative grid h-full px-gutter',
          place === 'center'
            ? 'place-items-center'
            : 'items-end justify-items-center pb-[9svh] md:justify-items-end md:pr-[7vw] md:pb-[11svh]',
        )}
      >
        {/* The pane itself never fades: a translucent ancestor would cut it off from the photo behind. */}
        <Glass as="figure" radius={36} bezel={30} depth={1.1} className="glass-strong max-w-[34rem] px-9 py-10 text-center sm:px-14 sm:py-12">
          <Reveal>
            <blockquote className="text-[clamp(1.9rem,3.4vw,3rem)] leading-[1.08] italic">{quote}</blockquote>
            <figcaption className="eyebrow mt-6 text-ink-2!">{site.photographer}</figcaption>
          </Reveal>
        </Glass>
      </div>
    </section>
  );
};

export default Interlude;
