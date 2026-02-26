'use client';

import { type MouseEvent, useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from './Link';

interface ScrollCardsProps {
  className?: string;
}

interface CardLink {
  text: string;
  url: string;
}

type ModalVariant = 'preview' | 'caseStudy';
type CaseStudyKey = 'luminar-collage';

interface DesignCardProps {
  title: string;
  subtitle?: string;
  mediaSrc: string;
  links?: CardLink[];
  dataNodeId: string;
  isBackgroundPaused: boolean;
  onOpen: () => void;
}

interface WorkCard {
  title: string;
  subtitle?: string;
  mediaSrc: string;
  links?: CardLink[];
  dataNodeId: string;
  modalVariant?: ModalVariant;
  caseStudyKey?: CaseStudyKey;
}

interface CardPreviewModalProps {
  card: WorkCard;
  onClose: () => void;
}

interface CaseStudyModalProps {
  caseStudyKey: CaseStudyKey;
  onClose: () => void;
}

interface CaseStudyMediaCardProps {
  src: string;
  alt: string;
}

interface CaseStudyHeroVideoProps {
  src: string;
  poster?: string;
}

const BLUR_DATA_URL =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIxMyIgdmlld0JveD0iMCAwIDIwIDEzIj48cmVjdCB3aWR0aD0iMjAiIGhlaWdodD0iMTMiIGZpbGw9IiMxMzEzMTMiLz48L3N2Zz4=';

const COLLAGE_CASE_STUDY = {
  title: 'Luminar Collage',
  iconSrc: '/case-studies/luminar-collage/collage-icon.png',
  heroVideoSrc: '/collage-onboarding-p.mp4',
  appStoreUrl: 'https://apps.apple.com/ua/app/luminar-collage-photo-maker/id6743317674',
  sectionMedia: [
    '/case-studies/luminar-collage/section-1.jpg',
    '/case-studies/luminar-collage/section-2.jpg',
    '/case-studies/luminar-collage/section-3.jpg',
    '/case-studies/luminar-collage/section-4.jpg',
    '/case-studies/luminar-collage/section-5.jpg'
  ],
  details: [
    { label: 'Timeline', value: 'Feb 2025 / 2 weeks' },
    { label: 'Role', value: 'Senior Product Designer' },
    { label: 'Tools', value: 'Figma, Jitter, Claude' },
    { label: 'Company', value: 'Skylum' }
  ],
  sections: [
    {
      heading: 'Challenge',
      paragraphs: [
        "Design an iOS collage app that expands Luminar's reach to new users in under 3 weeks. It had to feel like part of the Luminar Mobile ecosystem while running on a different tech stack. Every design decision needed to balance visual craft with technical feasibility and speed."
      ]
    },
    {
      heading: 'Approach',
      paragraphs: [
        'I analyzed 20+ competitor apps to identify patterns in successful collage tools: what made them intuitive versus cluttered. I helped define the MVP feature set and prioritized a roadmap for future iterations.',
        "For onboarding, I crafted animations in Jitter that introduced the app's personality without friction. I also built a flexible grid system with Claude that gave engineers clear implementation paths while maintaining the visual consistency users expect from Luminar."
      ]
    },
    {
      heading: 'Outcome',
      paragraphs: [
        'Shipped on time with great reception from both existing Luminar users who appreciated the familiar design language and newcomers discovering the ecosystem for the first time.'
      ]
    }
  ]
};

function useBodyScrollLock() {
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalModalOpen = document.body.dataset.modalOpen;
    document.body.style.overflow = 'hidden';
    document.body.dataset.modalOpen = 'true';
    return () => {
      document.body.style.overflow = originalOverflow;
      if (typeof originalModalOpen === 'string') {
        document.body.dataset.modalOpen = originalModalOpen;
        return;
      }
      delete document.body.dataset.modalOpen;
    };
  }, []);
}

