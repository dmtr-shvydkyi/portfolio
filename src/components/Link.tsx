'use client';

import { useState } from 'react';

interface LinkProps {
  className?: string;
  children: React.ReactNode;
  href?: string;
  state?: 'default' | 'hover';
  theme?: 'dark' | 'light';
  onClick?: () => void;
}

export default function Link({ 
  className, 
  children, 
  href, 
  state = 'default', 
  theme = 'light',
  onClick 
}: LinkProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getLinkStyles = () => {
    const isHover = state === 'hover' || isHovered;
    
    if (theme === 'dark') {
      if (isHover) {
        return "font-mono font-semibold leading-[16px] relative shrink-0 text-[12px] text-white text-nowrap tracking-[0.24px] uppercase whitespace-pre cursor-pointer";
      }
      return "font-mono font-semibold leading-[16px] relative shrink-0 text-[12px] text-white text-nowrap tracking-[0.24px] uppercase whitespace-pre cursor-pointer";
    } else {
      if (isHover) {
        return "font-mono font-semibold leading-[16px] relative shrink-0 text-[12px] text-[rgba(13,13,13,0.64)] text-nowrap tracking-[0.24px] uppercase whitespace-pre cursor-pointer";
      }
      return "font-mono font-semibold leading-[16px] relative shrink-0 text-[12px] text-[rgba(13,13,13,0.32)] text-nowrap tracking-[0.24px] uppercase whitespace-pre cursor-pointer";
    }
  };

  const handleClick = () => {
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
      <p className={`${getLinkStyles()} [text-underline-offset:25%] decoration-solid underline`}>
        {children}
      </p>
    </div>
  );
}
