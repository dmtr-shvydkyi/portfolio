'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import Image from 'next/image';
import { workProjects, type WorkProject, type WorkProjectInteraction, type WorkProjectLink } from '@/data/workProjects';
import { blurDataMap } from '@/data/blurData';
import Link from './Link';
import { useKeyboardSound } from '@/hooks/useKeyboardSound';
import { usePageTransition } from '@/hooks/usePageTransition';

interface ScrollCardsProps {
  className?: string;
}

interface DesignCardProps {
  title: string;
  subtitle?: string;
  mediaSrc: string;
  links?: WorkProjectLink[];
  dataNodeId: string;
  interaction: WorkProjectInteraction;
  routeHref?: string;
  supportsHover: boolean;
  isMobileActive: boolean;
  setCardElement: (node: HTMLDivElement | null) => void;
}

const BLUR_DATA_URL =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIxMyIgdmlld0JveD0iMCAwIDIwIDEzIj48cmVjdCB3aWR0aD0iMjAiIGhlaWdodD0iMTMiIGZpbGw9IiMxMzEzMTMiLz48L3N2Zz4=';
const HOME_SCROLL_TOP_KEY = 'portfolio-home-scroll-top';
const MOBILE_CARD_INSET = 8;
const MOBILE_METADATA_GAP = 8;
const MOBILE_TEXT_CHIP_HORIZONTAL_PADDING = 24;
const MOBILE_ACTIVE_CARD_ANCHOR_RATIO = 0.42;
const MOBILE_CHIP_BACKGROUND = 'rgba(13,13,13,0.52)';
const MOBILE_BACKDROP_FILTER = 'blur(24px) saturate(135%)';
const MOBILE_BACKDROP_STYLE: CSSProperties = {
  backdropFilter: MOBILE_BACKDROP_FILTER,
  WebkitBackdropFilter: MOBILE_BACKDROP_FILTER,
  backgroundColor: MOBILE_CHIP_BACKGROUND,
};

function findScrollHost(node: HTMLElement): HTMLElement | Window {
  const landingContainer = node.closest('.landing-scroll-container');
  if (landingContainer instanceof HTMLElement) {
    return landingContainer;
  }

  let current = node.parentElement;
  while (current) {
    const style = window.getComputedStyle(current);
    const overflowY = style.overflowY;
    const isScrollableOverflow = overflowY === 'auto' || overflowY === 'scroll';

    if (isScrollableOverflow && current.scrollHeight > current.clientHeight + 1) {
      return current;
    }

    current = current.parentElement;
  }

  return window;
}

function getHostViewport(scrollHost: HTMLElement | Window) {
  if (scrollHost instanceof Window) {
    return {
      top: 0,
      bottom: window.innerHeight,
      height: window.innerHeight,
    };
  }

  const rect = scrollHost.getBoundingClientRect();
  return {
    top: rect.top,
    bottom: rect.bottom,
    height: scrollHost.clientHeight || rect.height,
  };
}

