'use client';

import { useState } from 'react';
import { useKeyboardSound } from '@/hooks/useKeyboardSound';
import { TAB_LABELS, type TabId } from '@/types/tabs';

interface TabsNavigationProps {
  className?: string;
  selected?: TabId;
  onTabChange?: (tab: TabId) => void;
  tabHrefMap?: Partial<Record<TabId, string>>;
}

interface TabProps {
  id: TabId;
  label: string;
  isSelected: boolean;
  onSelect?: () => void;
  href?: string;
}

function Tab({ id, label, isSelected, onSelect, href }: TabProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const playSound = useKeyboardSound();

  const getTabStyles = () => {
    const baseStyles = "box-border content-stretch flex gap-[8px] items-center justify-center px-[4px] py-[2px] relative shrink-0 cursor-pointer transition-all duration-200 border-0 bg-transparent outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0";
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

  const handlePointerUp = () => {
    setIsPressed(false);
  };

  const handleActivate = () => {
    playSound();
    onSelect?.();
  };

  const handlePointerLeave = () => {
    setIsHovered(false);
    setIsPressed(false);
  };

  if (href) {
    return (
      <a
        href={href}
        className={getTabStyles()}
        data-name={`tab-${id}`}
        onMouseDown={handleMouseDown}
        onMouseUp={handlePointerUp}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handlePointerLeave}
        onClick={handleActivate}
      >
        <p className={getTextStyles()}>{label}</p>
      </a>
    );
  }

  return (
    <button
      type="button"
      className={getTabStyles()}
      onMouseDown={handleMouseDown}
      onMouseUp={handlePointerUp}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handlePointerLeave}
      onClick={handleActivate}
      data-name={`tab-${id}`}
    >
      <p className={getTextStyles()}>{label}</p>
    </button>
  );
}

export default function TabsNavigation({ className, selected = 'work', onTabChange, tabHrefMap }: TabsNavigationProps) {
  const tabs: TabId[] = ['work', 'info', 'play', 'resume'];

  return (
    <div className={className} data-name="tabs-navigation" data-node-id="630:1590">
      {tabs.map((tab) => (
        <Tab
          key={tab}
          id={tab}
          label={TAB_LABELS[tab]}
          isSelected={selected === tab}
          onSelect={() => onTabChange?.(tab)}
          href={tabHrefMap?.[tab]}
        />
      ))}
    </div>
  );
}
