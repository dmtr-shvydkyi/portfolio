'use client';

import { useState, useEffect } from 'react';
import SharedLayout from '@/components/SharedLayout';
import Work from '@/components/Work';
import About from '@/components/About';
import Resume from '@/components/Resume';
import { useKeyboardSound } from '@/hooks/useKeyboardSound';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'work' | 'info' | 'resume'>('work');
  const [connectToggleTrigger, setConnectToggleTrigger] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const playSound = useKeyboardSound();

  // Fade in animation on mount
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case '1':
          playSound();
          setActiveTab('work');
          break;
        case '2':
          playSound();
          setActiveTab('info');
          break;
        case '3':
          playSound();
          setActiveTab('resume');
          break;
        case '4':
          playSound();
          // Trigger connect button toggle
          setConnectToggleTrigger(prev => prev + 1);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          playSound();
          setActiveTab(prev => {
            if (prev === 'work') return 'resume';
            if (prev === 'info') return 'work';
            return 'info';
          });
          break;
        case 'ArrowRight':
          e.preventDefault();
          playSound();
          setActiveTab(prev => {
            if (prev === 'work') return 'info';
            if (prev === 'info') return 'resume';
            return 'work';
          });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playSound]);

  return (
    <div className="relative size-full">
      {/* White overlay that fades out */}
      <div 
        className={`fixed inset-0 bg-white z-50 transition-opacity duration-[1400ms] pointer-events-none ${isLoaded ? 'opacity-0' : 'opacity-100'}`}
      />
      
      {/* Main content */}
      <SharedLayout 
        selectedTab={activeTab} 
        onTabChange={setActiveTab}
        connectToggleTrigger={connectToggleTrigger}
      >
        <div className="relative w-full h-full flex">
          <div 
            className={`absolute inset-0 flex transition-opacity duration-300 ${activeTab === 'work' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          >
            <Work />
          </div>
          <div 
            className={`absolute inset-0 flex transition-opacity duration-300 ${activeTab === 'info' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          >
            <About />
          </div>
          <div 
            className={`absolute inset-0 flex transition-opacity duration-300 ${activeTab === 'resume' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          >
            <Resume />
          </div>
        </div>
      </SharedLayout>
    </div>
  );
}
