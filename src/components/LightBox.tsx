import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { srcSet, type Work } from '@/photos';
import { site } from '@/site';
import { pad, prefersReducedMotion } from '@/lib/util';
import { Glass } from './Glass';
import { Arrow, Cross } from './icons';
import { Loupe } from './Loupe';
import { Picture } from './Picture';

interface LightBoxProps {
  items: Work[];
  index: number | null;
  onChange: (index: number) => void;
  onClose: () => void;
}

const SIZES = '(min-width: 1024px) 80vw, 100vw';

const LightBox = ({ items, index, onChange, onClose }: LightBoxProps) => {
  const ref = useRef<HTMLDialogElement>(null);
  // Keep showing the last photo while the dialog fades out.
  const [shown, setShown] = useState<number | null>(index);
  const swipe = useRef<number | null>(null);

  useEffect(() => {
    if (index === null) return;
    setShown(index);
    const dialog = ref.current!;
    if (!dialog.open) dialog.showModal();
  }, [index]);

  const close = useCallback(() => {
    const dialog = ref.current!;
    if (!dialog.open || 'closing' in dialog.dataset) return;
    if (prefersReducedMotion()) return dialog.close();
    dialog.dataset.closing = '';
    setTimeout(() => {
      delete dialog.dataset.closing;
      dialog.close();
    }, 380);
  }, []);

  const step = useCallback(
    (dir: 1 | -1) => shown !== null && onChange((shown + dir + items.length) % items.length),
    [shown, items.length, onChange],
  );

  // Warm the neighbours so stepping through is instant.
  useEffect(() => {
    if (shown === null) return;
    for (const dir of [1, -1]) {
      const img = new Image();
      img.sizes = SIZES;
      img.srcset = srcSet(items[(shown + dir + items.length) % items.length].id);
    }
  }, [shown, items]);

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') step(1);
    if (e.key === 'ArrowLeft') step(-1);
  };

  const onPointerDown = (e: PointerEvent) => {
    if (e.pointerType === 'touch') swipe.current = e.clientX;
  };
  const onPointerUp = (e: PointerEvent) => {
    if (swipe.current === null) return;
    const dx = e.clientX - swipe.current;
    swipe.current = null;
    if (Math.abs(dx) > 48) step(dx < 0 ? 1 : -1);
  };

  const item = shown !== null ? items[shown] : null;

  return (
    <dialog
      ref={ref}
      className="lightbox"
      aria-label="Photograph viewer"
      onKeyDown={onKeyDown}
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onClose={() => {
        setShown(null);
        onClose();
      }}
    >
      {item && shown !== null && (
        <div className="grid h-full grid-rows-[auto_minmax(0,1fr)_auto] px-gutter">
          <div className="flex h-20 items-center justify-between">
            <p className="font-serif text-[1.3rem] italic">{site.name}</p>
            <Glass as="button" type="button" bezel={12} onClick={close} aria-label="Close viewer" className="grid size-12 place-items-center text-ink">
              <Cross />
            </Glass>
          </div>

          <div
            className="grid min-h-0 place-items-center"
            onClick={(e) => e.target === e.currentTarget && close()}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
          >
            <figure key={item.id} className="figure-in relative overflow-hidden">
              <Picture
                id={item.id}
                alt={item.alt}
                sizes={SIZES}
                loading="eager"
                className="block h-auto max-h-[calc(100svh-11rem)] w-auto max-w-[calc(100vw-var(--gutter)*2)] cursor-zoom-in select-none"
              />
              <Loupe id={item.id} fit="fill" size={0.14} />
            </figure>
          </div>

          <div className="flex h-24 items-center justify-between gap-6">
            <p className="flex min-w-0 items-baseline gap-3">
              <span className="eyebrow tabular-nums">{pad(shown + 1)}</span>
              <span className="truncate font-serif text-xl italic">{item.title}</span>
            </p>
            <div className="flex shrink-0 items-center gap-5">
              <p className="hidden font-serif text-xl lining-nums tabular-nums sm:block">
                {pad(shown + 1)}
                <span className="text-ink-3"> / {pad(items.length)}</span>
              </p>
              <div className="flex gap-2">
                <Glass as="button" type="button" bezel={12} onClick={() => step(-1)} aria-label="Previous photograph" className="grid size-12 place-items-center text-ink">
                  <Arrow dir="left" />
                </Glass>
                <Glass as="button" type="button" bezel={12} onClick={() => step(1)} aria-label="Next photograph" className="grid size-12 place-items-center text-ink">
                  <Arrow dir="right" />
                </Glass>
              </div>
            </div>
          </div>
        </div>
      )}
    </dialog>
  );
};

export default LightBox;