function DesignCard({
  title,
  subtitle,
  mediaSrc,
  links,
  dataNodeId,
  interaction,
  routeHref,
  supportsHover,
  isMobileActive,
  setCardElement,
}: DesignCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showMobileSubtitle, setShowMobileSubtitle] = useState(false);
  const [mobileTextMaxWidth, setMobileTextMaxWidth] = useState<number | null>(null);
  const isVideo = mediaSrc.endsWith('.mp4') || mediaSrc.endsWith('.mov');
  const [isMediaLoaded, setIsMediaLoaded] = useState(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(!isVideo);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mobileLinkRef = useRef<HTMLDivElement | null>(null);
  const titleMeasureRef = useRef<HTMLSpanElement | null>(null);
  const dividerMeasureRef = useRef<HTMLSpanElement | null>(null);
  const subtitleMeasureRef = useRef<HTMLSpanElement | null>(null);
  const { navigate } = usePageTransition();
  const playSound = useKeyboardSound();
  const videoType = mediaSrc.endsWith('.mov') ? 'video/quicktime' : 'video/mp4';
  const isRouteCard = interaction === 'route' && Boolean(routeHref);
  const firstLink = links?.[0];

  useEffect(() => {
    setIsMediaLoaded(false);
    setShouldLoadVideo(!isVideo);
  }, [isVideo, mediaSrc]);

  useEffect(() => {
    if (!isVideo || shouldLoadVideo) return;
    const card = cardRef.current;
    if (!card) return;

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

    observer.observe(card);
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

  useEffect(() => {
    if (!subtitle) {
      setShowMobileSubtitle(false);
      return;
    }

    if (supportsHover || !isMobileActive) {
      setShowMobileSubtitle(false);
      setMobileTextMaxWidth(null);
      return;
    }

    const updateMobileLayout = () => {
      const cardWidth = cardRef.current?.clientWidth ?? 0;
      if (!cardWidth) return;

      const innerWidth = Math.max(cardWidth - MOBILE_CARD_INSET * 2, 0);
      const linkWidth = firstLink && mobileLinkRef.current ? mobileLinkRef.current.offsetWidth : 0;
      const availableWidth = Math.max(innerWidth - linkWidth - (firstLink ? MOBILE_METADATA_GAP : 0), 0);
      const availableTextWidth = Math.max(availableWidth - MOBILE_TEXT_CHIP_HORIZONTAL_PADDING, 0);

      setMobileTextMaxWidth(availableWidth);

      const titleWidth = titleMeasureRef.current?.scrollWidth ?? 0;
      const dividerWidth = dividerMeasureRef.current?.scrollWidth ?? 0;
      const subtitleWidth = subtitleMeasureRef.current?.scrollWidth ?? 0;
      const subtitleFits = titleWidth + dividerWidth + subtitleWidth + 2 <= availableTextWidth;

      setShowMobileSubtitle(subtitleFits);
    };

    let cancelled = false;
    const safeUpdate = () => { if (!cancelled) updateMobileLayout(); };

    safeUpdate();

    // Re-measure after fonts load — scrollWidth is inaccurate with fallback fonts
    if (document.fonts?.status !== 'loaded') {
      document.fonts.ready.then(() => requestAnimationFrame(safeUpdate));
    }

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(safeUpdate);
      if (cardRef.current) {
        resizeObserver.observe(cardRef.current);
      }
      if (mobileLinkRef.current) {
        resizeObserver.observe(mobileLinkRef.current);
      }
    } else {
      window.addEventListener('resize', safeUpdate);
    }

    return () => {
      cancelled = true;
      if (resizeObserver) {
        resizeObserver.disconnect();
      } else {
        window.removeEventListener('resize', safeUpdate);
      }
    };
  }, [firstLink, isMobileActive, subtitle, supportsHover, title]);

  const setCombinedCardRef = useCallback((node: HTMLDivElement | null) => {
    cardRef.current = node;
    setCardElement(node);
  }, [setCardElement]);

  const handleOpen = () => {
    if (!isRouteCard || !routeHref) return;

    playSound();

    const container = document.querySelector('.landing-scroll-container');
    if (container instanceof HTMLElement) {
      sessionStorage.setItem(HOME_SCROLL_TOP_KEY, String(container.scrollTop));
    }

    navigate(routeHref, 'forward');
  };

  const isDesktopOverlayVisible = supportsHover && isHovered;
  const isMobileOverlayVisible = !supportsHover && isMobileActive;
  const mobileTextStyle: CSSProperties | undefined = showMobileSubtitle && mobileTextMaxWidth !== null
    ? { maxWidth: `${mobileTextMaxWidth}px` }
    : undefined;
  return (
    <div
      ref={setCombinedCardRef}
      className={`block relative shrink-0 w-full aspect-[800/540] md:aspect-[3/2] group ${isRouteCard ? 'cursor-pointer' : ''}`}
      data-name="design-card-v2"
      data-node-id={dataNodeId}
      role={isRouteCard ? 'button' : undefined}
      tabIndex={isRouteCard ? 0 : undefined}
      aria-label={isRouteCard ? `Open ${title}` : undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsHovered(false);
        }
      }}
      onClick={handleOpen}
      onKeyDown={(event) => {
        if (!isRouteCard) return;
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleOpen();
        }
      }}
    >
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[#0f0f0f]" />
        {isVideo ? (
          <video
            ref={videoRef}
            className={`absolute inset-0 max-w-none object-50%-50% object-cover size-full transition-opacity duration-500 ease-out ${isMediaLoaded ? 'opacity-100' : 'opacity-0'}`}
            autoPlay={shouldLoadVideo}
            loop
            muted
            playsInline
            preload={shouldLoadVideo ? 'metadata' : 'none'}
            onLoadedData={() => setIsMediaLoaded(true)}
            onLoadedMetadata={() => setIsMediaLoaded(true)}
            onCanPlay={() => setIsMediaLoaded(true)}
          >
            {shouldLoadVideo ? <source src={mediaSrc} type={videoType} /> : null}
          </video>
        ) : (
          <Image
            alt={title}
            className={`absolute inset-0 max-w-none object-50%-50% object-cover size-full transition-opacity duration-500 ease-out ${isMediaLoaded ? 'opacity-100' : 'opacity-0'}`}
            src={mediaSrc}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            placeholder="blur"
            blurDataURL={blurDataMap[mediaSrc] ?? BLUR_DATA_URL}
            onLoad={() => setIsMediaLoaded(true)}
          />
        )}
      </div>

      <div
        className={`absolute backdrop-blur-[60px] backdrop-filter bg-[rgba(13,13,13,0.64)] bottom-[8px] box-border content-stretch flex gap-[4px] items-start left-[8px] px-[12px] py-[10px] pointer-events-none transition-opacity duration-200 motion-reduce:transition-none ${isDesktopOverlayVisible ? 'opacity-100' : 'opacity-0'}`}
      >
        <p className="font-mono font-semibold leading-[16px] relative shrink-0 text-[12px] text-[rgba(255,255,255,0.8)] text-nowrap tracking-[0.24px] uppercase whitespace-pre">
          {title}
        </p>
        {subtitle && (
          <div className="content-stretch flex font-mono font-semibold gap-[4px] items-center leading-[16px] relative shrink-0 text-[12px] text-[rgba(255,255,255,0.32)] tracking-[0.24px] uppercase">
            <p className="relative shrink-0 text-center w-[8px]">·</p>
            <p className="relative shrink-0 text-nowrap whitespace-pre">{subtitle}</p>
          </div>
        )}
      </div>

      {supportsHover && links && links.length > 0 && (
        <div
          data-card-links="true"
          className={`absolute backdrop-blur-[60px] backdrop-filter bg-[rgba(13,13,13,0.64)] bottom-[8px] box-border flex gap-[8px] items-center right-[8px] px-[12px] py-[10px] z-10 transition-opacity duration-200 motion-reduce:transition-none ${isDesktopOverlayVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        >
          {links.map((link) => (
            <Link
              key={`${dataNodeId}-${link.text}`}
              href={link.url}
              onClick={(event) => event.stopPropagation()}
              theme="dark"
              type="primary"
              className="inline-flex items-center"
            >
              {link.text}
            </Link>
          ))}
        </div>
      )}

      {!supportsHover && (
        <>
          <div
            className="absolute bottom-[8px] left-[8px] right-[8px] z-10 flex items-end justify-between gap-[8px] pointer-events-none"
          >
            <div className="relative min-w-0 overflow-hidden" style={mobileTextStyle}>
              <div
                aria-hidden="true"
                className={`absolute inset-0 transition-opacity duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${isMobileOverlayVisible ? 'opacity-100' : 'opacity-[0.01]'}`}
                style={MOBILE_BACKDROP_STYLE}
              />
              <div
                className={`relative px-[12px] py-[10px] transition-opacity duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${isMobileOverlayVisible ? 'opacity-100' : 'opacity-0'}`}
              >
                <div className="flex items-center gap-[4px]">
                  <p className="min-w-0 overflow-hidden text-ellipsis whitespace-pre font-mono font-semibold text-[12px] leading-[16px] tracking-[0.24px] text-[rgba(255,255,255,0.8)] uppercase">
                    {title}
                  </p>
                  {subtitle && showMobileSubtitle ? (
                    <div className="flex shrink-0 items-center gap-[4px] font-mono font-semibold text-[12px] leading-[16px] tracking-[0.24px] text-[rgba(255,255,255,0.32)] uppercase">
                      <p className="w-[8px] shrink-0 text-center">·</p>
                      <p className="shrink-0 whitespace-pre">{subtitle}</p>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            {firstLink ? (
              <div
                ref={mobileLinkRef}
                className={`relative shrink-0 overflow-hidden ${isMobileOverlayVisible ? 'pointer-events-auto' : 'pointer-events-none'}`}
              >
                <div
                  aria-hidden="true"
                  className={`absolute inset-0 transition-opacity duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${isMobileOverlayVisible ? 'opacity-100' : 'opacity-[0.01]'}`}
                  style={MOBILE_BACKDROP_STYLE}
                />
                <div
                  className={`relative flex items-center px-[12px] py-[10px] transition-opacity duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${isMobileOverlayVisible ? 'opacity-100' : 'opacity-0'}`}
                >
                  <Link
                    href={firstLink.url}
                    onClick={(event) => event.stopPropagation()}
                    theme="dark"
                    type="primary"
                    className="inline-flex items-center"
                  >
                    {firstLink.text}
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        </>
      )}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 -z-10 opacity-0 whitespace-pre"
      >
        <span
          ref={titleMeasureRef}
          className="font-mono font-semibold text-[12px] leading-[16px] tracking-[0.24px] uppercase"
        >
          {title}
        </span>
        {subtitle ? (
          <>
            <span
              ref={dividerMeasureRef}
              className="px-[4px] font-mono font-semibold text-[12px] leading-[16px] tracking-[0.24px] uppercase"
            >
              ·
            </span>
            <span
              ref={subtitleMeasureRef}
              className="font-mono font-semibold text-[12px] leading-[16px] tracking-[0.24px] uppercase"
            >
              {subtitle}
            </span>
          </>
        ) : null}
      </div>
    </div>
  );
}

function getRouteHref(project: WorkProject): string | undefined {
  if (project.interaction !== 'route' || !project.slug) {
    return undefined;
  }

  return `/work/${project.slug}`;
}

export default function ScrollCards({ className }: ScrollCardsProps) {
  const [supportsHover, setSupportsHover] = useState(true);
  const [activeMobileCardId, setActiveMobileCardId] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const cardElementsRef = useRef(new Map<string, HTMLDivElement>());

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;

    const mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    const updateHoverSupport = () => setSupportsHover(mediaQuery.matches);

    updateHoverSupport();

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', updateHoverSupport);
      return () => mediaQuery.removeEventListener('change', updateHoverSupport);
    }

    mediaQuery.addListener(updateHoverSupport);
    return () => mediaQuery.removeListener(updateHoverSupport);
  }, []);

  const setCardElement = useCallback((cardId: string, node: HTMLDivElement | null) => {
    if (node) {
      cardElementsRef.current.set(cardId, node);
      return;
    }

    cardElementsRef.current.delete(cardId);
  }, []);

  useEffect(() => {
    if (supportsHover) {
      setActiveMobileCardId(null);
      return;
    }

    const list = listRef.current;
    if (!list) return;

    const scrollHost = findScrollHost(list);
    let frameId = 0;

    const updateActiveCard = () => {
      const viewport = getHostViewport(scrollHost);
      const anchorY = viewport.top + viewport.height * MOBILE_ACTIVE_CARD_ANCHOR_RATIO;
      let nextActiveCardId: string | null = null;
      let nearestDistance = Number.POSITIVE_INFINITY;

      cardElementsRef.current.forEach((card, cardId) => {
        const rect = card.getBoundingClientRect();
        const isVisible = rect.bottom > viewport.top && rect.top < viewport.bottom;
        if (!isVisible) return;

        const centerY = rect.top + rect.height / 2;
        const distance = Math.abs(centerY - anchorY);

        if (distance < nearestDistance) {
          nearestDistance = distance;
          nextActiveCardId = cardId;
        }
      });

      setActiveMobileCardId(current => current === nextActiveCardId ? current : nextActiveCardId);
    };

    const requestUpdate = () => {
      if (frameId) return;
      frameId = window.requestAnimationFrame(() => {
        frameId = 0;
        updateActiveCard();
      });
    };

    requestUpdate();

    const scrollTarget = scrollHost instanceof Window ? window : scrollHost;
    scrollTarget.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(requestUpdate);
      resizeObserver.observe(list);
      cardElementsRef.current.forEach(card => resizeObserver?.observe(card));
      if (scrollHost instanceof HTMLElement) {
        resizeObserver.observe(scrollHost);
      }
    }

    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }

      scrollTarget.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
      resizeObserver?.disconnect();
    };
  }, [supportsHover]);

  return (
    <div ref={listRef} className={className} data-name="_scroll-cards" data-node-id="552:36229">
      {workProjects.map((project) => (
        <DesignCard
          key={project.dataNodeId}
          title={project.title}
          subtitle={project.subtitle}
          mediaSrc={project.mediaSrc}
          links={project.links}
          dataNodeId={project.dataNodeId}
          interaction={project.interaction}
          routeHref={getRouteHref(project)}
          supportsHover={supportsHover}
          isMobileActive={activeMobileCardId === project.dataNodeId}
          setCardElement={(node) => setCardElement(project.dataNodeId, node)}
        />
      ))}
    </div>
  );
}
