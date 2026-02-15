'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useKeyboardSound } from '@/hooks/useKeyboardSound';

const BLUR_DATA_URL =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj48cmVjdCB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIGZpbGw9IiNkOWQ5ZDkiLz48L3N2Zz4=';

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
          <Image 
            alt="Logo" 
            className="absolute inset-0 max-w-none object-50%-50% object-cover size-full" 
            src="/logo-lol.png"
            width={32}
            height={32}
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
          />
        </div>
      </div>
    </div>
  );
}

