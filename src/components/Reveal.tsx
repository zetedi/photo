import type { CSSProperties, ElementType, ReactNode } from 'react';
import { useInView } from '@/hooks/useInView';
import { cx } from '@/lib/util';

interface RevealProps {
  as?: ElementType;
  delay?: number;
  className?: string;
  children: ReactNode;
}

/** Fades and lifts its content in the first time it scrolls into view. */
export function Reveal({ as: Tag = 'div', delay = 0, className, children }: RevealProps) {
  const [ref, inView] = useInView<HTMLElement>();
  return (
    <Tag ref={ref} className={cx('reveal', inView && 'is-in', className)} style={{ '--delay': `${delay}ms` } as CSSProperties}>
      {children}
    </Tag>
  );
}
