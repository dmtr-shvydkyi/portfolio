'use client';

import Image from 'next/image';
import Link from './Link';
import { useKeyboardSound } from '@/hooks/useKeyboardSound';
import { blurDataMap } from '@/data/blurData';

interface ResumeProps {
  landingMode?: boolean;
}

export default function Resume({ landingMode = false }: ResumeProps) {
  const cvUrl = "https://drive.google.com/file/d/1cJfX1qWboU08-4T79WQLlQ8cYeNBuqeP/view?usp=drive_link";
  const playSound = useKeyboardSound();
  const containerClass = landingMode
    ? 'box-border content-stretch flex flex-col gap-[8px] grow items-center justify-center min-h-0 min-w-px overflow-x-clip overflow-y-visible p-[8px] relative shrink-0 w-full h-full'
    : 'basis-0 box-border content-stretch flex flex-col gap-[8px] grow items-center justify-start min-h-px min-w-px overflow-x-clip overflow-y-auto p-[8px] relative shrink-0 w-full';
  const contentClass = landingMode
    ? 'content-stretch flex flex-col gap-[16px] items-center justify-center max-w-[400px] my-auto relative shrink-0 w-full'
    : 'content-stretch flex flex-col gap-[16px] items-center justify-center max-w-[400px] my-auto relative shrink-0 w-full';

  const handleImageClick = () => {
    playSound();
  };
  
  return (
    <div className={containerClass}>
      <div className={contentClass}>
        <a 
          href={cvUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full cursor-pointer"
          onClick={handleImageClick}
        >
          <Image
            src="/image-cv.jpg"
            alt="Resume"
            width={400}
            height={566}
            className="h-auto w-full"
            sizes="(max-width: 440px) 100vw, 400px"
            placeholder="blur"
            blurDataURL={blurDataMap['/image-cv.jpg']}
          />
        </a>
        <Link 
          href={cvUrl}
          theme="dark"
          type="primary"
        >
          Open
        </Link>
      </div>
    </div>
  );
}
