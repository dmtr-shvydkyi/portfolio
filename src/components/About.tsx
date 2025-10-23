import Link from './Link';

export default function About() {
  return (
    <div className="basis-0 box-border content-stretch flex flex-col gap-[8px] grow items-center justify-center min-h-px min-w-px overflow-x-clip overflow-y-auto p-[8px] relative shrink-0 w-full">
      <div className="content-stretch flex gap-[8px] items-center justify-center max-w-[400px] relative shrink-0 w-full">
        <div className="basis-0 font-mono font-medium grow leading-[0] min-h-px min-w-px relative shrink-0 text-[0px] text-[rgba(255,255,255,0.64)]">
            <p className="leading-[20px] mb-[8px] text-[12px] normal-case">
              <span>I&apos;m a product designer from Kyiv, Ukraine, currently working at Skylum on </span>
              <Link theme="dark" href="https://skylum.com/uk/luminar" className="inline font-bold text-white underline" style={{textTransform: 'none'}}>
                Luminar Neo
              </Link>
              <span>, one of the best desktop photo editing apps on the market.</span>
            </p>
          <p className="leading-[20px] mb-[8px] text-[12px] normal-case">
            <span>Before that, I designed complex SaaS products at </span>
            <Link theme="dark" href="https://excited.agency" className="inline font-bold text-white underline" style={{textTransform: 'none'}}>
              Excited!
            </Link>
            <span> and handled both product and marketing design at the data-residency startup </span>
            <Link theme="dark" href="https://incountry.com" className="inline font-bold text-white underline" style={{textTransform: 'none'}}>
              InCountry
            </Link>
            <span>.</span>
          </p>
          <p className="leading-[20px] mb-[8px] text-[12px] normal-case">
            I got into design the day I opened my first MacBook and realized how great software can feel. That moment inspired me to start designing software myself and to learn everything around it: graphic design, motion design, development, management, and more.
          </p>
            <p className="leading-[20px] text-[12px] normal-case">
              <span>When I&apos;m not pixel-pushing, I&apos;m usually spending time with my family, watching series and movies, diving into new tech, </span>
              <Link theme="dark" href="https://www.instagram.com/shvydkyi_" className="inline font-bold text-white underline" style={{textTransform: 'none'}}>
                shooting photos
              </Link>
              <span>, or driving my EV. There&apos;s just something about this battery-powered toaster on wheels that I love.</span>
            </p>
        </div>
      </div>
    </div>
  );
}
