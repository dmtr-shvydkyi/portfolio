'use client';

import { useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';

interface RunningNewsProps {
  className?: string;
  state?: '2' | '1';
  text?: string;
  repeatCount?: number;
  speedSeconds?: number;
  hoverPlaybackRate?: number;
  pauseOnHover?: boolean;
}

export default function RunningNews({
  className,
  text = 'always under construction',
  repeatCount = 8,
  speedSeconds = 30,
  hoverPlaybackRate = 0.2,
  pauseOnHover = true,
}: RunningNewsProps) {
  const textWithDivider = ` ${text} · `;
  const repeatedText = textWithDivider.repeat(Math.max(1, repeatCount));
  const styleVars = {
    '--running-news-duration': `${speedSeconds}s`,
  } as CSSProperties;
  const marqueeRef = useRef<HTMLDivElement | null>(null);
  const animationRef = useRef<Animation | null>(null);
  const rafRef = useRef<number | null>(null);

  const getAnimation = () => {
    if (animationRef.current) return animationRef.current;
    const marquee = marqueeRef.current;
    if (!marquee || typeof marquee.getAnimations !== 'function') return null;
    const [animation] = marquee.getAnimations();
    if (!animation) return null;
    animationRef.current = animation;
    return animation;
  };

  const rampPlaybackRate = (targetRate: number) => {
    const animation = getAnimation();
    if (!animation) return;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    const startRate = animation.playbackRate;
    const startTime = performance.now();
    const duration = 250;

    const tick = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration);
      animation.playbackRate = startRate + (targetRate - startRate) * t;
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    const animation = getAnimation();
    if (!animation) return;
    animation.playbackRate = 1;
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      className={`${className} overflow-hidden running-news`}
      data-name="State=1"
      data-node-id="622:1625"
      style={styleVars}
      onPointerEnter={() => {
        if (pauseOnHover) rampPlaybackRate(hoverPlaybackRate);
      }}
      onPointerLeave={() => {
        if (pauseOnHover) rampPlaybackRate(1);
      }}
    >
      <span className="sr-only">{text}</span>
      <div
        className="horizontal-scrolling-items"
        aria-hidden="true"
        ref={marqueeRef}
      >
        <div className="horizontal-scrolling-items__item">
          {repeatedText}
        </div>
        <div className="horizontal-scrolling-items__item">
          {repeatedText}
        </div>
      </div>
    </div>
  );
}
