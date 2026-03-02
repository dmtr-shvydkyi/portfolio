'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { workProjects, type WorkProject, type WorkProjectInteraction, type WorkProjectLink } from '@/data/workProjects';
import Link from './Link';

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
}

const BLUR_DATA_URL =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIxMyIgdmlld0JveD0iMCAwIDIwIDEzIj48cmVjdCB3aWR0aD0iMjAiIGhlaWdodD0iMTMiIGZpbGw9IiMxMzEzMTMiLz48L3N2Zz4=';

function DesignCard({ title, subtitle, mediaSrc, links, dataNodeId, interaction, routeHref }: DesignCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isVideo = mediaSrc.endsWith('.mp4') || mediaSrc.endsWith('.mov');
  const [isMediaLoaded, setIsMediaLoaded] = useState(isVideo);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(!isVideo);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const router = useRouter();
  const videoType = mediaSrc.endsWith('.mov') ? 'video/quicktime' : 'video/mp4';
  const isRouteCard = interaction === 'route' && Boolean(routeHref);

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

  const handleOpen = () => {
    if (!isRouteCard || !routeHref) return;
    router.push(routeHref);
  };

  return (
    <div
      ref={cardRef}
      className={`block relative shrink-0 w-full aspect-[800/540] md:aspect-[3/2] group ${isRouteCard ? 'cursor-pointer' : ''}`}
      data-name="design-card-v2"
      data-node-id={dataNodeId}
      role={isRouteCard ? 'button' : undefined}
      tabIndex={isRouteCard ? 0 : undefined}
      aria-label={isRouteCard ? `Open ${title}` : undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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
            onError={() => {
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
          className={`absolute backdrop-blur-[60px] backdrop-filter bg-[rgba(13,13,13,0.64)] bottom-[8px] box-border flex gap-[8px] items-center right-[8px] px-[12px] py-[10px] z-10 transition-opacity duration-200 ${isHovered ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
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
  return (
    <div className={className} data-name="_scroll-cards" data-node-id="552:36229">
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
        />
      ))}
    </div>
  );
}
