'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ScrollCardsProps {
  className?: string;
}

interface DesignCardProps {
  id: string;
  title: string;
  subtitle: string;
  imageSrc: string;
  dataNodeId: string;
}

function DesignCard({ title, subtitle, imageSrc, dataNodeId }: Omit<DesignCardProps, 'id'>) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button 
      className="block relative shrink-0 w-full aspect-[800/540] md:aspect-[3/2] cursor-pointer" 
      data-name="design-card-v2" 
      data-node-id={dataNodeId}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <div className="absolute bg-[#0f0f0f] inset-0"/>
        <Image 
          alt="" 
          className="absolute max-w-none object-50%-50% object-cover size-full" 
          src={imageSrc}
          fill
        />
      </div>
      
      {/* Hover overlay with info card */}
      {isHovered && (
        <div className="absolute backdrop-blur-[60px] backdrop-filter bg-[rgba(13,13,13,0.64)] bottom-[8px] box-border content-stretch flex gap-[4px] items-start left-[8px] p-[12px]">
          <p className="font-mono font-semibold leading-[16px] relative shrink-0 text-[12px] text-[rgba(255,255,255,0.8)] text-nowrap tracking-[0.24px] uppercase whitespace-pre">
            {title}
          </p>
          <div className="content-stretch flex font-mono font-semibold gap-[4px] items-center leading-[16px] relative shrink-0 text-[12px] text-[rgba(255,255,255,0.4)] tracking-[0.24px] uppercase">
            <p className="relative shrink-0 text-center w-[8px]">·</p>
            <p className="relative shrink-0 text-nowrap whitespace-pre">{subtitle}</p>
          </div>
        </div>
      )}
    </button>
  );
}

export default function ScrollCards({ className }: ScrollCardsProps) {
  const cards = [
    {
      id: "card-1",
      title: "Mobile App Design",
      subtitle: "iOS & Android",
      imageSrc: "/c8c9b94d8de01b100206a61f6ec63d0c5c09fd5e.png",
      dataNodeId: "622:2519"
    },
    {
      id: "card-2", 
      title: "Web Platform",
      subtitle: "React & Next.js",
      imageSrc: "/c8c9b94d8de01b100206a61f6ec63d0c5c09fd5e.png",
      dataNodeId: "622:2539"
    },
    {
      id: "card-3",
      title: "Brand Identity",
      subtitle: "Logo & Guidelines",
      imageSrc: "/c8c9b94d8de01b100206a61f6ec63d0c5c09fd5e.png",
      dataNodeId: "622:2499"
    }
  ];

  return (
    <div className={className} data-name="_scroll-cards" data-node-id="552:36229">
      {cards.map((card) => (
        <DesignCard
          key={card.id}
          id={card.id}
          title={card.title}
          subtitle={card.subtitle}
          imageSrc={card.imageSrc}
          dataNodeId={card.dataNodeId}
        />
      ))}
    </div>
  );
}
