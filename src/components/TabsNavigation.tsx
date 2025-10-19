'use client';

import { useState } from 'react';

interface TabsNavigationProps {
  className?: string;
  selected?: 'work' | 'info' | 'resume';
  onTabChange?: (tab: 'work' | 'info' | 'resume') => void;
}

interface TabProps {
  id: 'work' | 'info' | 'resume';
  label: string;
  isSelected: boolean;
  onClick: () => void;
}

function Tab({ id, label, isSelected, onClick }: TabProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getTabStyles = () => {
    if (isSelected) {
      return "bg-white box-border content-stretch flex gap-[8px] items-center justify-center px-[4px] py-[2px] relative shrink-0 cursor-pointer";
    }
    if (isHovered) {
      return "box-border content-stretch flex gap-[8px] items-center justify-center px-[4px] py-[2px] relative shrink-0 cursor-pointer bg-white/10";
    }
    return "box-border content-stretch flex gap-[8px] items-center justify-center px-[4px] py-[2px] relative shrink-0 cursor-pointer";
  };

  const getTextStyles = () => {
    if (isSelected) {
      return "font-mono font-semibold leading-[16px] relative shrink-0 text-[12px] text-[rgba(13,13,13,0.88)] text-nowrap tracking-[0.24px] uppercase whitespace-pre";
    }
    if (isHovered) {
      return "font-mono font-semibold leading-[16px] relative shrink-0 text-[12px] text-[rgba(255,255,255,0.6)] text-nowrap tracking-[0.24px] uppercase whitespace-pre";
    }
    return "font-mono font-semibold leading-[16px] relative shrink-0 text-[12px] text-[rgba(255,255,255,0.32)] text-nowrap tracking-[0.24px] uppercase whitespace-pre";
  };

  return (
    <div 
      className={getTabStyles()}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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
    { id: 'work' as const, label: '01 Work' },
    { id: 'info' as const, label: '02 Info' },
    { id: 'resume' as const, label: '03 Resume' }
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
