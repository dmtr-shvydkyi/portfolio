'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

interface ViewportVideoProps {
  src: string;
  mobileSrc?: string;
  posterSrc: string;
  sizes: string;
  eager?: boolean;
  playbackEnabled?: boolean;
  className?: string;
}

function findScrollRoot(node: HTMLElement) {
  let parent = node.parentElement;
  while (parent) {
    if (/(auto|scroll)/.test(getComputedStyle(parent).overflowY)) return parent;
    parent = parent.parentElement;
  }
  return null;
}

export default function ViewportVideo({
  src,
  mobileSrc,
  posterSrc,
  sizes,
  eager = false,
  playbackEnabled = true,
  className = 'object-cover object-center',
}: ViewportVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const frameRef = useRef<number | null>(null);
  const wantsPlaybackRef = useRef(false);
  const [selectedSrc, setSelectedSrc] = useState<string | null>(null);
  const [nearViewport, setNearViewport] = useState(false);
  const [visible, setVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [hasFrame, setHasFrame] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    // Select once per mounted video. Resizing must not restart a playing clip.
    setSelectedSrc(window.matchMedia('(max-width: 767px)').matches && mobileSrc ? mobileSrc : src);
    const updateVisibility = () => setPageVisible(!document.hidden);
    updateVisibility();
    document.addEventListener('visibilitychange', updateVisibility);
    return () => document.removeEventListener('visibilitychange', updateVisibility);
  }, [mobileSrc, src]);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const root = findScrollRoot(node);
    const preloadObserver = new IntersectionObserver(([entry]) => {
      setNearViewport(entry.isIntersecting);
    }, { root, rootMargin: '200px 0px' });
    const playbackObserver = new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting && entry.intersectionRatio >= 0.15);
    }, { root, threshold: [0, 0.15] });
    preloadObserver.observe(node);
    playbackObserver.observe(node);
    return () => {
      preloadObserver.disconnect();
      playbackObserver.disconnect();
    };
  }, []);

  // On mobile only the selected card starts loading; every card is independent
  // of previous videos and their load, error, or transition events.
  useEffect(() => {
    if (nearViewport && playbackEnabled && pageVisible) setHasLoaded(true);
  }, [nearViewport, playbackEnabled, pageVisible]);

  const shouldPlay = visible && playbackEnabled && pageVisible && !failed;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    wantsPlaybackRef.current = shouldPlay;
    if (!shouldPlay || !hasLoaded || !selectedSrc) {
      video.pause();
      return;
    }
    void video.play().then(() => {
      if (!wantsPlaybackRef.current) video.pause();
    }).catch(() => {
      // Autoplay denial and interrupted play requests keep the real first frame.
    });
  }, [hasLoaded, selectedSrc, shouldPlay]);

  useEffect(() => {
    const video = videoRef.current;
    return () => {
      wantsPlaybackRef.current = false;
      if (video && frameRef.current !== null) video.cancelVideoFrameCallback(frameRef.current);
      video?.pause();
    };
  }, []);

  const revealFrame = () => {
    const video = videoRef.current;
    if (!video || hasFrame || frameRef.current !== null) return;
    if (typeof video.requestVideoFrameCallback === 'function') {
      frameRef.current = video.requestVideoFrameCallback(() => {
        frameRef.current = null;
        setHasFrame(true);
      });
    } else if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      setHasFrame(true);
    }
  };

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden bg-[#0f0f0f]" data-viewport-video>
      <Image
        src={posterSrc}
        alt=""
        fill
        sizes={sizes}
        unoptimized
        priority={eager}
        loading="eager"
        className={`absolute inset-0 size-full ${className}`}
      />
      <video
        ref={videoRef}
        src={hasLoaded && !failed ? selectedSrc ?? undefined : undefined}
        loop
        muted
        playsInline
        preload={shouldPlay ? 'auto' : nearViewport && playbackEnabled && pageVisible ? 'metadata' : 'none'}
        aria-hidden="true"
        onPlaying={revealFrame}
        onError={() => setFailed(true)}
        className={`absolute inset-0 size-full transition-opacity duration-150 ease-out ${hasFrame && !failed ? 'opacity-100' : 'opacity-0'} ${className}`}
      />
    </div>
  );
}
