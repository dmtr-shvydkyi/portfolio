import { workImageSources } from '@/data/workImageSources';

interface WorkImageProps {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
}

export default function WorkImage({ src, alt, sizes, className = '' }: WorkImageProps) {
  const image = workImageSources[src];

  return (
    // These responsive WebPs are optimized ahead of time, with content-hashed URLs.
    // Start all images on this route early so fast scrolling does not outrun lazy loading.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={image?.src ?? src}
      srcSet={image?.srcSet}
      sizes={sizes}
      width={image?.width}
      height={image?.height}
      alt={alt}
      loading="eager"
      fetchPriority="low"
      decoding="async"
      className={`absolute inset-0 size-full max-w-none object-cover ${className}`.trim()}
    />
  );
}
