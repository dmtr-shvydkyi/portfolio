'use client';

import { useState } from 'react';
import { useKeyboardSound } from '@/hooks/useKeyboardSound';
import { blurDataMap } from '@/data/blurData';
import MediaReveal from './MediaReveal';

interface LogoMainProps {
  className?: string;
  state?: 'Default' | 'expanded';
  onClick?: () => void;
}

export default function LogoMain({ className, onClick }: LogoMainProps) {
  const [isGlitching, setIsGlitching] = useState(false);
  const playSound = useKeyboardSound();

  const handleClick = () => {
    setIsGlitching(true);
    playSound();
    setTimeout(() => setIsGlitching(false), 400);
    onClick?.();
  };

  return (
    <div 
      className={`${className} cursor-pointer ${isGlitching ? 'animate-glitch' : ''}`} 
      data-name="state=Default" 
      data-node-id="550:36084"
      onClick={handleClick}
    >
      <div className="absolute left-1/2 overflow-clip size-[32px] top-1/2 translate-x-[-50%] translate-y-[-50%]" data-name="logo" data-node-id="550:36080">
        <div className="absolute left-1/2 size-[32px] top-1/2 translate-x-[-50%] translate-y-[-50%]" data-name="dotted" data-node-id="550:36082">
          <MediaReveal
            kind="image"
            src="/logo-lol.png"
            alt="Logo"
            blurDataURL={blurDataMap['/logo-lol.png']}
            sizes="32px"
            containerClassName="size-full"
            className="object-50%-50% object-cover"
          />
        </div>
      </div>
    </div>
  );
}
