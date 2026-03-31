'use client';

import LogoMain from './LogoMain';
import Time from './Time';
import RunningNews from './RunningNews';
import Link from './Link';
import { usePageTransition } from '@/hooks/usePageTransition';

export default function NotFound() {
  const { navigate } = usePageTransition();

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
        <div className="basis-0 box-border content-stretch flex flex-col gap-[8px] grow items-center justify-center min-h-px min-w-px overflow-x-clip overflow-y-auto p-[8px] relative shrink-0 w-full" data-name="wrap" data-node-id="633:1957">
          <p className="font-mono font-bold leading-none relative shrink-0 text-[120px] text-[rgba(255,255,255,0.08)] text-nowrap uppercase whitespace-pre md:leading-[220px] md:text-[200px]" data-node-id="633:2058">
            404
          </p>
          <div className="content-stretch flex flex-col gap-[16px] items-center max-w-[400px] relative shrink-0 w-full" data-name="v-stack" data-node-id="633:2059">
            <div className="content-stretch flex gap-[8px] items-center justify-center relative shrink-0" data-name="link" data-node-id="633:2061">
              <Link 
                theme="dark" 
                onClick={() => navigate('/#work', 'back')}
                className="[text-underline-offset:25%] decoration-solid font-mono font-semibold leading-[16px] relative shrink-0 text-[12px] text-[rgba(255,255,255,0.32)] text-nowrap tracking-[0.24px] underline uppercase whitespace-pre"
              >
                go home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
