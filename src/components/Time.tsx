'use client';

import { useState, useEffect } from 'react';

interface TimeProps {
  className?: string;
}

export default function Time({ className }: TimeProps) {
  const [time, setTime] = useState('');
  const [showColon, setShowColon] = useState(true);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const kyivTime = new Date(now.toLocaleString("en-US", {timeZone: "Europe/Kiev"}));
      
      const hours = kyivTime.getHours().toString().padStart(2, '0');
      const minutes = kyivTime.getMinutes().toString().padStart(2, '0');
      
      setTime(`${hours}${showColon ? ':' : ' '}${minutes}`);
    };

    // Update time immediately
    updateTime();

    // Update time every second
    const timeInterval = setInterval(updateTime, 1000);

    // Flash the colon every second
    const colonInterval = setInterval(() => {
      setShowColon(prev => !prev);
    }, 1000);

    return () => {
      clearInterval(timeInterval);
      clearInterval(colonInterval);
    };
  }, [showColon]);

  return (
    <div className={className} data-name="time" data-node-id="622:1571">
      <div className="content-stretch flex items-center relative shrink-0" data-name="h-stack-0" data-node-id="622:1566">
        <p className="relative shrink-0" data-node-id="622:1567">{time}</p>
        <p className="relative shrink-0" data-node-id="622:1568">,</p>
      </div>
      <p className="relative shrink-0" data-node-id="622:1569">Kyiv</p>
    </div>
  );
}
