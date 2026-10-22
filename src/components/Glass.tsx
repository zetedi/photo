import { useEffect, useId, useRef, useState, type ComponentPropsWithoutRef, type ElementType } from 'react';
import { canRefract, createGlassMaps, type GlassMaps } from '@/lib/glass';
import { cx } from '@/lib/util';

type GlassProps<T extends ElementType> = {
  as?: T;
  /** Corner radius in px; anything larger than half the height makes a pill. */
  radius?: number;
  /** Width of the curved rim in px. */
  bezel?: number;
  /** How strongly the rim bends light. */
  depth?: number;
  /** Fraction by which blue bends less than red at the rim. */
  dispersion?: number;
  /** Softening of what's seen through the glass, in px. */
  blur?: number;
} & Omit<ComponentPropsWithoutRef<T>, 'as'>;

/**
 * A surface of real glass: the content behind it is refracted through a
 * curved rim with per-channel dispersion and a specular edge. Falls back to
 * frosted glass where SVG backdrop filters are not supported.
 */
export function Glass<T extends ElementType = 'div'>({
  as,
  radius = 999,
  bezel = 14,
  depth = 1,
  dispersion = 0.1,
  blur = 1.1,
  className,
  style,
  children,
  ...rest
}: GlassProps<T>) {
  const Tag: ElementType = as ?? 'div';
  const ref = useRef<HTMLElement>(null);
  const filterId = `glass${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const [maps, setMaps] = useState<GlassMaps | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!canRefract || !el) return;
    let size = '';
    const observer = new ResizeObserver(() => {
      const w = Math.round(el.offsetWidth);
      const h = Math.round(el.offsetHeight);
      if (!w || !h || `${w}x${h}` === size) return;
      size = `${w}x${h}`;
      setMaps(createGlassMaps(w, h, { radius, bezel, depth }));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [radius, bezel, depth]);

  const channel = (scale: number, matrix: string, name: string) => (
    <>
      <feDisplacementMap in="soft" in2="map" scale={scale} xChannelSelector="R" yChannelSelector="G" result={`${name}-d`} />
      <feColorMatrix in={`${name}-d`} type="matrix" values={matrix} result={name} />
    </>
  );

  return (
    <Tag
      ref={ref}
      data-glass={maps ? 'refract' : 'frost'}
      className={cx('glass', className)}
      style={{ borderRadius: radius, ...(maps && { backdropFilter: `url(#${filterId})` }), ...style }}
      {...rest}
    >
      {maps && (
        <svg aria-hidden="true" width="0" height="0" className="pointer-events-none absolute">
          <filter
            id={filterId}
            x="0"
            y="0"
            width={maps.width}
            height={maps.height}
            filterUnits="userSpaceOnUse"
            primitiveUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation={blur} result="soft" />
            <feImage href={maps.displacement} x="0" y="0" width={maps.width} height={maps.height} preserveAspectRatio="none" result="map" />
            {channel(maps.scale, '1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0', 'red')}
            {channel(maps.scale * (1 - dispersion / 2), '0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0', 'green')}
            {channel(maps.scale * (1 - dispersion), '0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0', 'blue')}
            <feBlend in="red" in2="green" mode="screen" result="rg" />
            <feBlend in="rg" in2="blue" mode="screen" result="rgb" />
            <feColorMatrix in="rgb" type="saturate" values="1.25" result="tone" />
            <feImage href={maps.specular} x="0" y="0" width={maps.width} height={maps.height} preserveAspectRatio="none" result="spec" />
            <feComposite in="spec" in2="tone" operator="over" />
          </filter>
        </svg>
      )}
      {children}
    </Tag>
  );
}
