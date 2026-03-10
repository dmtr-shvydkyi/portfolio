'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

type MediaKind = 'image' | 'video';

interface MediaRevealProps {
  kind: MediaKind;
  src: string;
  alt: string;
  blurDataURL?: string;
  sizes?: string;
  priority?: boolean;
  deferUntilVisible?: boolean;
  className?: string;
  containerClassName?: string;
  preload?: 'none' | 'metadata' | 'auto';
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  playsInline?: boolean;
  videoType?: string;
}

const REVEAL_TRANSITION = 'transition-[opacity,transform,filter] duration-200 ease-out motion-reduce:transition-none';
const VISIBLE_MEDIA_STATE = 'opacity-100 scale-100 blur-0';
const HIDDEN_MEDIA_STATE = 'opacity-0 scale-[1.015] blur-[10px] motion-reduce:scale-100 motion-reduce:blur-0';

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export default function MediaReveal({
  kind,
  src,
  alt,
  blurDataURL,
  sizes,
  priority = false,
  deferUntilVisible = false,
  className,
  containerClassName,
  preload = 'metadata',
  autoPlay = true,
  loop = true,
  muted = true,
  playsInline = true,
  videoType = 'video/mp4',
}: MediaRevealProps) {
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [shouldLoadMedia, setShouldLoadMedia] = useState(!deferUntilVisible);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    setIsVideoReady(false);
    setShouldLoadMedia(!deferUntilVisible);
  }, [deferUntilVisible, kind, src]);

  useEffect(() => {
    if (!deferUntilVisible || shouldLoadMedia) {
      return;
    }

    const node = containerRef.current;
    if (!node) {
      return;
    }

    if (typeof IntersectionObserver === 'undefined') {
      setShouldLoadMedia(true);
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        const [entry] = entries;
        if (entry?.isIntersecting) {
          setShouldLoadMedia(true);
          observer.disconnect();
        }
      },
      { rootMargin: '1200px 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [deferUntilVisible, shouldLoadMedia]);

  useEffect(() => {
    if (kind !== 'video' || !shouldLoadMedia || !autoPlay) {
      return;
    }

    const video = videoRef.current;
    if (!video) {
      return;
    }

    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      setIsVideoReady(true);
    }

    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {});
    }
  }, [autoPlay, kind, shouldLoadMedia]);

  if (kind === 'image') {
    return (
      <div ref={containerRef} className={cx('relative overflow-hidden bg-[#0f0f0f]', containerClassName)}>
        {shouldLoadMedia ? (
          <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            priority={priority}
            loading={priority ? 'eager' : 'lazy'}
            placeholder={blurDataURL ? 'blur' : 'empty'}
            blurDataURL={blurDataURL}
            className={cx(
              'absolute inset-0 max-w-none size-full',
              className
            )}
          />
        ) : (
          <div
            aria-hidden="true"
            className={cx('absolute inset-0 bg-center bg-cover bg-no-repeat', className)}
            style={blurDataURL ? { backgroundImage: `url("${blurDataURL}")` } : undefined}
          />
        )}
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cx('relative overflow-hidden bg-[#0f0f0f]', containerClassName)}>
      <video
        ref={videoRef}
        className={cx(
          'absolute inset-0 max-w-none size-full',
          REVEAL_TRANSITION,
          isVideoReady ? VISIBLE_MEDIA_STATE : HIDDEN_MEDIA_STATE,
          className
        )}
        autoPlay={autoPlay && shouldLoadMedia}
        loop={loop}
        muted={muted}
        playsInline={playsInline}
        preload={shouldLoadMedia ? preload : 'none'}
        aria-hidden={alt === '' ? true : undefined}
        onLoadedData={() => setIsVideoReady(true)}
        onLoadedMetadata={() => setIsVideoReady(true)}
        onCanPlay={() => setIsVideoReady(true)}
        onPlay={() => setIsVideoReady(true)}
        onPlaying={() => setIsVideoReady(true)}
      >
        {shouldLoadMedia ? <source src={src} type={videoType} /> : null}
      </video>
    </div>
  );
}
