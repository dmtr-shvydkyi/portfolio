'use client';

import { type MouseEvent, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from './Link';

interface ScrollCardsProps {
  className?: string;
}

interface CardLink {
  text: string;
  url: string;
}

interface DesignCardProps {
  title: string;
  subtitle?: string;
  mediaSrc: string;
  links?: CardLink[];
  dataNodeId: string;
  onOpen: () => void;
}

interface WorkCard {
  title: string;
  subtitle?: string;
  mediaSrc: string;
  links?: CardLink[];
  dataNodeId: string;
}

interface CardPreviewModalProps {
  card: WorkCard;
  onClose: () => void;
}

const BLUR_DATA_URL =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIxMyIgdmlld0JveD0iMCAwIDIwIDEzIj48cmVjdCB3aWR0aD0iMjAiIGhlaWdodD0iMTMiIGZpbGw9IiMxMzEzMTMiLz48L3N2Zz4=';

function DesignCard({ title, subtitle, mediaSrc, links, dataNodeId, onOpen }: DesignCardProps) {
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
  }, [isVideo, shouldLoadVideo]);

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
        <div className="absolute bg-[#0f0f0f] inset-0"/>
        {isVideo ? (
          <video 
            ref={videoRef}
            className={`absolute max-w-none object-50%-50% object-cover size-full transition-opacity duration-500 ease-out ${isMediaLoaded ? 'opacity-100' : 'opacity-0'}`}
            autoPlay={shouldLoadVideo}
            loop
            muted
            playsInline
            preload={shouldLoadVideo ? 'metadata' : 'none'}
            onError={(e) => {
              console.error('Video load error:', mediaSrc, e);
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
      
      {/* Hover overlay with info card - bottom left */}
      <div className={`absolute backdrop-blur-[60px] backdrop-filter bg-[rgba(13,13,13,0.64)] bottom-[8px] box-border content-stretch flex gap-[4px] items-start left-[8px] px-[12px] py-[10px] pointer-events-none transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
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

      {/* Link card - bottom right (only on hover) */}
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

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

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
        <p className="font-mono font-semibold leading-[16px] text-[11px] text-[rgba(255,255,255,0.55)] tracking-[0.24px] uppercase whitespace-pre">Esc to close</p>
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

export default function ScrollCards({ className }: ScrollCardsProps) {
  const [selectedCard, setSelectedCard] = useState<WorkCard | null>(null);

  const cards: WorkCard[] = [
    {
      title: "Luminar Collage",
      subtitle: "Onboarding",
      mediaSrc: "/collage-onboarding-p.mp4",
      links: [
        { text: "Jitter", url: "https://jitter.video/file/?id=9BLlSYNaJvuDBolLxiBV6" }
      ],
      dataNodeId: "card-1"
    },
    {
      title: "Luminar Neo",
      subtitle: "Light Depth Tool",
      mediaSrc: "/light-depth.mp4",
      links: [
        { text: "App", url: "https://skylum.com/luminar" }
      ],
      dataNodeId: "card-2"
    },
    {
      title: "AI Bookshelf",
      subtitle: "Concept",
      mediaSrc: "/bookshelf-video.mp4",
      links: [
        { text: "Prototype", url: "https://www.figma.com/proto/xjXvLIAJJBnI7DXaygTmBD/AI-Chatbot-–-My-Library?page-id=0:1&type=design&node-id=14-3236&viewport=2393,-189,0.27&t=GE4OHunispbOMFVg-1&scaling=scale-down&starting-point-node-id=14:3236" }
      ],
      dataNodeId: "card-3"
    },
    {
      title: "Luminar Collage",
      subtitle: "UI",
      mediaSrc: "/collage-1-min.jpg",
      links: [
        { text: "App Store", url: "https://apps.apple.com/ua/app/luminar-collage-photo-maker/id6743317674" }
      ],
      dataNodeId: "card-4"
    },
    {
      title: "Luminar Assistant",
      subtitle: "Feature",
      mediaSrc: "/assistant-min.jpg",
      dataNodeId: "card-5"
    },
    {
      title: "Luminar Spaces",
      subtitle: "Feature",
      mediaSrc: "/web-pages-min.jpg",
      dataNodeId: "card-6"
    },
    {
      title: "AI Bookshelf",
      subtitle: "Concept",
      mediaSrc: "/bookshelf-ai-min.jpg",
      links: [
        { text: "Figma Community", url: "https://www.figma.com/community/file/1309244140239319394/ai-chatbot-library-smart-animate-prototype" }
      ],
      dataNodeId: "card-7"
    },
    {
      title: "Luminar Mobile",
      subtitle: "Widgets / UI",
      mediaSrc: "/mobile-min.jpg",
      links: [
        { text: "Google Play", url: "https://play.google.com/store/apps/details?id=com.skylum.luminar" }
      ],
      dataNodeId: "card-8"
    },
    {
      title: "Book → Video",
      subtitle: "Concept",
      mediaSrc: "/video-ai-min.jpg",
      dataNodeId: "card-9"
    },
    {
      title: "Taxi App",
      subtitle: "Concept",
      mediaSrc: "/taxi-app-min.jpg",
      dataNodeId: "card-10"
    },
    {
      title: "Task Tracker",
      subtitle: "Concept",
      mediaSrc: "/task-master-min.jpg",
      dataNodeId: "card-11"
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
          onOpen={() => setSelectedCard(card)}
        />
      ))}

      {selectedCard && (
        <CardPreviewModal
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
        />
      )}
    </div>
  );
}
