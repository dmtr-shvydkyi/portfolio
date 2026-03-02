'use client';

import { useLayoutEffect, useRef, useState } from 'react';

const BASE_FONT_SIZE = 40;
const MIN_FONT_SIZE = 22;

interface CaseStudyHeroTitleProps {
  title: string;
}

export default function CaseStudyHeroTitle({ title }: CaseStudyHeroTitleProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const [fontSize, setFontSize] = useState(BASE_FONT_SIZE);

  useLayoutEffect(() => {
    const containerEl = containerRef.current;
    const titleEl = titleRef.current;

    if (!containerEl || !titleEl) {
      return;
    }

    let rafId: number | null = null;

    const updateSize = () => {
      if (!containerEl || !titleEl) {
        return;
      }

      titleEl.style.fontSize = `${BASE_FONT_SIZE}px`;

      const availableWidth = containerEl.clientWidth;
      const neededWidth = titleEl.scrollWidth;

      if (availableWidth <= 0 || neededWidth <= 0) {
        setFontSize(BASE_FONT_SIZE);
        return;
      }

      const nextFontSize =
        neededWidth <= availableWidth
          ? BASE_FONT_SIZE
          : Math.max(MIN_FONT_SIZE, Math.floor((availableWidth / neededWidth) * BASE_FONT_SIZE * 10) / 10);

      setFontSize(previous => (Math.abs(previous - nextFontSize) < 0.1 ? previous : nextFontSize));
    };

    const scheduleUpdate = () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }

      rafId = requestAnimationFrame(updateSize);
    };

    scheduleUpdate();

    if ('fonts' in document) {
      document.fonts.ready.then(scheduleUpdate).catch(() => undefined);
    }

    let resizeObserver: ResizeObserver | null = null;

    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(scheduleUpdate);
      resizeObserver.observe(containerEl);
    } else {
      window.addEventListener('resize', scheduleUpdate);
    }

    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }

      if (resizeObserver) {
        resizeObserver.disconnect();
      } else {
        window.removeEventListener('resize', scheduleUpdate);
      }
    };
  }, [title]);

  return (
    <div ref={containerRef} className="h-[48px] w-full overflow-hidden">
      <h1
        ref={titleRef}
        className="font-mono font-semibold leading-[48px] text-white uppercase whitespace-nowrap"
        style={{ fontSize: `${fontSize}px` }}
      >
        {title}
      </h1>
    </div>
  );
}
