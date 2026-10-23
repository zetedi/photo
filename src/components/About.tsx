import { useParallax } from '@/hooks/useParallax';
import { Link } from '@/router';
import { Picture } from './Picture';
import { Reveal } from './Reveal';

const About = () => {
  const portrait = useParallax<HTMLDivElement>(0.07);

  return (
    <section className="grid items-center gap-x-gutter gap-y-14 px-gutter py-[clamp(6rem,14vw,12rem)] lg:grid-cols-12">
      <Reveal className="lg:col-span-5">
        <div className="relative aspect-[4/5] overflow-hidden bg-paper-2">
          <div ref={portrait} className="absolute inset-x-0 -top-[7%] h-[114%]">
            <Picture
              id="zoltan"
              alt="Zoltán Etédi kneeling in a sunlit garden, camera in hand."
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="size-full object-cover object-[45%_50%]"
            />
          </div>
        </div>
      </Reveal>

      <div className="lg:col-span-6 lg:col-start-7">
        <Reveal>
          <p className="eyebrow">02 — About</p>
          <h1 className="display mt-5 text-[clamp(2.75rem,5.4vw,5.75rem)]">
            Hello, I’m <em>Zoltán&nbsp;Etédi</em>.
          </h1>
        </Reveal>
        <Reveal delay={120}>
          <p className="mt-10 font-serif text-[clamp(1.4rem,2.1vw,2rem)] leading-[1.3] text-ink-2">
            My intention is to capture pearls of moments of creation, of joy, flow, inspiration, devotion, reconnection with
            nature and the divine essence, seeding light into matter.
          </p>
        </Reveal>
        <Reveal delay={220}>
          <p className="mt-8 max-w-md leading-relaxed text-ink-2">I’d like to help you create your new world.</p>
          <Link to="/contact" className="eyebrow link-line mt-10 inline-block pb-0.5 text-ink!">
            Begin a conversation →
          </Link>
        </Reveal>
      </div>
    </section>
  );
};

export default About;
