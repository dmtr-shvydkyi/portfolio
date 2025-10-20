'use client';

import { useState, useEffect, useRef } from 'react';

interface TimeProps {
  className?: string;
}

export default function Time({ className }: TimeProps) {
  const [displayTime, setDisplayTime] = useState('00:00');
  const [showColon, setShowColon] = useState(true);
  const [isAnimating, setIsAnimating] = useState(true);
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const realTimeRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const getRealTime = () => {
      const now = new Date();
      const kyivTime = new Date(now.toLocaleString("en-US", {timeZone: "Europe/Kiev"}));
      
      const hours = kyivTime.getHours().toString().padStart(2, '0');
      const minutes = kyivTime.getMinutes().toString().padStart(2, '0');
      
      return `${hours}${showColon ? ':' : ' '}${minutes}`;
    };

    const generateRandomTime = () => {
      const randomHours = Math.floor(Math.random() * 24).toString().padStart(2, '0');
      const randomMinutes = Math.floor(Math.random() * 60).toString().padStart(2, '0');
      return `${randomHours}${showColon ? ':' : ' '}${randomMinutes}`;
    };

    // Start animation immediately
    animationRef.current = setInterval(() => {
      setDisplayTime(generateRandomTime());
    }, 100);

    // Stop animation after exactly 3 seconds
    setTimeout(() => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
        animationRef.current = null;
      }
      setIsAnimating(false);
      setDisplayTime(getRealTime());
      
      // Start real time updates
      realTimeRef.current = setInterval(() => {
        setDisplayTime(getRealTime());
      }, 1000);
    }, 3000);

    // Flash the colon every second
    const colonInterval = setInterval(() => {
      setShowColon(prev => !prev);
    }, 1000);

    return () => {
      if (animationRef.current) clearInterval(animationRef.current);
      if (realTimeRef.current) clearInterval(realTimeRef.current);
      clearInterval(colonInterval);
    };
  }, []);

  return (
    <div className={`${className} px-2`} data-name="time" data-node-id="622:1571">
      <div className="content-stretch flex items-center relative shrink-0" data-name="h-stack-0" data-node-id="622:1566">
        <p className="relative shrink-0 font-mono tabular-nums" data-node-id="622:1567">{displayTime}</p>
        <p className="relative shrink-0" data-node-id="622:1568">,</p>
      </div>
      <p className="relative shrink-0" data-node-id="622:1569">Kyiv</p>
    </div>
  );
}
