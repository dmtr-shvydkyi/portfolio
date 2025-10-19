import SharedLayout from './SharedLayout';
import Link from './Link';

export default function About() {
  return (
    <SharedLayout selectedTab="info">
      <div className="basis-0 box-border content-stretch flex flex-col gap-[8px] grow items-center justify-center min-h-px min-w-px overflow-x-clip overflow-y-auto p-[8px] relative shrink-0 w-full">
        <div className="content-stretch flex gap-[8px] items-center justify-center max-w-[400px] relative shrink-0 w-full">
          <div className="basis-0 font-mono font-medium grow leading-[0] min-h-px min-w-px relative shrink-0 text-[0px] text-[rgba(255,255,255,0.64)]">
            <p className="leading-[20px] mb-[8px] text-[12px] normal-case">
              <span>I&apos;m a product designer from Kyiv, Ukraine, currently working on </span>
              <Link theme="dark" href="https://luminar.com/luminar-neo" className="inline">
                Luminar Neo
              </Link>
              <span> at Skylum </span>— one of the leading desktop photo editors.
            </p>
            <p className="leading-[20px] mb-[8px] text-[12px] normal-case">
              <span>Before that, I designed complex SaaS products at </span>
              <Link theme="dark" href="https://excited.agency" className="inline">
                Excited!
              </Link>
              <span> agency and handled both product and marketing design at the data-residency startup </span>
              <Link theme="dark" href="https://incountry.com" className="inline">
                InCountry
              </Link>.
            </p>
            <p className="leading-[20px] mb-[8px] text-[12px] normal-case">
              I got into design the day I opened my first MacBook and realized how great software can feel. That inspired me to dive into graphic and motion design and explore no-code tools — so I&apos;d feel more confident creating something from scratch.
            </p>
            <p className="leading-[20px] text-[12px] normal-case">
              <span>When I&apos;m not pixel-pushing, I&apos;m usually diving into new tech, </span>
              <Link theme="dark" href="https://instagram.com/dmitryshvydkyi" className="inline">
                shooting photos
              </Link>
              <span>, or out driving my </span>
              <Link theme="dark" href="https://tesla.com" className="inline">
                EV
              </Link>
              <span> — there&apos;s just something about this battery-powered toaster on wheels that I love.</span>
            </p>
          </div>
        </div>
      </div>
    </SharedLayout>
  );
}
