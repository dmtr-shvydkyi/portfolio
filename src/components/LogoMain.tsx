import Image from 'next/image';

interface LogoMainProps {
  className?: string;
  state?: 'Default' | 'expanded';
}

export default function LogoMain({ className }: LogoMainProps) {
  return (
    <div className={className} data-name="state=Default" data-node-id="550:36084">
      <div className="absolute left-1/2 overflow-clip size-[32px] top-1/2 translate-x-[-50%] translate-y-[-50%]" data-name="logo" data-node-id="550:36080">
        <div className="absolute left-1/2 size-[32px] top-1/2 translate-x-[-50%] translate-y-[-50%]" data-name="dotted" data-node-id="550:36082">
          <Image 
            alt="" 
            className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" 
            src="/26d3465f8969fc45a4fb58c256d18f2b5500d32d.png"
            width={32}
            height={32}
          />
        </div>
      </div>
    </div>
  );
}


