import ViewportVideo from './ViewportVideo';

interface CaseStudyHeroMediaProps {
  src: string;
  mobileSrc?: string;
  posterSrc: string;
  eager?: boolean;
  className?: string;
}

export default function CaseStudyHeroMedia(props: CaseStudyHeroMediaProps) {
  return (
    <ViewportVideo
      {...props}
      key={props.src}
      sizes="(max-width: 767px) calc(100vw - 16px), calc(75vw - 16px)"
    />
  );
}
