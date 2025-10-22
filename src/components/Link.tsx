'use client';

import { useState } from 'react';
import { useKeyboardSound } from '@/hooks/useKeyboardSound';

interface LinkProps {
  className?: string;
  children: React.ReactNode;
  href?: string;
  state?: 'default' | 'hover';
  theme?: 'dark' | 'light';
  onClick?: () => void;
  style?: React.CSSProperties;
}

export default function Link({
  className,
  children,
  href,
  state = 'default',
  theme = 'light',
  onClick,
  style
}: LinkProps) {
  const [isHovered, setIsHovered] = useState(false);
  const playSound = useKeyboardSound();

  const getLinkStyles = () => {
    const isHover = state === 'hover' || isHovered;
    const baseStyles = "font-mono font-semibold leading-[16px] relative shrink-0 text-[12px] text-nowrap tracking-[0.24px] uppercase whitespace-pre cursor-pointer transition-all duration-200";
    
    if (theme === 'dark') {
      if (isHover) {
        return `${baseStyles} text-white`;
      }
      return `${baseStyles} text-[rgba(255,255,255,0.32)]`;
    } else {
      if (isHover) {
        return `${baseStyles} text-[rgba(13,13,13,0.64)]`;
      }
      return `${baseStyles} text-[rgba(13,13,13,0.32)]`;
    }
  };

  const handleClick = () => {
    playSound();
    if (onClick) {
      onClick();
    }
    if (href) {
      window.open(href, '_blank', 'noopener,noreferrer');
    }
  };

  const isInline = className?.includes('inline');
  
  if (isInline) {
    return (
      <span 
        className={`${getLinkStyles()} [text-underline-offset:25%] decoration-solid underline cursor-pointer`}
        style={style}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
      >
        {children}
      </span>
    );
  }

  return (
    <div 
      className={className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <p className={`${getLinkStyles()} [text-underline-offset:25%] decoration-solid underline`} style={style}>
        {children}
      </p>
    </div>
  );
}
