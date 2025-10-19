'use client';

import { useState } from 'react';
import LogoMain from './LogoMain';
import TabsNavigation from './TabsNavigation';
import ConnectButton from './ConnectButton';
import RunningNews from './RunningNews';
import Time from './Time';
import Link from './Link';

interface SharedLayoutProps {
  children: React.ReactNode;
  selectedTab: 'work' | 'info' | 'resume';
}

export default function SharedLayout({ children, selectedTab }: SharedLayoutProps) {
  const [selectedTabState, setSelectedTabState] = useState<'work' | 'info' | 'resume'>(selectedTab);

  const handleTabChange = (tab: 'work' | 'info' | 'resume') => {
    setSelectedTabState(tab);
    if (tab === 'work') {
      window.location.href = '/';
    } else if (tab === 'info') {
      window.location.href = '/about';
    }
  };

  return (
    <div className="bg-white content-stretch flex flex-col items-start relative size-full md:grid md:grid-cols-[repeat(4,_minmax(0px,_1fr))]">
      {/* Mobile: Left panel - fixed height 200px */}
      <div className="content-stretch flex flex-col h-[200px] items-start justify-between relative shrink-0 w-full md:[grid-area:1_/_1] md:h-screen">
        <div className="basis-0 box-border content-stretch flex flex-col grow items-start justify-between min-h-px min-w-px p-[8px] relative shrink-0 w-full">
          <LogoMain className="overflow-clip relative shrink-0 size-[32px]"/>
          <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full">
            <p className="font-mono font-bold leading-[26px] min-w-full relative shrink-0 text-[#0d0d0d] text-[20px] md:text-[0px] md:text-[22px] uppercase w-[min-content]">
              <span>Dmytro Shvydkyi<br aria-hidden="true"/></span>
              <span className="text-[rgba(13,13,13,0.32)] font-mono font-bold text-[22px]">Product Designer</span>
            </p>
            <div className="content-stretch flex gap-[6px] items-start relative shrink-0">
              <p className="font-mono font-semibold leading-[16px] relative shrink-0 text-[12px] text-[rgba(13,13,13,0.32)] text-nowrap tracking-[0.24px] uppercase whitespace-pre">Currently at</p>
              <Link 
                className="content-stretch flex gap-[8px] items-center justify-center relative shrink-0" 
                theme="light"
                href="https://skylum.com"
              >
                Skylum
              </Link>
            </div>
          </div>
        </div>
        <div className="box-border content-stretch flex gap-[8px] items-start p-[8px] relative shrink-0 w-full">
          <Time className="bg-[#0d0d0d] box-border content-stretch flex font-mono font-semibold gap-[2px] items-start leading-[16px] px-[4px] py-[2px] relative shrink-0 text-[12px] text-nowrap text-white tracking-[0.24px] uppercase whitespace-pre" />
          <RunningNews className="basis-0 bg-[#0d0d0d] box-border content-stretch flex gap-[20px] grow items-center min-h-px min-w-px overflow-clip px-[4px] py-[2px] relative shrink-0"/>
        </div>
      </div>
      
      {/* Mobile: Right panel - takes remaining space */}
      <div className="basis-0 bg-[#0d0d0d] content-stretch flex flex-col grow items-center min-h-px min-w-px overflow-clip relative shrink-0 w-full md:[grid-area:1_/_2_/_auto_/_span_3] md:h-screen">
        <div className="basis-0 box-border content-stretch flex flex-col gap-[8px] grow items-start min-h-px min-w-px overflow-x-clip overflow-y-auto p-[8px] relative shrink-0 w-full">
          {children}
        </div>
        <div className="box-border content-stretch flex h-[36px] items-end justify-between p-[8px] relative shrink-0 w-full">
          <TabsNavigation 
            selected={selectedTabState}
            className="content-stretch flex gap-[8px] items-center relative shrink-0"
            onTabChange={handleTabChange}
          />
          <ConnectButton className="box-border content-stretch cursor-pointer flex items-end justify-end overflow-visible p-0 relative shrink-0"/>
        </div>
      </div>
    </div>
  );
}


