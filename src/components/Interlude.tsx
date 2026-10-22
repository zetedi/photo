import { useParallax } from '@/hooks/useParallax';
import { site } from '@/site';
import { Glass } from './Glass';
import { Picture } from './Picture';
import { Reveal } from './Reveal';

/** A breath between the work and the person: one photograph seen through glass. */
const Interlude = () => {
  const layer = useParallax<HTMLDivElement>(0.12);

  return (
    <section aria-label="Interlude" className="relative h-[88svh] min-h-[32rem] overflow-hidden">
      <div ref={layer} className="absolute inset-x-0 -top-[12%] h-[124%]">
        <Picture
          id="8"
          alt="Low mist drifting above a green alpine valley dotted with chalets, beneath a snow-dusted forest."
          sizes="100vw"
          className="size-full object-cover"
        />
      </div>
      <div className="relative grid h-full place-items-center px-gutter">
        {/* The pane itself never fades: a translucent ancestor would cut it off from the photo behind. */}
        <Glass as="figure" radius={36} bezel={30} depth={1.1} className="glass-strong max-w-[34rem] px-9 py-10 text-center sm:px-14 sm:py-12">
          <Reveal>
            <blockquote className="text-[clamp(1.9rem,3.4vw,3rem)] leading-[1.08] italic">
              “…seeding light <br />
              into matter.”
            </blockquote>
            <figcaption className="eyebrow mt-6 text-ink-2!">{site.photographer}</figcaption>
          </Reveal>
        </Glass>
      </div>
    </section>
  );
};

export default Interlude;
