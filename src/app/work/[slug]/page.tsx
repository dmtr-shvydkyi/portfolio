import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import CaseStudyHeaderActions from '@/components/CaseStudyHeaderActions';
import CaseStudyHeroTitle from '@/components/CaseStudyHeroTitle';
import Link from '@/components/Link';
import CaseStudySetup from '@/components/CaseStudySetup';
import { getWorkProjectBySlug, workProjectSlugs, type WorkProject, type WorkProjectLink } from '@/data/workProjects';
import { blurDataMap } from '@/data/blurData';
import { TAB_HREFS } from '@/types/tabs';

interface WorkPageProps {
  params: Promise<{ slug: string }>;
}

function CaseStudyHeader({ links }: { links: WorkProjectLink[] }) {
  return (
    <div className="sticky top-0 z-20 w-full bg-[#080808] px-[8px]">
      <div className="border-b border-[rgba(255,255,255,0.08)] py-[8px]">
        <CaseStudyHeaderActions backHref={TAB_HREFS.work} links={links} />
      </div>
    </div>
  );
}

function LuminarCaseStickyHeader({ links }: { links: WorkProjectLink[] }) {
  return (
    <div className="sticky top-0 z-20 w-full bg-[#0d0d0d] p-[8px]">
      <CaseStudyHeaderActions backHref={TAB_HREFS.work} links={links} />
    </div>
  );
}

