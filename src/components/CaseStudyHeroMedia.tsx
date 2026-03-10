'use client';

import { useEffect, useRef, useState } from 'react';

interface CaseStudyHeroMediaProps {
  src: string;
  className?: string;
}

export default function CaseStudyHeroMedia({
  src,
  className = 'object-50%-50% object-cover',
}: CaseStudyHeroMediaProps) {
  const isVideo = src.endsWith('.mp4') || src.endsWith('.mov');
  const [isMediaLoaded, setIsMediaLoaded] = useState(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(!isVideo);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoType = src.endsWith('.mov') ? 'video/quicktime' : 'video/mp4';

  useEffect(() => {
    setIsMediaLoaded(false);
    setShouldLoadVideo(!isVideo);
  }, [isVideo, src]);

  useEffect(() => {
    if (!isVideo || shouldLoadVideo) return;
    const container = containerRef.current;
    if (!container) return;

    if (typeof IntersectionObserver === 'undefined') {
      setShouldLoadVideo(true);
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        const [entry] = entries;
        if (entry?.isIntersecting) {
          setShouldLoadVideo(true);
          observer.disconnect();
        }
      },
      { rootMargin: '300px 0px' }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [isVideo, shouldLoadVideo]);

  useEffect(() => {
    if (!isVideo || !shouldLoadVideo) return;
    const video = videoRef.current;
    if (!video) return;

    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {});
    }
  }, [isVideo, shouldLoadVideo]);

  if (!isVideo) {
    return <div ref={containerRef} className="absolute inset-0 overflow-hidden bg-[#0f0f0f]" />;
  }

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden bg-[#0f0f0f]">
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[#0f0f0f]" />
        <video
          ref={videoRef}
          className={`absolute inset-0 max-w-none size-full transition-opacity duration-500 ease-out ${isMediaLoaded ? 'opacity-100' : 'opacity-0'} ${className}`.trim()}
          autoPlay={shouldLoadVideo}
          loop
          muted
          playsInline
          preload={shouldLoadVideo ? 'metadata' : 'none'}
          onLoadedData={() => setIsMediaLoaded(true)}
          onLoadedMetadata={() => setIsMediaLoaded(true)}
          onCanPlay={() => setIsMediaLoaded(true)}
        >
          {shouldLoadVideo ? <source src={src} type={videoType} /> : null}
        </video>
      </div>
    </div>
  );
}