function DesignCard({ title, subtitle, mediaSrc, links, dataNodeId, isBackgroundPaused, onOpen }: DesignCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isVideo = mediaSrc.endsWith('.mp4') || mediaSrc.endsWith('.mov');
  const [isMediaLoaded, setIsMediaLoaded] = useState(isVideo);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(!isVideo);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoType = mediaSrc.endsWith('.mov') ? 'video/quicktime' : 'video/mp4';

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

    const tryPlay = () => {
      if (isBackgroundPaused) return;
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {});
      }
    };

    tryPlay();
    const handleCanPlay = () => tryPlay();
    video.addEventListener('canplay', handleCanPlay);
    return () => {
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, [isBackgroundPaused, isVideo, shouldLoadVideo]);

  useEffect(() => {
    if (!isVideo || !shouldLoadVideo) return;
    const video = videoRef.current;
    if (!video) return;

    if (isBackgroundPaused) {
      video.pause();
      return;
    }

    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {});
    }
  }, [isBackgroundPaused, isVideo, shouldLoadVideo]);

  return (
    <div
      ref={cardRef}
      className="block relative shrink-0 w-full aspect-[800/540] md:aspect-[3/2] group cursor-pointer"
      data-name="design-card-v2"
      data-node-id={dataNodeId}
      role="button"
      tabIndex={0}
      aria-label={`Open ${title}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpen();
        }
      }}
    >
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <div className="absolute bg-[#0f0f0f] inset-0" />
        {isVideo ? (
          <video
            ref={videoRef}
            className={`absolute max-w-none object-50%-50% object-cover size-full transition-opacity duration-500 ease-out ${isMediaLoaded ? 'opacity-100' : 'opacity-0'}`}
            autoPlay={shouldLoadVideo}
            loop
            muted
            playsInline
            preload={shouldLoadVideo ? 'metadata' : 'none'}
            onError={(event) => {
              console.error('Video load error:', mediaSrc, event);
              setIsMediaLoaded(true);
            }}
            onLoadedData={() => setIsMediaLoaded(true)}
            onLoadedMetadata={() => setIsMediaLoaded(true)}
            onCanPlay={() => setIsMediaLoaded(true)}
          >
            {shouldLoadVideo ? <source src={mediaSrc} type={videoType} /> : null}
          </video>
        ) : (
          <Image
            alt={title}
            className={`absolute max-w-none object-50%-50% object-cover size-full transition-opacity duration-500 ease-out ${isMediaLoaded ? 'opacity-100' : 'opacity-0'}`}
            src={mediaSrc}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
            onLoad={() => setIsMediaLoaded(true)}
          />
        )}
      </div>

      <div
        className={`absolute backdrop-blur-[60px] backdrop-filter bg-[rgba(13,13,13,0.64)] bottom-[8px] box-border content-stretch flex gap-[4px] items-start left-[8px] px-[12px] py-[10px] pointer-events-none transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
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

      {links && links.length > 0 && (
        <div
          data-card-links="true"
          className={`absolute backdrop-blur-[60px] backdrop-filter bg-[rgba(13,13,13,0.64)] bottom-[8px] box-border flex gap-[8px] items-center right-[8px] px-[12px] py-[10px] z-10 transition-opacity duration-200 pointer-events-none ${isHovered ? 'opacity-100' : 'opacity-0'}`}
        >
          {links.map((link, index) => (
            <p
              key={index}
              className="font-mono font-semibold leading-[16px] relative shrink-0 text-[12px] text-[rgba(255,255,255,0.7)] text-nowrap tracking-[0.24px] uppercase whitespace-pre [text-underline-offset:25%] decoration-solid underline"
            >
              {link.text}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

function CardPreviewModal({ card, onClose }: CardPreviewModalProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [reduceMotion, setReduceMotion] = useState(false);
  const modalCardRef = useRef<HTMLDivElement | null>(null);

  useBodyScrollLock();

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduceMotion(mediaQuery.matches);
    update();
    mediaQuery.addEventListener('change', update);
    return () => mediaQuery.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setIsClosing(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!isClosing) return;
    const timeoutId = window.setTimeout(onClose, 200);
    return () => window.clearTimeout(timeoutId);
  }, [isClosing, onClose]);

  const isVideo = card.mediaSrc.endsWith('.mp4') || card.mediaSrc.endsWith('.mov');
  const videoType = card.mediaSrc.endsWith('.mov') ? 'video/quicktime' : 'video/mp4';
  const primaryLink = card.links?.[0];

  const handleOverlayMove = (event: MouseEvent<HTMLDivElement>) => {
    if (reduceMotion) return;
    const modalCard = modalCardRef.current;
    if (!modalCard) return;

    const rect = modalCard.getBoundingClientRect();
    const maxOffset = 20;
    let x = 0;
    let y = 0;

    if (event.clientY < rect.top) y = maxOffset;
    if (event.clientY > rect.bottom) y = -maxOffset;
    if (event.clientX < rect.left) x = maxOffset;
    if (event.clientX > rect.right) x = -maxOffset;

    setOffset({ x, y });
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-[12px] md:p-[24px] transition-opacity duration-200 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
      onClick={() => setIsClosing(true)}
      onMouseMove={handleOverlayMove}
      onMouseLeave={() => setOffset({ x: 0, y: 0 })}
    >
      <div className="absolute inset-0 bg-[rgba(5,5,8,0.86)] backdrop-blur-[6px]" />

      <div className="absolute top-[12px] left-1/2 z-20 -translate-x-1/2 pointer-events-none">
        <p className="font-mono font-semibold leading-[16px] text-[11px] text-[rgba(255,255,255,0.55)] tracking-[0.24px] uppercase whitespace-pre">
          Esc to close
        </p>
      </div>

      <div
        className={`relative z-10 w-full max-w-[1200px] transition-[opacity,filter,transform] duration-200 ${isClosing ? 'opacity-0 blur-[3px] scale-[0.985]' : 'opacity-100 blur-0 scale-100'}`}
      >
        <div
          ref={modalCardRef}
          className="relative aspect-[800/540] md:aspect-[3/2] overflow-hidden transition-transform duration-300 ease-out motion-reduce:transition-none"
          style={{ transform: `translate3d(${offset.x}px, ${offset.y}px, 0)` }}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="absolute inset-0 bg-[#0f0f0f]" />
          {isVideo ? (
            <video
              className="absolute max-w-none object-50%-50% object-cover size-full"
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
            >
              <source src={card.mediaSrc} type={videoType} />
            </video>
          ) : (
            <Image
              alt={card.title}
              className="absolute max-w-none object-50%-50% object-cover size-full"
              src={card.mediaSrc}
              fill
              sizes="(max-width: 768px) 100vw, 100vw"
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
            />
          )}

          <div className="absolute left-[8px] bottom-[8px] backdrop-blur-[60px] backdrop-filter bg-[rgba(13,13,13,0.64)] box-border content-stretch flex gap-[4px] items-start px-[12px] py-[10px]">
            <p className="font-mono font-semibold leading-[16px] relative shrink-0 text-[12px] text-[rgba(255,255,255,0.8)] text-nowrap tracking-[0.24px] uppercase whitespace-pre">
              {card.title}
            </p>
            {card.subtitle && (
              <div className="content-stretch flex font-mono font-semibold gap-[4px] items-center leading-[16px] relative shrink-0 text-[12px] text-[rgba(255,255,255,0.32)] tracking-[0.24px] uppercase">
                <p className="relative shrink-0 text-center w-[8px]">·</p>
                <p className="relative shrink-0 text-nowrap whitespace-pre">{card.subtitle}</p>
              </div>
            )}
          </div>

          {primaryLink && (
            <div className="absolute right-[8px] bottom-[8px] backdrop-blur-[60px] backdrop-filter bg-[rgba(13,13,13,0.64)] box-border flex gap-[8px] items-center px-[12px] py-[10px]">
              <Link href={primaryLink.url} theme="dark">
                {primaryLink.text}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CaseStudyHeroVideo({ src, poster }: CaseStudyHeroVideoProps) {
  return (
    <div className="content-stretch flex flex-col items-start p-[8px] relative shrink-0 w-full">
      <div className="relative aspect-[2400/1350] w-full bg-[#0f0f0f]">
        <video
          className="absolute inset-0 max-w-none object-cover size-full"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster={poster}
        >
          <source src={src} type="video/mp4" />
        </video>
      </div>
    </div>
  );
}

function CaseStudyMediaCard({ src, alt }: CaseStudyMediaCardProps) {
  return (
    <div className="content-stretch flex flex-col items-start px-[8px] py-[4px] relative shrink-0 w-full">
      <div className="relative aspect-[800/540] w-full">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 944px"
          className="absolute inset-0 max-w-none object-cover size-full"
        />
      </div>
    </div>
  );
}

function CaseStudyCloseButton({ onClick }: { onClick: () => void }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  return (
    <button
      type="button"
      aria-label="Close case study"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      onPointerDown={() => setIsPressed(true)}
      onPointerUp={() => setIsPressed(false)}
      onPointerCancel={() => setIsPressed(false)}
      onBlur={() => setIsPressed(false)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          setIsPressed(true);
        }
      }}
      onKeyUp={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          setIsPressed(false);
        }
      }}
      className={`relative flex size-[36px] items-center justify-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[rgba(255,255,255,0.65)] transition-[transform,filter] duration-[120ms] ${isPressed ? 'backdrop-blur-[16px]' : ''}`}
    >
      <span
        className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center bg-[rgba(13,13,13,0.8)] transition-[width,height,padding,filter] duration-[120ms] ${isPressed ? 'size-[28.8px] p-[1.6px] backdrop-blur-[48px]' : 'size-[36px] p-[2px] backdrop-blur-[60px]'} ${isHovered ? 'cursor-pointer' : ''}`}
      >
        <span
          className={`relative transition-[width,height] duration-[120ms] ${isPressed ? 'size-[12.8px]' : 'size-[16px]'}`}
        >
          <span
            className={`absolute left-1/2 top-1/2 h-[1px] -translate-x-1/2 -translate-y-1/2 rotate-45 bg-[rgba(255,255,255,0.52)] transition-[width] duration-[120ms] ${isPressed ? 'w-[9.8px]' : 'w-[12px]'}`}
          />
          <span
            className={`absolute left-1/2 top-1/2 h-[1px] -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-[rgba(255,255,255,0.52)] transition-[width] duration-[120ms] ${isPressed ? 'w-[9.8px]' : 'w-[12px]'}`}
          />
        </span>
      </span>
    </button>
  );
}

function CaseStudyModal({ caseStudyKey, onClose }: CaseStudyModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isTitleOutOfView, setIsTitleOutOfView] = useState(false);
  const modalScrollRef = useRef<HTMLDivElement | null>(null);
  const stickyHeaderRef = useRef<HTMLDivElement | null>(null);
  const titleRowRef = useRef<HTMLDivElement | null>(null);

  useBodyScrollLock();

  const closeDuration = reduceMotion ? 0 : 260;
  const showCaseStudyChip = !hasScrolled;
  const showScrolledHeader = hasScrolled && isTitleOutOfView;

  const requestClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    setIsVisible(false);
  }, [isClosing]);

  useEffect(() => {
    const animationFrameId = window.requestAnimationFrame(() => setIsVisible(true));
    return () => window.cancelAnimationFrame(animationFrameId);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduceMotion(mediaQuery.matches);
    update();
    mediaQuery.addEventListener('change', update);
    return () => mediaQuery.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!isClosing) return;
    if (closeDuration === 0) {
      onClose();
      return;
    }
    const timeoutId = window.setTimeout(onClose, closeDuration);
    return () => window.clearTimeout(timeoutId);
  }, [closeDuration, isClosing, onClose]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        requestClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [requestClose]);

  useEffect(() => {
    const scrollContainer = modalScrollRef.current;
    if (!scrollContainer) return;

    let frameId = 0;

    const updateHeaderState = () => {
      const header = stickyHeaderRef.current;
      const titleRow = titleRowRef.current;
      const hasTopOffset = scrollContainer.scrollTop > 0;
      setHasScrolled(hasTopOffset);

      if (!header || !titleRow) {
        setIsTitleOutOfView(false);
        return;
      }

      const headerBottom = header.getBoundingClientRect().bottom;
      const titleBottom = titleRow.getBoundingClientRect().bottom;
      setIsTitleOutOfView(titleBottom <= headerBottom);
    };

    const onScrollOrResize = () => {
      if (frameId) return;
      frameId = window.requestAnimationFrame(() => {
        frameId = 0;
        updateHeaderState();
      });
    };

    updateHeaderState();
    scrollContainer.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize);

    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
      scrollContainer.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, []);

  if (caseStudyKey !== 'luminar-collage') {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-[20px] transition-opacity duration-[260ms] ease-out motion-reduce:transition-none ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      onClick={requestClose}
    >
      <div className="absolute inset-0 bg-[rgba(0,0,0,0.9)]" />
      <div
        ref={modalScrollRef}
        className={`relative h-full w-full max-w-[960px] overflow-y-auto overflow-x-hidden bg-[#080808] transition-[opacity,transform,filter] duration-[260ms] ease-out motion-reduce:transition-none ${isVisible ? 'opacity-100 translate-y-0 scale-100 blur-0' : 'opacity-0 translate-y-[8px] scale-[0.996] blur-[2px]'}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div ref={stickyHeaderRef} className="sticky top-0 z-20 flex min-h-[68px] items-center justify-between p-[16px]">
          <div className="relative min-h-[36px] flex-1">
            <div
              className={`absolute inset-y-0 left-0 flex items-center transition-[opacity,transform] duration-200 ease-out ${showCaseStudyChip ? 'translate-y-0 opacity-100' : '-translate-y-[4px] opacity-0 pointer-events-none'}`}
            >
              <div className="backdrop-blur-[60px] backdrop-filter bg-[rgba(13,13,13,0.8)] content-stretch flex gap-[4px] items-start px-[12px] py-[10px]">
                <p className="font-mono font-semibold leading-[16px] text-[12px] text-[rgba(255,255,255,0.8)] tracking-[0.24px] uppercase">
                  Case study
                </p>
              </div>
            </div>

            <div
              className={`absolute inset-y-0 left-0 flex items-center gap-[8px] transition-[opacity,transform] duration-200 ease-out ${showScrolledHeader ? 'translate-y-0 opacity-100' : 'translate-y-[4px] opacity-0 pointer-events-none'}`}
            >
              <div className="backdrop-blur-[60px] backdrop-filter bg-[rgba(13,13,13,0.8)] content-stretch flex gap-[4px] items-start px-[12px] py-[10px]">
                <p className="font-mono font-semibold leading-[16px] text-[12px] text-[rgba(255,255,255,0.8)] tracking-[0.24px] uppercase">
                  {COLLAGE_CASE_STUDY.title}
                </p>
              </div>
              <div className="backdrop-blur-[60px] backdrop-filter bg-[rgba(13,13,13,0.8)] content-stretch flex gap-[4px] items-start px-[12px] py-[10px]">
                <a
                  href={COLLAGE_CASE_STUDY.appStoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono font-semibold leading-[16px] text-[12px] text-[rgba(255,255,255,0.32)] tracking-[0.24px] uppercase [text-underline-offset:25%] decoration-solid underline transition-colors duration-150 hover:text-[rgba(255,255,255,0.7)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[rgba(255,255,255,0.65)]"
                >
                  App Store
                </a>
              </div>
            </div>
          </div>
          <CaseStudyCloseButton onClick={requestClose} />
        </div>

        <div ref={titleRowRef} className="content-stretch flex items-end justify-between pb-[8px] pt-[32px] px-[16px] w-full">
          <div className="content-stretch flex flex-[1_0_0] items-center justify-between min-h-px min-w-px">
            <h2 className="font-mono font-semibold leading-[30px] md:leading-[48px] text-[24px] md:text-[40px] text-white uppercase">
              {COLLAGE_CASE_STUDY.title}
            </h2>
            <a
              href={COLLAGE_CASE_STUDY.appStoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open Luminar Collage on the App Store"
              className="shrink-0 transition-opacity duration-150 hover:opacity-[0.85] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[rgba(255,255,255,0.65)]"
            >
              <Image
                src={COLLAGE_CASE_STUDY.iconSrc}
                alt=""
                width={37}
                height={37}
                className="shrink-0 size-[30px] md:size-[37px]"
              />
            </a>
          </div>
        </div>

        <CaseStudyHeroVideo src={COLLAGE_CASE_STUDY.heroVideoSrc} poster={COLLAGE_CASE_STUDY.sectionMedia[0]} />

        <div className="grid w-full grid-cols-1 md:grid-cols-5 gap-[8px] px-[20px] pt-[20px] pb-[80px] text-[12px]">
          <div className="content-stretch flex flex-col gap-[16px] items-start md:col-span-1">
            {COLLAGE_CASE_STUDY.details.map((item) => (
              <div key={item.label} className="content-stretch flex flex-col gap-[4px] items-start w-full">
                <p className="font-mono font-semibold leading-[16px] text-[rgba(255,255,255,0.32)] tracking-[0.24px] uppercase w-full">
                  {item.label}
                </p>
                <p className="font-mono font-semibold leading-[16px] text-white tracking-[0.24px] w-full">
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          <div className="content-stretch flex flex-col gap-[16px] items-start md:col-start-3 md:col-span-3">
            {COLLAGE_CASE_STUDY.sections.map((section) => (
              <div key={section.heading} className="content-stretch flex flex-col gap-[4px] items-start w-full">
                <p className="font-mono font-semibold leading-[16px] text-[rgba(255,255,255,0.32)] tracking-[0.24px] uppercase w-full">
                  {section.heading}
                </p>
                <div className="w-full">
                  {section.paragraphs.map((paragraph) => (
                    <p
                      key={paragraph}
                      className="font-mono font-medium leading-[20px] text-white w-full [&:not(:last-child)]:mb-[8px]"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {COLLAGE_CASE_STUDY.sectionMedia.map((src, index) => (
          <CaseStudyMediaCard
            key={src}
            src={src}
            alt={`Luminar Collage section ${index + 1}`}
          />
        ))}

        <div className="content-stretch flex flex-col gap-[8px] items-center justify-center overflow-x-clip overflow-y-auto px-[8px] py-[80px] w-full">
          <div className="content-stretch flex flex-col gap-[16px] items-center justify-center max-w-[400px] w-full">
            <button
              type="button"
              className="bg-[rgba(255,255,255,0.16)] content-stretch flex gap-[8px] items-center justify-center px-[4px] py-[2px] cursor-pointer"
              onClick={requestClose}
            >
              <span className="font-mono font-semibold leading-[16px] text-[12px] text-[rgba(255,255,255,0.88)] tracking-[0.24px] uppercase">
                Close
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ScrollCards({ className }: ScrollCardsProps) {
  const [selectedCard, setSelectedCard] = useState<WorkCard | null>(null);
  const isModalOpen = selectedCard !== null;

  const cards: WorkCard[] = [
    {
      title: 'Luminar Collage',
      subtitle: 'Onboarding',
      mediaSrc: '/collage-onboarding-p.mp4',
      links: [
        { text: 'Jitter', url: 'https://jitter.video/file/?id=9BLlSYNaJvuDBolLxiBV6' }
      ],
      dataNodeId: 'card-1',
      modalVariant: 'caseStudy',
      caseStudyKey: 'luminar-collage'
    },
    {
      title: 'Luminar Neo',
      subtitle: 'Light Depth Tool',
      mediaSrc: '/light-depth.mp4',
      links: [
        { text: 'App', url: 'https://skylum.com/luminar' }
      ],
      dataNodeId: 'card-2'
    },
    {
      title: 'AI Bookshelf',
      subtitle: 'Concept',
      mediaSrc: '/bookshelf-video.mp4',
      links: [
        { text: 'Prototype', url: 'https://www.figma.com/proto/xjXvLIAJJBnI7DXaygTmBD/AI-Chatbot-–-My-Library?page-id=0:1&type=design&node-id=14-3236&viewport=2393,-189,0.27&t=GE4OHunispbOMFVg-1&scaling=scale-down&starting-point-node-id=14:3236' }
      ],
      dataNodeId: 'card-3'
    },
    {
      title: 'Luminar Collage',
      subtitle: 'UI',
      mediaSrc: '/collage-1-min.jpg',
      links: [
        { text: 'App Store', url: 'https://apps.apple.com/ua/app/luminar-collage-photo-maker/id6743317674' }
      ],
      dataNodeId: 'card-4'
    },
    {
      title: 'Luminar Assistant',
      subtitle: 'Feature',
      mediaSrc: '/assistant-min.jpg',
      dataNodeId: 'card-5'
    },
    {
      title: 'Luminar Spaces',
      subtitle: 'Feature',
      mediaSrc: '/web-pages-min.jpg',
      dataNodeId: 'card-6'
    },
    {
      title: 'AI Bookshelf',
      subtitle: 'Concept',
      mediaSrc: '/bookshelf-ai-min.jpg',
      links: [
        { text: 'Figma Community', url: 'https://www.figma.com/community/file/1309244140239319394/ai-chatbot-library-smart-animate-prototype' }
      ],
      dataNodeId: 'card-7'
    },
    {
      title: 'Luminar Mobile',
      subtitle: 'Widgets / UI',
      mediaSrc: '/mobile-min.jpg',
      links: [
        { text: 'Google Play', url: 'https://play.google.com/store/apps/details?id=com.skylum.luminar' }
      ],
      dataNodeId: 'card-8'
    },
    {
      title: 'Book → Video',
      subtitle: 'Concept',
      mediaSrc: '/video-ai-min.jpg',
      dataNodeId: 'card-9'
    },
    {
      title: 'Taxi App',
      subtitle: 'Concept',
      mediaSrc: '/taxi-app-min.jpg',
      dataNodeId: 'card-10'
    },
    {
      title: 'Task Tracker',
      subtitle: 'Concept',
      mediaSrc: '/task-master-min.jpg',
      dataNodeId: 'card-11'
    }
  ];

  return (
    <div className={className} data-name="_scroll-cards" data-node-id="552:36229">
      {cards.map((card) => (
        <DesignCard
          key={card.dataNodeId}
          title={card.title}
          subtitle={card.subtitle}
          mediaSrc={card.mediaSrc}
          links={card.links}
          dataNodeId={card.dataNodeId}
          isBackgroundPaused={isModalOpen}
          onOpen={() => setSelectedCard(card)}
        />
      ))}

      {selectedCard && (
        selectedCard.modalVariant === 'caseStudy' && selectedCard.caseStudyKey ? (
          <CaseStudyModal
            caseStudyKey={selectedCard.caseStudyKey}
            onClose={() => setSelectedCard(null)}
          />
        ) : (
          <CardPreviewModal
            card={selectedCard}
            onClose={() => setSelectedCard(null)}
          />
        )
      )}
    </div>
  );
}