function LuminarCasePage({ project }: { project: WorkProject }) {
  if (!project.caseStudy) {
    notFound();
  }

  const caseStudy = project.caseStudy;

  return (
    <div className="basis-0 box-border content-stretch flex flex-col grow items-center min-h-px min-w-px overflow-hidden relative shrink-0 w-full bg-[#0d0d0d]">
      <LuminarCaseStickyHeader links={caseStudy.topLinks} />

      <div className="content-stretch flex flex-[1_0_0] flex-col gap-[8px] items-center min-h-px min-w-px overflow-x-clip overflow-y-auto px-[8px] pb-[8px] pt-[8px] relative w-full bg-[#0d0d0d]">

        <div className="content-stretch flex items-end justify-between max-w-[960px] pt-[80px] relative shrink-0 w-full">
          <div className="content-stretch flex flex-[1_0_0] flex-col gap-[10px] items-start justify-end min-h-px min-w-px relative">
            <Image
              src={caseStudy.iconSrc}
              alt=""
              width={37}
              height={37}
              placeholder={blurDataMap[caseStudy.iconSrc] ? 'blur' : 'empty'}
              blurDataURL={blurDataMap[caseStudy.iconSrc]}
              className="size-[37px] object-cover"
            />
            <CaseStudyHeroTitle title={caseStudy.title} />
          </div>
        </div>

        <div className="relative aspect-[944/531] shrink-0 w-full bg-[#0f0f0f]">
          <video
            className="absolute inset-0 size-full max-w-none object-cover"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
          >
            <source src={caseStudy.heroVideoSrc} type="video/mp4" />
          </video>
        </div>

        <div className="grid w-full max-w-[960px] grid-cols-1 gap-[16px] pb-[32px] text-[12px] md:grid-cols-5 md:gap-[8px]">
          <div className="content-stretch flex flex-col gap-[16px] items-start md:col-span-2">
            {caseStudy.details.map((item) => (
              <div key={item.label} className="content-stretch flex flex-col gap-[4px] items-start w-full">
                <p className="font-mono font-semibold leading-[16px] text-[rgba(255,255,255,0.32)] tracking-[0.24px] uppercase w-full">
                  {item.label}
                </p>
                {item.href ? (
                  <Link
                    type="primary"
                    theme="dark"
                    href={item.href}
                    className="inline font-bold"
                    style={{ textTransform: 'none' }}
                  >
                    {item.value}
                  </Link>
                ) : (
                  <p className="font-mono font-semibold leading-[16px] text-white tracking-[0.24px] w-full">{item.value}</p>
                )}
              </div>
            ))}
          </div>

          <div className="content-stretch flex flex-col gap-[16px] items-start md:col-start-3 md:col-span-3">
            {caseStudy.sections.map((section) => (
              <div key={section.heading} className="content-stretch flex flex-col gap-[4px] items-start w-full">
                <p className="font-mono font-semibold leading-[16px] text-[rgba(255,255,255,0.32)] tracking-[0.24px] uppercase w-full">
                  {section.heading}
                </p>
                <div className="w-full">
                  {section.paragraphs.map((paragraph) => (
                    <p
                      key={paragraph}
                      className="font-mono font-medium leading-[20px] text-white w-full [&:not(:last-child)]:mb-[8px]"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {caseStudy.sectionMedia.map((src, index) => (
          <div key={src} className="relative aspect-[800/540] shrink-0 w-full">
            <Image
              src={src}
              alt={`Luminar Collage section ${index + 1}`}
              fill
              sizes="(max-width: 1024px) calc(100vw - 16px), 944px"
              loading="lazy"
              placeholder={blurDataMap[src] ? 'blur' : 'empty'}
              blurDataURL={blurDataMap[src]}
              className="absolute inset-0 size-full max-w-none object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function LightDepthPlaceholderPage({ project }: { project: WorkProject }) {
  const topLinks = project.links ?? [];

  return (
    <div className="basis-0 box-border content-stretch flex flex-col grow items-center min-h-px min-w-px overflow-x-clip overflow-y-auto relative shrink-0 w-full">
      <article className="bg-[#080808] content-stretch flex flex-col items-center max-w-[960px] relative shrink-0 w-full">
        <CaseStudyHeader links={topLinks} />

        <div className="content-stretch flex items-end justify-between pt-[80px] px-[8px] relative shrink-0 w-full">
          <div className="content-stretch flex flex-[1_0_0] gap-[16px] items-center min-h-px min-w-px relative">
            <h1 className="font-mono font-semibold leading-[30px] md:leading-[48px] text-[24px] md:text-[40px] text-white uppercase">
              Light Depth
            </h1>
          </div>
        </div>

        <div className="content-stretch flex flex-col items-start p-[8px] relative shrink-0 w-full">
          <div className="relative aspect-[944/531] w-full bg-[#0f0f0f]">
            <video
              className="absolute inset-0 size-full max-w-none object-cover"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
            >
              <source src={project.mediaSrc} type="video/mp4" />
            </video>
          </div>
        </div>

        <div className="grid w-full grid-cols-1 gap-[8px] px-[20px] pb-[80px] pt-[16px] text-[12px] md:grid-cols-5">
          <div className="md:col-start-3 md:col-span-3 content-stretch flex flex-col gap-[4px] items-start w-full">
            <p className="font-mono font-semibold leading-[16px] text-[rgba(255,255,255,0.32)] tracking-[0.24px] uppercase w-full">
              Status
            </p>
            <p className="font-mono font-medium leading-[20px] text-white w-full">In progress.</p>
          </div>
        </div>
      </article>
    </div>
  );
}

export async function generateStaticParams() {
  return workProjectSlugs.map(slug => ({ slug }));
}

export async function generateMetadata({ params }: WorkPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getWorkProjectBySlug(slug);

  if (!project) {
    return {
      title: 'Project Not Found'
    };
  }

  return {
    title: `${project.title} — Dmytro Shvydkyi`,
    description: `Case study for ${project.title}`
  };
}

export default async function WorkProjectPage({ params }: WorkPageProps) {
  const { slug } = await params;
  const project = getWorkProjectBySlug(slug);

  if (!project || !project.slug) {
    notFound();
  }

  return (
    <>
      <CaseStudySetup />
      {project.slug === 'luminar-collage' ? (
        <LuminarCasePage project={project} />
      ) : (
        <LightDepthPlaceholderPage project={project} />
      )}
    </>
  );
}
