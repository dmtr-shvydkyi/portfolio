import Link from './Link';
import GlitchScramble from './GlitchScramble';

interface AboutProps {
  landingMode?: boolean;
}

export default function About({ landingMode = false }: AboutProps) {
  const containerClass = landingMode
    ? 'box-border content-stretch flex flex-col gap-[8px] grow items-center justify-center min-h-0 min-w-px overflow-x-clip overflow-y-visible p-[24px] relative shrink-0 w-full h-full'
    : 'basis-0 box-border content-stretch flex flex-col gap-[8px] grow items-center justify-start min-h-px min-w-px overflow-x-clip overflow-y-auto p-[24px] relative shrink-0 w-full';
  const contentClass = landingMode
    ? 'content-stretch flex gap-[8px] items-center justify-center max-w-[400px] my-auto relative shrink-0 w-full'
    : 'content-stretch flex gap-[8px] items-center justify-center max-w-[400px] my-auto relative shrink-0 w-full';

  return (
    <div className={containerClass}>
      <div className={contentClass}>
        <GlitchScramble
          className="basis-0 cursor-default select-none font-mono font-medium grow leading-[0] min-h-px min-w-px relative shrink-0 text-[0px] text-[rgba(255,255,255,0.64)]"
          radiusYFactor={0.7}
        >
            <p className="leading-[20px] mb-[8px] text-[12px] normal-case">
              <span>I&apos;m a product designer from Kyiv, Ukraine, currently working at Skylum on </span>
              <span className="inline whitespace-nowrap">
                <Link type="primary" theme="dark" href="https://skylum.com/uk/luminar" className="inline font-bold" style={{ textTransform: 'none' }}>
                  Luminar Neo
                </Link>
                <span>,</span>
              </span>
              <span> one of the best desktop photo editing apps on the market.</span>
            </p>
          <p className="leading-[20px] mb-[8px] text-[12px] normal-case">
            <span>Before that, I designed complex SaaS products at </span>
            <Link type="primary" theme="dark" href="https://excited.agency" className="inline font-bold" style={{ textTransform: 'none' }}>
              Excited!
            </Link>
            <span> and handled both product and marketing design at the data-residency startup </span>
            <span className="inline whitespace-nowrap">
              <Link type="primary" theme="dark" href="https://incountry.com" className="inline font-bold" style={{ textTransform: 'none' }}>
                InCountry
              </Link>
              <span>.</span>
            </span>
          </p>
          <p className="leading-[20px] mb-[8px] text-[12px] normal-case">
            I got into design the day I opened my first MacBook and realized how great software can feel. That moment inspired me to start designing software myself and to learn everything around it: graphic design, motion design, development, management, and more.
          </p>
            <p className="leading-[20px] text-[12px] normal-case">
              <span>When I&apos;m not pixel-pushing, I&apos;m usually spending time with my family, watching series and movies, diving into new tech, </span>
              <span className="inline whitespace-nowrap">
                <Link type="primary" theme="dark" href="https://www.instagram.com/shvydkyi_" className="inline font-bold" style={{ textTransform: 'none' }}>
                  shooting photos
                </Link>
                <span>,</span>
              </span>
              <span> or driving my EV. There&apos;s just something about this battery-powered toaster on wheels that I love.</span>
            </p>
        </GlitchScramble>
      </div>
    </div>
  );
}
