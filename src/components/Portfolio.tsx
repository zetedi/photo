import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react';
import { photo, works } from '@/photos';
import { clamp, pad, prefersReducedMotion } from '@/lib/util';
import { Glass } from './Glass';
import { Arrow } from './icons';
import LightBox from './LightBox';
import { Picture } from './Picture';
import { Reveal } from './Reveal';

const Portfolio = () => {
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const suppressClick = useRef(false);

  const slides = () => Array.from(trackRef.current?.children ?? []) as HTMLElement[];
  const snapOffset = () => parseFloat(getComputedStyle(trackRef.current!).scrollPaddingInlineStart) || 0;

  // Scroll-linked state: the active slide, the scroll thumb and each photo's drift.
  useEffect(() => {
    const track = trackRef.current!;
    let raf = 0;
    const update = () => {
      raf = 0;
      const offset = snapOffset();
      const left = track.scrollLeft;
      const view = track.clientWidth;
      let nearest = 0;
      let best = Infinity;
      slides().forEach((slide, i) => {
        const distance = Math.abs(slide.offsetLeft - offset - left);
        if (distance < best) [best, nearest] = [distance, i];
        const shift = clamp((slide.offsetLeft + slide.offsetWidth / 2 - (left + view / 2)) / view, -1, 1);
        slide.style.setProperty('--shift', shift.toFixed(4));
      });
      // At the very end the last slides can't reach the snap line; count them as reached.
      if (left >= track.scrollWidth - view - 2) nearest = works.length - 1;
      setActive(nearest);
      const ratio = view / track.scrollWidth;
      const progress = left / Math.max(1, track.scrollWidth - view);
      thumbRef.current!.style.width = `${ratio * 100}%`;
      thumbRef.current!.style.transform = `translateX(${progress * (1 / ratio - 1) * 100}%)`;
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    track.addEventListener('scroll', schedule, { passive: true });
    const resize = new ResizeObserver(schedule);
    resize.observe(track);
    return () => {
      cancelAnimationFrame(raf);
      track.removeEventListener('scroll', schedule);
      resize.disconnect();
    };
  }, []);

  const goTo = useCallback((index: number) => {
    const track = trackRef.current!;
    const target = slides()[clamp(index, 0, works.length - 1)];
    track.scrollTo({ left: target.offsetLeft - snapOffset(), behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  }, []);

  // Mouse drag with a little momentum. Touch and trackpads use native scrolling.
  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    suppressClick.current = false;
    const track = trackRef.current!;
    const startX = e.clientX;
    const startLeft = track.scrollLeft;
    let dragging = false;
    let velocity = 0;
    let lastX = startX;
    let lastT = e.timeStamp;

    const move = (ev: PointerEvent) => {
      const dx = ev.clientX - startX;
      if (!dragging && Math.abs(dx) > 5) {
        dragging = true;
        track.dataset.dragging = '';
      }
      if (!dragging) return;
      const dt = Math.max(1, ev.timeStamp - lastT);
      velocity = 0.8 * ((ev.clientX - lastX) / dt) + 0.2 * velocity;
      lastX = ev.clientX;
      lastT = ev.timeStamp;
      track.scrollLeft = startLeft - dx;
    };

    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      if (!dragging) return;
      suppressClick.current = true;
      const offset = snapOffset();
      const projected = track.scrollLeft - clamp(velocity, -2.5, 2.5) * 260;
      const positions = slides().map((s) => s.offsetLeft - offset);
      const index = positions.reduce((best, p, i) => (Math.abs(p - projected) < Math.abs(positions[best] - projected) ? i : best), 0);
      const release = () => delete track.dataset.dragging;
      track.addEventListener('scrollend', release, { once: true });
      setTimeout(release, 900);
      track.scrollTo({ left: positions[index], behavior: 'smooth' });
    };

    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      goTo(active + (e.key === 'ArrowRight' ? 1 : -1));
    }
  };

  return (
    <section className="py-[clamp(6rem,13vw,11rem)]">
      <div className="flex flex-wrap items-end justify-between gap-8 px-gutter">
        <Reveal>
          <p className="eyebrow">01 — Portfolio</p>
          <h1 className="display mt-5 text-[clamp(2.75rem,5.4vw,5.75rem)]">
            Selected <em>works</em>
          </h1>
        </Reveal>
        <Reveal delay={120} className="flex items-center gap-6">
          <p className="font-serif text-2xl lining-nums tabular-nums" aria-live="polite">
            <span className="sr-only">Photograph </span>
            {pad(active + 1)}
            <span className="text-ink-3"> / {pad(works.length)}</span>
          </p>
          <div className="flex gap-2">
            <Glass
              as="button"
              type="button"
              bezel={12}
              onClick={() => goTo(active - 1)}
              disabled={active === 0}
              aria-label="Previous photograph"
              className="grid size-12 place-items-center text-ink transition-opacity disabled:opacity-35"
            >
              <Arrow dir="left" />
            </Glass>
            <Glass
              as="button"
              type="button"
              bezel={12}
              onClick={() => goTo(active + 1)}
              disabled={active === works.length - 1}
              aria-label="Next photograph"
              className="grid size-12 place-items-center text-ink transition-opacity disabled:opacity-35"
            >
              <Arrow dir="right" />
            </Glass>
          </div>
        </Reveal>
      </div>

      <Reveal delay={200}>
        <div
          ref={trackRef}
          role="region"
          aria-roledescription="carousel"
          aria-label="Selected works"
          tabIndex={0}
          onKeyDown={onKeyDown}
          onPointerDown={onPointerDown}
          onClickCapture={(e) => {
            if (suppressClick.current) {
              e.stopPropagation();
              e.preventDefault();
              suppressClick.current = false;
            }
          }}
          className="carousel-track relative mt-14 flex gap-[clamp(0.75rem,2vw,2rem)] overflow-x-auto scroll-px-gutter px-gutter pb-2 focus-visible:outline-offset-[-2px]"
        >
          {works.map((work, i) => {
            const p = photo(work.id);
            return (
              <figure
                key={work.id}
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${works.length}`}
                className="carousel-slide shrink-0"
              >
                <button
                  type="button"
                  onClick={() => setSelected(i)}
                  aria-label={`Open “${work.title}”`}
                  className="carousel-frame relative block cursor-[inherit] overflow-hidden bg-paper-2"
                  style={{ aspectRatio: `${p.width} / ${p.height}` }}
                >
                  <Picture
                    id={work.id}
                    alt={work.alt}
                    sizes="(min-width: 768px) 75vw, 84vw"
                    className="h-full object-cover"
                  />
                </button>
                <figcaption className="mt-4 flex items-baseline gap-3">
                  <span className="eyebrow tabular-nums">{pad(i + 1)}</span>
                  <span className="font-serif text-lg italic">{work.title}</span>
                </figcaption>
              </figure>
            );
          })}
        </div>
      </Reveal>

      <div className="mx-gutter mt-10 h-px bg-line" aria-hidden="true">
        <div ref={thumbRef} className="h-px bg-ink will-change-transform" />
      </div>

      <LightBox items={works} index={selected} onChange={setSelected} onClose={() => setSelected(null)} />
    </section>
  );
};

export default Portfolio;
