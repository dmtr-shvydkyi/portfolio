'use client';

import { useState } from 'react';
import { useKeyboardSound } from '@/hooks/useKeyboardSound';

interface InfoLinkProps {
  children: React.ReactNode;
  href: string;
}

export default function InfoLink({ children, href }: InfoLinkProps) {
  const [isHovered, setIsHovered] = useState(false);
  const playSound = useKeyboardSound();

  const handleClick = () => {
    playSound();
    if (href) {
      window.open(href, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <span
      className={`font-mono font-bold text-white underline cursor-pointer transition-opacity duration-200 ${
        isHovered ? 'opacity-80' : 'opacity-100'
      }`}
      style={{ textTransform: 'none', textUnderlineOffset: '2px' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {children}
    </span>
  );
}

