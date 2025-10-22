import ScrollCards from './ScrollCards';

export default function Work() {
  return (
    <div className="basis-0 box-border content-stretch flex flex-col gap-[8px] grow items-center min-h-px min-w-px overflow-x-clip overflow-y-auto relative shrink-0 w-full">
      <ScrollCards className="content-stretch cursor-pointer flex flex-col gap-[8px] items-center relative shrink-0 w-full"/>
    </div>
  );
}
