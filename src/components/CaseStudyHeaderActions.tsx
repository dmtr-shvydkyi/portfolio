'use client';

import { useState } from 'react';
import Link from './Link';
import { useKeyboardSound } from '@/hooks/useKeyboardSound';
import { usePageTransition } from '@/hooks/usePageTransition';
import type { WorkProjectLink } from '@/data/workProjects';

interface CaseStudyHeaderActionsProps {
  backHref: string;
  links: WorkProjectLink[];
  className?: string;
}

const RESTORE_HOME_SCROLL_KEY = 'portfolio-restore-home-scroll';

export default function CaseStudyHeaderActions({ backHref, links, className }: CaseStudyHeaderActionsProps) {
  const { navigate } = usePageTransition();
  const playSound = useKeyboardSound();
  const [isBackHovered, setIsBackHovered] = useState(false);
  const [isBackPressed, setIsBackPressed] = useState(false);

  const backButtonClassName = [
    'box-border inline-flex shrink-0 items-center justify-center',
    'appearance-none border-0 outline-none',
    'cursor-pointer',
    'bg-[rgba(255,255,255,0.16)]',
    'px-[4px] py-[2px]',
    'h-[20px]',
    'transition-all duration-200',
    isBackPressed ? 'scale-95' : '',
    isBackHovered ? 'bg-[rgba(255,255,255,0.24)]' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const backTextClassName = [
    'font-mono text-[12px] font-semibold leading-[16px] tracking-[0.24px] uppercase',
    'transition-colors duration-200',
    isBackHovered ? 'text-white' : 'text-[rgba(255,255,255,0.88)]',
  ]
    .filter(Boolean)
    .join(' ');

  const handleBackClick = () => {
    playSound();
    sessionStorage.setItem(RESTORE_HOME_SCROLL_KEY, '1');
    navigate(backHref, 'back');
  };

  return (
    <div className={['flex w-full items-center justify-between', className ?? ''].filter(Boolean).join(' ')}>
      <button
        type="button"
        className={backButtonClassName}
        onClick={handleBackClick}
        onMouseEnter={() => setIsBackHovered(true)}
        onMouseLeave={() => {
          setIsBackHovered(false);
          setIsBackPressed(false);
        }}
        onMouseDown={() => setIsBackPressed(true)}
        onMouseUp={() => setIsBackPressed(false)}
      >
        <span className={backTextClassName}>Back</span>
      </button>

      <div className="flex items-center gap-[4px]">
        {links.map((link, index) => (
          <div key={link.text} className="flex items-center gap-[4px]">
            {index > 0 ? (
              <p className="w-[8px] text-center font-mono text-[12px] font-semibold leading-[16px] tracking-[0.24px] text-[rgba(255,255,255,0.4)] uppercase">
                ·
              </p>
            ) : null}
            <Link theme="dark" type="primary" href={link.url} className="inline-flex items-center select-none">
              {link.text}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
