import SharedLayout from './SharedLayout';
import ScrollCards from './ScrollCards';

export default function Work() {
  return (
    <SharedLayout selectedTab="work">
      <ScrollCards className="content-stretch cursor-pointer flex flex-col gap-[8px] items-center relative shrink-0 w-full"/>
    </SharedLayout>
  );
}
