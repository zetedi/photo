import type { ImgHTMLAttributes } from 'react';
import { photo, src, srcSet, type PhotoId } from '@/photos';

interface PictureProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet'> {
  id: PhotoId;
  alt: string;
  sizes: string;
  priority?: boolean;
}

/** A responsive WebP image that shows its blurred placeholder until the real one paints. */
export function Picture({ id, alt, sizes, priority = false, style, ...rest }: PictureProps) {
  const p = photo(id);
  return (
    <img
      src={src(id)}
      srcSet={srcSet(id)}
      sizes={sizes}
      width={p.width}
      height={p.height}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding="async"
      draggable={false}
      style={{
        backgroundColor: p.color,
        backgroundImage: `url(${p.placeholder})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        ...style,
      }}
      {...rest}
    />
  );
}
