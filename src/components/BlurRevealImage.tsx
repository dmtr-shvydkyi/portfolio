'use client';

import { useState } from 'react';
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
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const isLoaded = loadedSrc === src;

  return (
    <>
      {blurDataURL ? (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url("${blurDataURL}")` }}
        />
      ) : null}
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        quality={quality}
        loading="lazy"
        onLoad={() => setLoadedSrc(src)}
        className={`absolute inset-0 size-full max-w-none object-cover transition-opacity duration-150 ease-out ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`.trim()}
      />
    </>
  );
}
