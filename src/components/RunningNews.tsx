'use client';

import { useState, useEffect } from 'react';
import { getRandomNews } from '@/data/newsData';

interface RunningNewsProps {
  className?: string;
  state?: '2' | '1';
}

export default function RunningNews({ className }: RunningNewsProps) {
  const [newsText, setNewsText] = useState('The golden ratio has been used in design and architecture for thousands of years. Helvetica is one of the world\'s most widely used typefaces.');

  useEffect(() => {
    // Set random news on component mount
    setNewsText(getRandomNews());
  }, []);

  return (
    <div className={`${className} overflow-hidden`} data-name="State=1" data-node-id="622:1625">
      <div className="animate-scroll whitespace-nowrap flex items-center h-full">
        <p className="font-mono font-semibold leading-[16px] relative shrink-0 text-[12px] text-white tracking-[0.24px] uppercase inline-block" data-node-id="622:1620">
          {newsText}
        </p>
        {/* Duplicate text for seamless loop */}
        <p className="font-mono font-semibold leading-[16px] relative shrink-0 text-[12px] text-white tracking-[0.24px] uppercase inline-block ml-8" data-node-id="622:1620-duplicate">
          {newsText}
        </p>
      </div>
    </div>
  );
}
