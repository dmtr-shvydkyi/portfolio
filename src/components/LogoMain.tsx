'use client';

import { useState } from 'react';
import { useKeyboardSound } from '@/hooks/useKeyboardSound';

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
          <img 
            alt="Logo" 
            className="absolute inset-0 max-w-none object-50%-50% object-cover size-full" 
            src="/logo-lol.png"
            width={32}
            height={32}
          />
        </div>
      </div>
    </div>
  );
}


