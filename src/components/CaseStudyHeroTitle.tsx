'use client';

import { useLayoutEffect, useRef, useState } from 'react';

const BASE_FONT_SIZE = 40;
const MIN_FONT_SIZE = 22;
const FONT_SIZE_PRECISION = 0.1;

interface CaseStudyHeroTitleProps {
  title: string;
}

export default function CaseStudyHeroTitle({ title }: CaseStudyHeroTitleProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const [fontSize, setFontSize] = useState(BASE_FONT_SIZE);

  useLayoutEffect(() => {
    if (!containerRef.current || !titleRef.current) {
      return;
    }

    let rafId: number | null = null;

    const updateSize = () => {
      const containerEl = containerRef.current;
      const titleEl = titleRef.current;

      if (!containerEl || !titleEl) {
        return;
      }

      const availableWidth = Math.max(0, containerEl.getBoundingClientRect().width - 1);

      if (availableWidth <= 0) {
        setFontSize(BASE_FONT_SIZE);
        return;
      }

      let nextFontSize = BASE_FONT_SIZE;
      titleEl.style.fontSize = `${BASE_FONT_SIZE}px`;

      if (titleEl.scrollWidth > availableWidth) {
        let low = MIN_FONT_SIZE;
        let high = BASE_FONT_SIZE;

        while (high - low > FONT_SIZE_PRECISION) {
          const mid = Number(((low + high) / 2).toFixed(2));
          titleEl.style.fontSize = `${mid}px`;

          if (titleEl.scrollWidth <= availableWidth) {
            low = mid;
          } else {
            high = mid;
          }
        }

        nextFontSize = low;
        titleEl.style.fontSize = `${nextFontSize}px`;

        while (nextFontSize > MIN_FONT_SIZE && titleEl.scrollWidth > availableWidth) {
          nextFontSize = Number(Math.max(MIN_FONT_SIZE, nextFontSize - FONT_SIZE_PRECISION).toFixed(2));
          titleEl.style.fontSize = `${nextFontSize}px`;
        }
      }

      setFontSize(previous =>
        Math.abs(previous - nextFontSize) < FONT_SIZE_PRECISION ? previous : nextFontSize
      );
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
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener('resize', scheduleUpdate);
    window.visualViewport?.addEventListener('resize', scheduleUpdate);

    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }

      if (resizeObserver) {
        resizeObserver.disconnect();
      }

      window.removeEventListener('resize', scheduleUpdate);
      window.visualViewport?.removeEventListener('resize', scheduleUpdate);
    };
  }, [title]);

  return (
    <div ref={containerRef} className="h-[48px] min-w-0 w-full overflow-hidden">
      <h1
        ref={titleRef}
        className="inline-block w-max max-w-none font-mono font-semibold leading-[48px] text-white uppercase whitespace-nowrap"
        style={{ fontSize: `${fontSize}px` }}
      >
        {title}
      </h1>
    </div>
  );
}
