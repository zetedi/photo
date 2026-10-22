import { useSyncExternalStore, type AnchorHTMLAttributes, type MouseEvent, type Ref } from 'react';
import { flushSync } from 'react-dom';
import { prefersReducedMotion } from '@/lib/util';

/*
 * A tiny History API router: a handful of static pages doesn't need more.
 * Page changes cross-fade with a view transition while the header holds still,
 * and each page opens at its top; going back returns to where you were.
 */

const currentPath = () => location.pathname.replace(/(.)\/+$/, '$1');
const listeners = new Set<() => void>();
const notify = () => flushSync(() => listeners.forEach((fn) => fn()));
const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

if (typeof window !== 'undefined') {
  history.scrollRestoration = 'manual';
  window.addEventListener('popstate', (e) => {
    transition(() => {
      notify();
      window.scrollTo({ top: (e.state as { y?: number } | null)?.y ?? 0, behavior: 'instant' });
    });
  });
}

function transition(update: () => void) {
  if (!document.startViewTransition || prefersReducedMotion()) return update();
  const root = document.documentElement;
  root.dataset.transition = 'page';
  document.startViewTransition(update).finished.finally(() => delete root.dataset.transition);
}

export function navigate(to: string) {
  if (to === currentPath()) {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'instant' : 'smooth' });
    return;
  }
  history.replaceState({ ...history.state, y: window.scrollY }, '');
  transition(() => {
    history.pushState({ y: 0 }, '', to);
    notify();
    window.scrollTo({ top: 0, behavior: 'instant' });
  });
}

export const usePath = () => useSyncExternalStore(subscribe, currentPath);

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { to: string; ref?: Ref<HTMLAnchorElement> };

/** An <a> that changes page without a reload; modified clicks still open new tabs. */
export function Link({ to, onClick, ref, ...rest }: LinkProps) {
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    navigate(to);
  };
  return <a ref={ref} href={to} onClick={handle} {...rest} />;
}
