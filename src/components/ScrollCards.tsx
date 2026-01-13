'use client';

import { useEffect, useRef, useState } from 'react';
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
}

function DesignCard({ title, subtitle, mediaSrc, links, dataNodeId }: DesignCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isVideo = mediaSrc.endsWith('.mp4') || mediaSrc.endsWith('.mov');
  const [isMediaLoaded, setIsMediaLoaded] = useState(isVideo);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoType = mediaSrc.endsWith('.mov') ? 'video/quicktime' : 'video/mp4';

  useEffect(() => {
    if (!isVideo) return;
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
  }, [isVideo, mediaSrc]);

  return (
    <div 
      className="block relative shrink-0 w-full aspect-[800/540] md:aspect-[3/2] group" 
      data-name="design-card-v2" 
      data-node-id={dataNodeId}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <div className="absolute bg-[#0f0f0f] inset-0"/>
        {isVideo ? (
          <video 
            ref={videoRef}
            className={`absolute max-w-none object-50%-50% object-cover size-full transition-opacity duration-500 ease-out ${isMediaLoaded ? 'opacity-100' : 'opacity-0'}`}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            onError={(e) => {
              console.error('Video load error:', mediaSrc, e);
              setIsMediaLoaded(true);
            }}
            onLoadedData={() => setIsMediaLoaded(true)}
            onLoadedMetadata={() => setIsMediaLoaded(true)}
            onCanPlay={() => setIsMediaLoaded(true)}
          >
            <source src={mediaSrc} type={videoType} />
          </video>
        ) : (
          <Image 
            alt={title} 
            className={`absolute max-w-none object-50%-50% object-cover size-full transition-opacity duration-500 ease-out ${isMediaLoaded ? 'opacity-100' : 'opacity-0'}`} 
            src={mediaSrc}
            fill
            onLoadingComplete={() => setIsMediaLoaded(true)}
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
        <div className={`absolute backdrop-blur-[60px] backdrop-filter bg-[rgba(13,13,13,0.64)] bottom-[8px] box-border flex gap-[8px] items-center right-[8px] px-[12px] py-[10px] z-10 transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          {links.map((link, index) => (
            <Link key={index} href={link.url} theme="dark">
              {link.text}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ScrollCards({ className }: ScrollCardsProps) {
  const cards = [
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
        />
      ))}
    </div>
  );
}
