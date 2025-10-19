'use client';

import { useState } from 'react';

interface ConnectButtonProps {
  className?: string;
  state?: 'opened' | 'default';
}

export default function ConnectButton({ className, state = "default" }: ConnectButtonProps) {
  const [isOpened, setIsOpened] = useState(false);
  const [isCloseHovered, setIsCloseHovered] = useState(false);

  const handleToggle = () => {
    setIsOpened(!isOpened);
  };

  if (isOpened || state === "opened") {
    return (
      <div className={`${className} bg-white content-stretch flex flex-col gap-[4px] items-end justify-end relative shrink-0 w-[80px]`} data-name="state=opened" data-node-id="590:10363">
        <div className="box-border content-stretch flex flex-col gap-[4px] items-end justify-center px-[4px] py-[2px] relative shrink-0" data-name="h-stack-4" data-node-id="590:10350">
          <div className="content-stretch flex gap-[8px] items-center justify-center relative shrink-0" data-name="link" data-node-id="590:10351">
            <a 
              href="https://linkedin.com/in/dmitryshvydkyi"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono font-semibold leading-[16px] relative shrink-0 text-[12px] text-[rgba(13,13,13,0.32)] text-nowrap tracking-[0.24px] uppercase whitespace-pre cursor-pointer hover:text-[rgba(13,13,13,0.64)] [text-underline-offset:25%] decoration-solid underline"
            >
              linkedin
            </a>
          </div>
          <div className="content-stretch flex gap-[8px] items-center justify-center relative shrink-0" data-name="link" data-node-id="590:10352">
            <a 
              href="https://twitter.com/dmitryshvydkyi"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono font-semibold leading-[16px] relative shrink-0 text-[12px] text-[rgba(13,13,13,0.32)] text-nowrap tracking-[0.24px] uppercase whitespace-pre cursor-pointer hover:text-[rgba(13,13,13,0.64)] [text-underline-offset:25%] decoration-solid underline"
            >
              Twitter
            </a>
          </div>
          <div className="content-stretch flex gap-[8px] items-center justify-center relative shrink-0" data-name="link" data-node-id="590:10353">
            <a 
              href="mailto:hello@dmitryshvydkyi.com"
              className="font-mono font-semibold leading-[16px] relative shrink-0 text-[12px] text-[rgba(13,13,13,0.32)] text-nowrap tracking-[0.24px] uppercase whitespace-pre cursor-pointer hover:text-[rgba(13,13,13,0.64)] [text-underline-offset:25%] decoration-solid underline"
            >
              email
            </a>
          </div>
        </div>
        <button 
          className="box-border content-stretch cursor-pointer flex gap-[8px] items-center justify-center overflow-visible px-[4px] py-[2px] relative shrink-0" 
          data-name="button" 
          data-node-id="590:10425"
          onClick={handleToggle}
          onMouseEnter={() => setIsCloseHovered(true)}
          onMouseLeave={() => setIsCloseHovered(false)}
        >
          <p className={`font-mono font-semibold leading-[16px] relative shrink-0 text-[12px] text-nowrap tracking-[0.24px] uppercase whitespace-pre ${isCloseHovered ? 'text-[rgba(13,13,13,0.48)]' : 'text-[rgba(13,13,13,0.88)]'}`} data-node-id="I590:10425;590:10417">
            Close
          </p>
        </button>
      </div>
    );
  }

  return (
    <button 
      className={className} 
      data-name="state=default" 
      data-node-id="590:10362"
      onClick={handleToggle}
    >
      <div className="box-border content-stretch flex gap-[8px] items-center justify-center px-[4px] py-[2px] relative shrink-0" data-name="tab" data-node-id="590:10359">
        <p className="font-mono font-semibold leading-[16px] relative shrink-0 text-[12px] text-[rgba(255,255,255,0.32)] text-nowrap tracking-[0.24px] uppercase whitespace-pre" data-node-id="I590:10359;550:35887">
          04 Connect
        </p>
      </div>
    </button>
  );
}
