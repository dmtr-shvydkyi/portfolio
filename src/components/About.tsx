import InfoLink from './InfoLink';

export default function About() {
  return (
    <div className="basis-0 box-border content-stretch flex flex-col gap-[8px] grow items-center justify-start min-h-px min-w-px overflow-x-clip overflow-y-auto p-[8px] relative shrink-0 w-full">
      <div className="content-stretch flex gap-[8px] items-center justify-center max-w-[400px] my-auto relative shrink-0 w-full">
        <div className="basis-0 font-mono font-medium grow leading-[0] min-h-px min-w-px relative shrink-0 text-[0px] text-[rgba(255,255,255,0.64)]">
            <p className="leading-[20px] mb-[8px] text-[12px] normal-case">
              <span>I&apos;m a product designer from Kyiv, Ukraine, currently working at Skylum on </span>
              <InfoLink href="https://skylum.com/uk/luminar">
                Luminar Neo
              </InfoLink>
              <span>, one of the best desktop photo editing apps on the market.</span>
            </p>
          <p className="leading-[20px] mb-[8px] text-[12px] normal-case">
            <span>Before that, I designed complex SaaS products at </span>
            <InfoLink href="https://excited.agency">
              Excited!
            </InfoLink>
            <span> and handled both product and marketing design at the data-residency startup </span>
            <InfoLink href="https://incountry.com">
              InCountry
            </InfoLink>
            <span>.</span>
          </p>
          <p className="leading-[20px] mb-[8px] text-[12px] normal-case">
            I got into design the day I opened my first MacBook and realized how great software can feel. That moment inspired me to start designing software myself and to learn everything around it: graphic design, motion design, development, management, and more.
          </p>
            <p className="leading-[20px] text-[12px] normal-case">
              <span>When I&apos;m not pixel-pushing, I&apos;m usually spending time with my family, watching series and movies, diving into new tech, </span>
              <InfoLink href="https://www.instagram.com/shvydkyi_">
                shooting photos
              </InfoLink>
              <span>, or driving my EV. There&apos;s just something about this battery-powered toaster on wheels that I love.</span>
            </p>
        </div>
      </div>
    </div>
  );
}
