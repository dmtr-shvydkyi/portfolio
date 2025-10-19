'use client';

import Time from './Time';
import RunningNews from './RunningNews';
import Link from './Link';

export default function NotFound() {

  return (
    <div className="bg-white grid grid-cols-[repeat(4,_minmax(0px,_1fr))] relative h-screen w-full" data-name="404" data-node-id="633:1944">
      <div className="[grid-area:1_/_1] content-stretch flex flex-col items-start justify-between relative shrink-0 h-screen" data-name="left-stack" data-node-id="633:1945">
        <div className="basis-0 grow min-h-px min-w-px shrink-0 w-full" data-name="v-stack-auto" data-node-id="633:2065" />
        <div className="box-border content-stretch flex gap-[8px] items-start p-[8px] relative shrink-0 w-full" data-name="status-bar" data-node-id="633:1953">
          <Time className="bg-[#0d0d0d] box-border content-stretch flex font-mono font-semibold gap-[2px] items-start leading-[16px] px-[4px] py-[2px] relative shrink-0 text-[12px] text-nowrap text-white tracking-[0.24px] uppercase whitespace-pre" />
          <RunningNews className="basis-0 bg-[#0d0d0d] box-border content-stretch flex gap-[20px] grow items-center min-h-px min-w-px overflow-clip px-[4px] py-[2px] relative shrink-0"/>
        </div>
      </div>
      <div className="[grid-area:1_/_2_/_auto_/_span_3] bg-[#0d0d0d] content-stretch flex flex-col items-center overflow-clip relative shrink-0 h-screen" data-name="right-stack" data-node-id="633:1956">
        <div className="basis-0 box-border content-stretch flex flex-col gap-[8px] grow items-center justify-center min-h-px min-w-px overflow-x-clip overflow-y-auto p-[8px] relative shrink-0 w-full" data-name="wrap" data-node-id="633:1957">
          <p className="font-mono font-bold leading-[220px] relative shrink-0 text-[200px] text-[rgba(255,255,255,0.08)] text-nowrap uppercase whitespace-pre" data-node-id="633:2058">
            404
          </p>
          <div className="content-stretch flex flex-col gap-[16px] items-center max-w-[400px] relative shrink-0 w-full" data-name="v-stack" data-node-id="633:2059">
            <div className="content-stretch flex gap-[8px] items-center justify-center relative shrink-0" data-name="link" data-node-id="633:2061">
              <Link 
                theme="dark" 
                href="/"
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

