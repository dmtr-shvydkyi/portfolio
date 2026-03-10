'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface BlurRevealImageProps {
  src: string;
  alt: string;
  sizes: string;
  quality?: number;
  blurDataURL?: string;
  className?: string;
}

export default function BlurRevealImage({
  src,
  alt,
  sizes,
  quality,
  blurDataURL,
  className = '',
}: BlurRevealImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(false);
  }, [src]);

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      quality={quality}
      loading="lazy"
      placeholder={blurDataURL ? 'blur' : 'empty'}
      blurDataURL={blurDataURL}
      onLoad={() => setIsLoaded(true)}
      className={`absolute inset-0 size-full max-w-none object-cover transition-opacity duration-500 ease-out ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`.trim()}
    />
  );
}
