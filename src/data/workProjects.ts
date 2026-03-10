export type WorkProjectSlug = 'luminar-collage' | 'light-depth';

export type WorkProjectInteraction = 'route' | 'linksOnly' | 'static';

export interface WorkProjectLink {
  text: string;
  url: string;
}

export interface WorkProjectCaseStudyDetail {
  label: string;
  value: string;
  href?: string;
}

export interface WorkProjectCaseStudySection {
  heading: string;
  paragraphs: string[];
}

export interface WorkProjectCaseStudy {
  title: string;
  iconSrc: string;
  heroVideoSrc: string;
  heroPosterSrc?: string;
  topLinks: WorkProjectLink[];
  details: WorkProjectCaseStudyDetail[];
  sections: WorkProjectCaseStudySection[];
  sectionMedia: string[];
}

export interface WorkProject {
  dataNodeId: string;
  title: string;
  subtitle?: string;
  mediaSrc: string;
  posterSrc?: string;
  links?: WorkProjectLink[];
  interaction: WorkProjectInteraction;
  hoverDisabled?: boolean;
  slug?: WorkProjectSlug;
  caseStudy?: WorkProjectCaseStudy;
}

const luminarCollageCaseStudy: WorkProjectCaseStudy = {
  title: 'Luminar Collage',
  iconSrc: '/case-studies/luminar-collage/collage-icon.png',
  heroVideoSrc: '/collage-onboarding-p.mp4',
  heroPosterSrc: '/case-studies/luminar-collage/section-1.jpg',
  topLinks: [
    { text: 'Jitter', url: 'https://jitter.video/file/?id=9BLlSYNaJvuDBolLxiBV6' },
    { text: 'App Store', url: 'https://apps.apple.com/ua/app/luminar-collage-photo-maker/id6743317674' }
  ],
  details: [
    { label: 'Timeline', value: 'Feb 2025 / 3 weeks' },
    { label: 'Role', value: 'Senior Product Designer' },
    { label: 'Tools', value: 'Figma, Jitter, Claude' },
    { label: 'Company', value: 'Skylum', href: 'https://skylum.com' }
  ],
  sections: [
    {
      heading: 'Challenge',
      paragraphs: [
        'Design an iOS collage app in under 3 weeks. It had to fit into the Luminar Mobile ecosystem but run on a different tech stack. Design decisions had to account for both visual quality and what was actually buildable in time.'
      ]
    },
    {
      heading: 'Approach',
      paragraphs: [
        'Analyzed 20+ competitor apps to understand what made collage tools work or not. Used that to define the MVP and plan future iterations.',
        'Designed onboarding animations in Jitter and built a flexible grid system with Claude that engineers used to implement collage layouts fast.'
      ]
    },
    {
      heading: 'Outcome',
      paragraphs: [
        'Shipped on time, 4.8 on the App Store. Luminar users recognized the design, new users had no trouble getting started.'
      ]
    }
  ],
  sectionMedia: [
    '/case-studies/luminar-collage/section-1.jpg',
    '/case-studies/luminar-collage/section-2.jpg',
    '/case-studies/luminar-collage/section-3.jpg',
    '/case-studies/luminar-collage/section-4.jpg',
    '/case-studies/luminar-collage/section-5.jpg'
  ]
};

export const workProjects: WorkProject[] = [
  {
    dataNodeId: 'card-1',
    title: 'Luminar Collage',
    subtitle: 'Case Study',
    mediaSrc: '/collage-onboarding-p.mp4',
    posterSrc: '/collage-1-min.jpg',
    interaction: 'route',
    slug: 'luminar-collage',
    caseStudy: luminarCollageCaseStudy
  },
  {
    dataNodeId: 'card-2',
    title: 'Light Depth',
    subtitle: 'Feature',
    mediaSrc: '/light-depth.mp4',
    posterSrc: '/light-depth-poster.jpg',
    links: [
      {
        text: 'Watch',
        url: 'https://youtu.be/ZkcCU-R_nMo?si=4d8kybGHqj-JIAhh&t=51'
      }
    ],
    interaction: 'static',
    slug: 'light-depth'
  },
  {
    dataNodeId: 'card-3',
    title: 'AI Bookshelf',
    subtitle: 'Concept',
    mediaSrc: '/bookshelf-video.mp4',
    posterSrc: '/bookshelf-ai-min.jpg',
    links: [
      {
        text: 'Prototype',
        url: 'https://www.figma.com/proto/xjXvLIAJJBnI7DXaygTmBD/AI-Chatbot-–-My-Library?page-id=0:1&type=design&node-id=14-3236&viewport=2393,-189,0.27&t=GE4OHunispbOMFVg-1&scaling=scale-down&starting-point-node-id=14:3236'
      }
    ],
    interaction: 'linksOnly'
  },
  {
    dataNodeId: 'card-5',
    title: 'Luminar Assistant',
    subtitle: 'Feature',
    mediaSrc: '/assistant-min.jpg',
    interaction: 'linksOnly'
  },
  {
    dataNodeId: 'card-6',
    title: 'Luminar Spaces',
    subtitle: 'Feature',
    mediaSrc: '/web-pages-min.jpg',
    interaction: 'linksOnly'
  },
  {
    dataNodeId: 'card-7',
    title: 'AI Bookshelf',
    subtitle: 'Concept',
    mediaSrc: '/bookshelf-ai-min.jpg',
    links: [
      {
        text: 'Figma Community',
        url: 'https://www.figma.com/community/file/1309244140239319394/ai-chatbot-library-smart-animate-prototype'
      }
    ],
    interaction: 'linksOnly'
  },
  {
    dataNodeId: 'card-8',
    title: 'Luminar Mobile',
    subtitle: 'Widgets / UI',
    mediaSrc: '/mobile-min.jpg',
    links: [{ text: 'Google Play', url: 'https://play.google.com/store/apps/details?id=com.skylum.luminar' }],
    interaction: 'linksOnly'
  },
  {
    dataNodeId: 'card-9',
    title: 'Book → Video',
    subtitle: 'Concept',
    mediaSrc: '/video-ai-min.jpg',
    interaction: 'linksOnly'
  },
  {
    dataNodeId: 'card-10',
    title: 'Taxi App',
    subtitle: 'Concept',
    mediaSrc: '/taxi-app-min.jpg',
    interaction: 'linksOnly'
  },
  {
    dataNodeId: 'card-11',
    title: 'Task Tracker',
    subtitle: 'Concept',
    mediaSrc: '/task-master-min.jpg',
    interaction: 'linksOnly'
  }
];

export const workProjectSlugs: WorkProjectSlug[] = ['luminar-collage', 'light-depth'];

export function getWorkProjectBySlug(slug: string): WorkProject | undefined {
  return workProjects.find(project => project.slug === slug);
}
