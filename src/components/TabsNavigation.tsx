'use client';

import { useState } from 'react';
import { useKeyboardSound } from '@/hooks/useKeyboardSound';

interface TabsNavigationProps {
  className?: string;
  selected?: 'work' | 'info' | 'play' | 'resume';
  onTabChange?: (tab: 'work' | 'info' | 'play' | 'resume') => void;
}

interface TabProps {
  id: 'work' | 'info' | 'play' | 'resume';
  label: string;
  isSelected: boolean;
  onClick: () => void;
}

function Tab({ id, label, isSelected, onClick }: TabProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const playSound = useKeyboardSound();

  const getTabStyles = () => {
    const baseStyles = "box-border content-stretch flex gap-[8px] items-center justify-center px-[4px] py-[2px] relative shrink-0 cursor-pointer transition-all duration-200";
    const scaleClass = isPressed ? "scale-95" : "";
    if (isSelected) {
      return `${baseStyles} bg-white ${scaleClass}`;
    }
    if (isHovered) {
      return `${baseStyles} bg-white/10 ${scaleClass}`;
    }
    return `${baseStyles} ${scaleClass}`;
  };

  const getTextStyles = () => {
    const baseStyles = "font-mono font-semibold leading-[16px] relative shrink-0 text-[12px] text-nowrap tracking-[0.24px] uppercase whitespace-pre transition-all duration-200";
    if (isSelected) {
      return `${baseStyles} text-[rgba(13,13,13,0.88)]`;
    }
    if (isHovered) {
      return `${baseStyles} text-[rgba(255,255,255,0.6)]`;
    }
    return `${baseStyles} text-[rgba(255,255,255,0.32)]`;
  };

  const handleMouseDown = () => {
    setIsPressed(true);
  };

  const handleMouseUp = () => {
    setIsPressed(false);
    playSound();
    onClick();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsPressed(false);
  };

  return (
    <div 
      className={getTabStyles()}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      data-name={`tab-${id}`}
    >
      <p className={getTextStyles()}>
        {label}
      </p>
    </div>
  );
}

export default function TabsNavigation({ className, selected = "work", onTabChange }: TabsNavigationProps) {
  const tabs = [
    { id: 'work' as const, label: 'WORK' },
    { id: 'info' as const, label: 'ABOUT' },
    { id: 'play' as const, label: 'PLAY' },
    { id: 'resume' as const, label: 'CV' }
  ];

  return (
    <div className={className} data-name="tabs-navigation" data-node-id="630:1590">
      {tabs.map((tab) => (
        <Tab
          key={tab.id}
          id={tab.id}
          label={tab.label}
          isSelected={selected === tab.id}
          onClick={() => onTabChange?.(tab.id)}
        />
      ))}
    </div>
  );
}
