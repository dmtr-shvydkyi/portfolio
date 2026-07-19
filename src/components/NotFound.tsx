'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import LogoMain from './LogoMain';
import Time from './Time';
import RunningNews from './RunningNews';
import Link from './Link';
import { usePageTransition } from '@/hooks/usePageTransition';

const INTRO_HOLD_MS = 300;
const INTRO_FADE_MS = 200;
const GAME_REVEAL_DELAY_MS = 16;

const loadBreakout404 = () => import('./Breakout404');

const Breakout404 = dynamic(loadBreakout404, {
  ssr: false,
  loading: () => null,
});

function StaticNotFound() {
  return (
    <div className="basis-0 box-border content-stretch flex flex-col gap-[8px] grow items-center justify-center min-h-px min-w-px overflow-x-clip overflow-y-auto p-[8px] relative shrink-0 w-full">
      <p className="font-mono font-bold leading-none relative shrink-0 text-[120px] text-[rgba(255,255,255,0.08)] text-nowrap uppercase whitespace-pre md:leading-[220px] md:text-[200px]">
        404
      </p>
    </div>
  );
}

export default function NotFound() {
  const { navigate } = usePageTransition();
  const [isIntroVisible, setIsIntroVisible] = useState(true);
  const [isGameMounted, setIsGameMounted] = useState(false);
  const [isGameVisible, setIsGameVisible] = useState(false);

  useEffect(() => {
    void loadBreakout404();

    const fadeIntroTimer = window.setTimeout(() => {
      setIsIntroVisible(false);
    }, INTRO_HOLD_MS);

    const mountGameTimer = window.setTimeout(() => {
      setIsGameMounted(true);
    }, INTRO_HOLD_MS + INTRO_FADE_MS);

    const revealGameTimer = window.setTimeout(() => {
      setIsGameVisible(true);
    }, INTRO_HOLD_MS + INTRO_FADE_MS + GAME_REVEAL_DELAY_MS);

    return () => {
      window.clearTimeout(fadeIntroTimer);
      window.clearTimeout(mountGameTimer);
      window.clearTimeout(revealGameTimer);
    };
  }, []);

  return (
    <div
      className="app-shell box-border bg-[#0d0d0d] content-stretch flex flex-col gap-[8px] items-start p-[8px] relative w-full md:grid md:grid-cols-[repeat(4,_minmax(0px,_1fr))] md:gap-0 md:p-0 md:bg-white"
      data-name="404"
      data-node-id="633:1944"
      data-not-found-page
    >
      <div className="bg-white content-stretch flex flex-col h-[200px] items-start justify-between relative shrink-0 w-full md:[grid-area:1_/_1] md:h-full" data-name="left-stack" data-node-id="633:1945">
        <div className="basis-0 box-border content-stretch flex flex-col grow items-start justify-between min-h-px min-w-px p-[8px] relative shrink-0 w-full">
          <LogoMain className="overflow-clip relative shrink-0 size-[32px]" onClick={() => navigate('/#work', 'back')} />
          <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full">
            <p className="font-mono font-bold leading-[26px] min-w-full relative shrink-0 text-[#0d0d0d] text-[20px] md:text-[0px] md:text-[22px] uppercase w-[min-content]">
              <span>
                Dmytro Shvydkyi
                <br aria-hidden="true" />
              </span>
              <span className="text-[rgba(13,13,13,0.32)] font-mono font-bold text-[22px]">Product Designer</span>
            </p>
            <div className="content-stretch flex gap-[6px] items-start relative shrink-0">
              <p className="font-mono font-semibold leading-[16px] relative shrink-0 text-[12px] text-[rgba(13,13,13,0.32)] text-nowrap tracking-[0.24px] uppercase whitespace-pre">
                Currently at
              </p>
              <Link className="content-stretch flex gap-[8px] items-center justify-center relative shrink-0" theme="light" href="https://skylum.com">
                Skylum
              </Link>
            </div>
          </div>
        </div>
        <div className="box-border content-stretch flex gap-[8px] items-start p-[8px] relative shrink-0 w-full" data-name="status-bar" data-node-id="633:1953">
          <Time
            className="bg-[#0d0d0d] box-border content-stretch flex font-mono font-semibold gap-[2px] items-start leading-[16px] px-[4px] py-[2px] relative shrink-0 text-[12px] text-nowrap text-white tracking-[0.24px] uppercase whitespace-pre"
            locationLabel="Mercury"
          />
          <RunningNews
            className="basis-0 bg-[#0d0d0d] box-border content-stretch flex gap-[20px] grow items-center min-h-px min-w-px overflow-clip px-[4px] py-[2px] relative shrink-0"
            text="Where am I · Who am I · When am I"
          />
        </div>
      </div>
      <div className="basis-0 bg-[#0d0d0d] content-stretch flex flex-col grow items-center min-h-0 min-w-px overflow-clip relative shrink-0 w-full md:[grid-area:1_/_2_/_auto_/_span_3] md:h-full md:min-h-px" data-name="right-stack" data-node-id="633:1956">
        <div
          className={`absolute inset-0 z-10 flex transition-opacity duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:duration-100 ${isIntroVisible ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
          data-404-intro
          aria-hidden={!isIntroVisible}
        >
          <StaticNotFound />
        </div>
        {isGameMounted ? (
          <div
            className={`absolute inset-0 flex transition-opacity duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:duration-100 ${isGameVisible ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
            data-404-game
            aria-hidden={!isGameVisible}
          >
            <Breakout404 />
          </div>
        ) : null}
      </div>
    </div>
  );
}
