import ScrollCards from './ScrollCards';
import Link from './Link';
import LogoMain from './LogoMain';
import Time from './Time';
import RunningNews from './RunningNews';

interface WorkProps {
  landingMode?: boolean;
}

export default function Work({ landingMode = false }: WorkProps) {
  const containerClass = landingMode
    ? 'content-stretch flex flex-col gap-[8px] items-center relative shrink-0 w-full'
    : 'basis-0 box-border content-stretch flex flex-col gap-[8px] grow items-center min-h-px min-w-px overflow-x-clip overflow-y-auto relative shrink-0 w-full';

  return (
    <div className={containerClass}>
      {landingMode ? (
        <div className="md:hidden bg-white content-stretch flex flex-col h-[200px] items-start justify-between relative shrink-0 w-full">
          <div className="basis-0 box-border content-stretch flex flex-col grow items-start justify-between min-h-px min-w-px p-[8px] relative shrink-0 w-full">
            <LogoMain className="overflow-clip relative shrink-0 size-[32px]" />
            <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full">
              <p className="font-mono font-bold leading-[26px] min-w-full relative shrink-0 text-[#0d0d0d] text-[20px] uppercase w-[min-content]">
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
          <div className="box-border content-stretch flex gap-[8px] items-start p-[8px] relative shrink-0 w-full">
            <Time className="bg-[#0d0d0d] box-border content-stretch flex font-mono font-semibold gap-[2px] items-start leading-[16px] px-[4px] py-[2px] relative shrink-0 text-[12px] text-nowrap text-white tracking-[0.24px] uppercase whitespace-pre" />
            <RunningNews className="basis-0 bg-[#0d0d0d] box-border content-stretch flex gap-[20px] grow items-center min-h-px min-w-px overflow-clip px-[4px] py-[2px] relative shrink-0" />
          </div>
        </div>
      ) : null}
      <ScrollCards className="content-stretch flex flex-col gap-[8px] items-center pb-[8px] relative shrink-0 w-full"/>
    </div>
  );
}
