'use client';

import { useState, useEffect } from 'react';
import { useKeyboardSound } from '@/hooks/useKeyboardSound';

interface ConnectButtonProps {
  className?: string;
  state?: 'opened' | 'default';
  toggleTrigger?: number;
}

export default function ConnectButton({ className, state = "default", toggleTrigger }: ConnectButtonProps) {
  const [isOpened, setIsOpened] = useState(state === "opened");
  const [isCloseHovered, setIsCloseHovered] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isConnectPressed, setIsConnectPressed] = useState(false);
  const [isClosePressed, setIsClosePressed] = useState(false);
  const playSound = useKeyboardSound();

  // Listen for external toggle trigger (sound already played by parent)
  useEffect(() => {
    if (toggleTrigger && toggleTrigger > 0) {
      setIsOpened(prev => !prev);
    }
  }, [toggleTrigger]);

  const handleToggle = () => {
    setIsOpened(!isOpened);
  };

  const getButtonStyles = () => {
    const baseStyles = "box-border content-stretch flex gap-[8px] items-center justify-center px-[4px] py-[2px] relative shrink-0 cursor-pointer transition-all duration-200";
    const scaleClass = isConnectPressed ? "scale-95" : "";
    if (isHovered) {
      return `${baseStyles} bg-[rgba(255,255,255,0.80)] ${scaleClass}`;
    }
    return `${baseStyles} bg-white ${scaleClass}`;
  };

  const getTextStyles = () => {
    const baseStyles = "font-mono font-semibold leading-[16px] relative shrink-0 text-[12px] text-nowrap tracking-[0.24px] uppercase whitespace-pre transition-all duration-200";
    if (isHovered) {
      return `${baseStyles} text-[rgba(13,13,13,0.64)]`;
    }
    return `${baseStyles} text-[rgba(13,13,13,0.88)]`;
  };

  const handleConnectMouseDown = () => {
    setIsConnectPressed(true);
  };

  const handleConnectMouseUp = () => {
    setIsConnectPressed(false);
    playSound();
    handleToggle();
  };

  const handleConnectMouseLeave = () => {
    setIsHovered(false);
    setIsConnectPressed(false);
  };

  const handleCloseMouseDown = () => {
    setIsClosePressed(true);
  };

  const handleCloseMouseUp = () => {
    setIsClosePressed(false);
    playSound();
    handleToggle();
  };

  const handleCloseMouseLeave = () => {
    setIsCloseHovered(false);
    setIsClosePressed(false);
  };

  return (
    <div className={`${className} relative overflow-hidden`}>
      {/* Opened state */}
      <div 
        className={`bg-white content-stretch flex flex-col gap-[4px] items-end justify-end absolute right-0 bottom-0 transition-opacity ease-in-out z-50 ${isOpened ? 'opacity-100 duration-300' : 'opacity-0 duration-150 pointer-events-none'}`}
        style={{ width: '83px' }}
        data-name="state=opened" 
        data-node-id="590:10363"
      >
        <div className="box-border content-stretch flex flex-col gap-[4px] items-end justify-center px-[4px] py-[2px] relative shrink-0" data-name="h-stack-4" data-node-id="590:10350">
          <div className="content-stretch flex gap-[8px] items-center justify-center relative shrink-0" data-name="link" data-node-id="590:10351">
            <a 
              href="https://www.linkedin.com/in/shvydkyi/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={playSound}
              className="font-mono font-semibold leading-[16px] relative shrink-0 text-[12px] text-[rgba(13,13,13,0.32)] text-nowrap tracking-[0.24px] uppercase whitespace-pre cursor-pointer hover:text-[rgba(13,13,13,0.64)] [text-underline-offset:25%] decoration-solid underline transition-all duration-200"
            >
              LINKEDIN
            </a>
          </div>
          <div className="content-stretch flex gap-[8px] items-center justify-center relative shrink-0" data-name="link" data-node-id="590:10352">
            <a 
              href="https://x.com/shvydkyi_"
              target="_blank"
              rel="noopener noreferrer"
              onClick={playSound}
              className="font-mono font-semibold leading-[16px] relative shrink-0 text-[12px] text-[rgba(13,13,13,0.32)] text-nowrap tracking-[0.24px] uppercase whitespace-pre cursor-pointer hover:text-[rgba(13,13,13,0.64)] [text-underline-offset:25%] decoration-solid underline transition-all duration-200"
            >
              TWITTER
            </a>
          </div>
          <div className="content-stretch flex gap-[8px] items-center justify-center relative shrink-0" data-name="link" data-node-id="590:10353">
            <a 
              href="mailto:shvydkyi.dmytro@gmail.com"
              onClick={playSound}
              className="font-mono font-semibold leading-[16px] relative shrink-0 text-[12px] text-[rgba(13,13,13,0.32)] text-nowrap tracking-[0.24px] uppercase whitespace-pre cursor-pointer hover:text-[rgba(13,13,13,0.64)] [text-underline-offset:25%] decoration-solid underline transition-all duration-200"
            >
              EMAIL
            </a>
          </div>
        </div>
        <button 
          className={`box-border content-stretch cursor-pointer flex gap-[8px] items-center justify-center overflow-visible px-[4px] py-[2px] relative shrink-0 transition-all duration-200 ${isClosePressed ? 'scale-95' : ''}`}
          data-name="button" 
          data-node-id="590:10425"
          onMouseDown={handleCloseMouseDown}
          onMouseUp={handleCloseMouseUp}
          onMouseEnter={() => setIsCloseHovered(true)}
          onMouseLeave={handleCloseMouseLeave}
        >
          <p className={`font-mono font-semibold leading-[16px] relative shrink-0 text-[12px] text-nowrap tracking-[0.24px] uppercase whitespace-pre transition-all duration-200 ${isCloseHovered ? 'text-[rgba(13,13,13,0.48)]' : 'text-[rgba(13,13,13,0.88)]'}`} data-node-id="I590:10425;590:10417">
            CLOSE
          </p>
        </button>
      </div>

      {/* Default state */}
      <button 
        className={`transition-opacity ease-in-out ${isOpened ? 'opacity-0 duration-150 pointer-events-none' : 'opacity-100 duration-300'}`}
        data-name="state=default" 
        data-node-id="590:10362"
        onMouseDown={handleConnectMouseDown}
        onMouseUp={handleConnectMouseUp}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleConnectMouseLeave}
      >
        <div className={getButtonStyles()} data-name="tab" data-node-id="590:10359">
          <p className={getTextStyles()} data-node-id="I590:10359;550:35887">
            CONNECT
          </p>
        </div>
      </button>
    </div>
  );
}
