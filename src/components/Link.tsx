'use client';

import NextLink from 'next/link';
import { useState } from 'react';
import { useKeyboardSound } from '@/hooks/useKeyboardSound';

interface LinkProps {
  className?: string;
  children: React.ReactNode;
  href?: string;
  state?: 'default' | 'hover';
  theme?: 'dark' | 'light';
  type?: 'legacy' | 'primary' | 'secondary';
  onClick?: (event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => void;
  style?: React.CSSProperties;
}

export default function Link({
  className,
  children,
  href,
  state = 'default',
  theme = 'light',
  type = 'legacy',
  onClick,
  style
}: LinkProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const playSound = useKeyboardSound();
  const isInternalHref = Boolean(href && (href.startsWith('/') || href.startsWith('#')));

  const getLinkStyles = () => {
    const isHover = state === 'hover' || isHovered;
    const baseStyles = "font-mono font-semibold leading-[16px] relative shrink-0 text-[12px] text-nowrap tracking-[0.24px] uppercase whitespace-pre cursor-pointer transition-all duration-200";
    const pressClass = isPressed ? 'scale-95' : '';

    if (type === 'primary') {
      if (theme === 'dark') {
        const darkPrimaryColor = isHover ? 'text-[rgba(255,255,255,0.64)]' : 'text-white';
        return `${baseStyles} ${darkPrimaryColor} ${pressClass}`;
      }

      const lightPrimaryColor = isHover ? 'text-[rgba(13,13,13,0.64)]' : 'text-[rgba(13,13,13,0.32)]';
      return `${baseStyles} ${lightPrimaryColor} ${pressClass}`;
    }

    if (type === 'secondary') {
      if (theme === 'dark') {
        const darkSecondaryColor = isHover ? 'text-[rgba(255,255,255,0.8)]' : 'text-[rgba(255,255,255,0.32)]';
        return `${baseStyles} ${darkSecondaryColor} ${pressClass}`;
      }

      const lightSecondaryColor = isHover ? 'text-[rgba(13,13,13,0.64)]' : 'text-[rgba(13,13,13,0.32)]';
      return `${baseStyles} ${lightSecondaryColor} ${pressClass}`;
    }
    
    if (theme === 'dark') {
      if (isHover) {
        return `${baseStyles} text-white ${pressClass}`;
      }
      return `${baseStyles} text-[rgba(255,255,255,0.7)] ${pressClass}`;
    } else {
      if (isHover) {
        return `${baseStyles} text-[rgba(13,13,13,0.64)] ${pressClass}`;
      }
      return `${baseStyles} text-[rgba(13,13,13,0.32)] ${pressClass}`;
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    playSound();
    if (onClick) {
      onClick(event);
    }
  };

  const wrapperClassName = className ?? 'inline-block';
  const textClassName = `${getLinkStyles()} inline-block align-top [text-underline-offset:25%] decoration-solid underline`;
  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsPressed(false);
  };

  if (href) {
    if (isInternalHref) {
      return (
        <NextLink
          href={href}
          className={wrapperClassName}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={handleMouseLeave}
          onMouseDown={() => setIsPressed(true)}
          onMouseUp={() => setIsPressed(false)}
          onClick={handleClick}
        >
          <span className={textClassName} style={style}>
            {children}
          </span>
        </NextLink>
      );
    }

    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={wrapperClassName}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onClick={handleClick}
      >
        <span className={textClassName} style={style}>
          {children}
        </span>
      </a>
    );
  }

  return (
    <button
      type="button"
      className={`${wrapperClassName} border-0 bg-transparent p-0`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onClick={handleClick}
    >
      <span className={textClassName} style={style}>
        {children}
      </span>
    </button>
  );
}
