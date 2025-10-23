'use client';

import Image from 'next/image';
import Link from './Link';
import { useKeyboardSound } from '@/hooks/useKeyboardSound';

export default function Resume() {
  const cvUrl = "https://drive.google.com/file/d/1cJfX1qWboU08-4T79WQLlQ8cYeNBuqeP/view?usp=drive_link";
  const playSound = useKeyboardSound();

  const handleImageClick = () => {
    playSound();
  };
  
  return (
    <div className="basis-0 box-border content-stretch flex flex-col gap-[8px] grow items-center justify-start min-h-px min-w-px overflow-x-clip overflow-y-auto p-[8px] relative shrink-0 w-full">
      <div className="content-stretch flex flex-col gap-[16px] items-center justify-center max-w-[400px] my-auto relative shrink-0 w-full">
        <a 
          href={cvUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="cursor-pointer"
          onClick={handleImageClick}
        >
          <Image 
            src="/image-cv.jpg"
            alt="Resume"
            width={400}
            height={566}
            className="w-full h-auto"
          />
        </a>
        <Link 
          href={cvUrl}
          theme="dark"
        >
          Open
        </Link>
      </div>
    </div>
  );
}
