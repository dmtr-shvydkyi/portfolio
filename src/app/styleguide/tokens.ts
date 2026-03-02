export interface ColorTokenRow {
  token: string;
  value: string;
  reference: string;
  context: string;
  usedIn: string;
}

export interface TypographyTokenRow {
  role: string;
  sample: string;
  sampleClassName: string;
  classes: string;
  metrics: string;
  weight: string;
  textCase: string;
  usedIn: string;
}

export interface ComponentTokenRow {
  component: string;
  file: string;
  variants: string;
  styleRecipe: string;
  notes: string;
}

export const colorTokenRows: ColorTokenRow[] = [
  {
    token: '--background',
    value: '#ffffff',
    reference: '--color-background',
    context: 'surface',
    usedIn: 'src/app/globals.css',
  },
  {
    token: '--foreground',
    value: '#171717',
    reference: '--color-foreground',
    context: 'dark text',
    usedIn: 'src/app/globals.css',
  },
  {
    token: 'bg-base-dark',
    value: '#0d0d0d',
    reference: 'bg-[#0d0d0d]',
    context: 'surface',
    usedIn: 'src/components/SharedLayout.tsx',
  },
  {
    token: 'bg-card-dark',
    value: '#0f0f0f',
    reference: 'bg-[#0f0f0f]',
    context: 'surface',
    usedIn: 'src/components/ScrollCards.tsx',
  },
  {
    token: 'bg-modal-dark',
    value: '#080808',
    reference: 'bg-[rgba(5,5,8,0.86)]',
    context: 'surface',
    usedIn: 'src/components/ScrollCards.tsx',
  },
  {
    token: 'text-primary',
    value: '#0d0d0d',
    reference: 'text-[#0d0d0d]',
    context: 'dark text',
    usedIn: 'src/components/SharedLayout.tsx',
  },
  {
    token: 'text-muted',
    value: 'rgba(13, 13, 13, 0.32)',
    reference: 'text-[rgba(13,13,13,0.32)]',
    context: 'dark text',
    usedIn: 'src/components/Link.tsx',
  },
  {
    token: 'text-muted-hover',
    value: 'rgba(13, 13, 13, 0.64)',
    reference: 'text-[rgba(13,13,13,0.64)]',
    context: 'dark text',
    usedIn: 'src/components/Link.tsx',
  },
  {
    token: 'text-strong',
    value: 'rgba(13, 13, 13, 0.88)',
    reference: 'text-[rgba(13,13,13,0.88)]',
    context: 'dark text',
    usedIn: 'src/components/ConnectButton.tsx',
  },
  {
    token: 'text-inverse',
    value: '#ffffff',
    reference: 'text-white',
    context: 'light text',
    usedIn: 'src/components/TabsNavigation.tsx',
  },
  {
    token: 'text-inverse-muted',
    value: 'rgba(255, 255, 255, 0.32)',
    reference: 'text-[rgba(255,255,255,0.32)]',
    context: 'light text',
    usedIn: 'src/components/RunningNews.tsx',
  },
  {
    token: 'text-inverse-soft',
    value: 'rgba(255, 255, 255, 0.55)',
    reference: 'text-[rgba(255,255,255,0.55)]',
    context: 'light text',
    usedIn: 'src/components/ScrollCards.tsx',
  },
  {
    token: 'text-inverse-hover',
    value: 'rgba(255, 255, 255, 0.7)',
    reference: 'text-[rgba(255,255,255,0.7)]',
    context: 'light text',
    usedIn: 'src/components/Link.tsx',
  },
  {
    token: 'text-inverse-strong',
    value: 'rgba(255, 255, 255, 0.88)',
    reference: 'text-[rgba(255,255,255,0.88)]',
    context: 'light text',
    usedIn: 'src/components/Play.tsx',
  },
  {
    token: 'bg-overlay',
    value: 'rgba(13, 13, 13, 0.64)',
    reference: 'bg-[rgba(13,13,13,0.64)]',
    context: 'overlay',
    usedIn: 'src/components/ScrollCards.tsx',
  },
  {
    token: 'border-subtle',
    value: 'rgba(255, 255, 255, 0.02)',
    reference: 'border-[rgba(255,255,255,0.02)]',
    context: 'border',
    usedIn: 'src/components/Leaderboard.tsx',
  },
];

export const typographyTokenRows: TypographyTokenRow[] = [
  {
    role: 'Label / tab / button',
    sample: 'Connect',
    sampleClassName: 'font-mono font-semibold text-[12px] leading-[16px] tracking-[0.24px] uppercase text-[#0d0d0d]',
    classes: 'font-mono font-semibold text-[12px] leading-[16px] tracking-[0.24px] uppercase',
    metrics: '12px / 16px / 0.24px',
    weight: '600',
    textCase: 'uppercase',
    usedIn: 'Link, TabsNavigation, ConnectButton',
  },
  {
    role: 'Small label',
    sample: 'Esc to close',
    sampleClassName: 'font-mono font-semibold text-[11px] leading-[16px] tracking-[0.24px] uppercase text-[rgba(13,13,13,0.64)]',
    classes: 'font-mono font-semibold text-[11px] leading-[16px] tracking-[0.24px] uppercase',
    metrics: '11px / 16px / 0.24px',
    weight: '600',
    textCase: 'uppercase',
    usedIn: 'ScrollCards modal hint',
  },
  {
    role: 'Body copy',
    sample: 'Sample body text',
    sampleClassName: 'font-mono font-medium text-[12px] leading-[20px] text-[rgba(13,13,13,0.88)] normal-case',
    classes: 'font-mono font-medium text-[12px] leading-[20px] normal-case',
    metrics: '12px / 20px / n/a',
    weight: '500',
    textCase: 'sentence',
    usedIn: 'About, case study paragraphs',
  },
  {
    role: 'Subheading',
    sample: 'Product Designer',
    sampleClassName: 'font-mono font-bold text-[22px] leading-[26px] uppercase text-[rgba(13,13,13,0.88)]',
    classes: 'font-mono font-bold text-[20px] md:text-[22px] leading-[26px] uppercase',
    metrics: '20-22px / 26px / n/a',
    weight: '700',
    textCase: 'uppercase',
    usedIn: 'SharedLayout',
  },
  {
    role: 'Section title',
    sample: 'Luminar Collage',
    sampleClassName: 'font-mono font-semibold text-[24px] leading-[30px] md:text-[40px] md:leading-[48px] uppercase text-[rgba(13,13,13,0.88)]',
    classes: 'font-mono font-semibold text-[24px] md:text-[40px] leading-[30px] md:leading-[48px] uppercase',
    metrics: '24/30, md 40/48',
    weight: '600',
    textCase: 'uppercase',
    usedIn: 'ScrollCards case study title',
  },
  {
    role: 'Display',
    sample: '000',
    sampleClassName: 'font-mono text-[40px] leading-[48px] text-[rgba(13,13,13,0.88)] uppercase',
    classes: 'font-mono text-[40px] leading-[48px] uppercase',
    metrics: '40px / 48px / n/a',
    weight: '400',
    textCase: 'uppercase',
    usedIn: 'Play score and game over state',
  },
  {
    role: '404 hero',
    sample: '404',
    sampleClassName: 'font-mono font-bold text-[32px] leading-[36px] uppercase text-[rgba(13,13,13,0.32)]',
    classes: 'font-mono font-bold text-[200px] leading-[220px] uppercase',
    metrics: '200px / 220px / n/a',
    weight: '700',
    textCase: 'uppercase',
    usedIn: 'NotFound',
  },
];

export const componentTokenRows: ComponentTokenRow[] = [
  {
    component: 'Link',
    file: 'src/components/Link.tsx',
    variants: 'theme: light | dark, state: default | hover',
    styleRecipe: 'font-mono font-semibold text-[12px] leading-[16px] tracking-[0.24px] uppercase underline',
    notes: 'Supports inline and block rendering.',
  },
  {
    component: 'ConnectButton',
    file: 'src/components/ConnectButton.tsx',
    variants: 'default, hover, pressed, opened',
    styleRecipe: 'bg-white + scale-95 press state + text strong/muted',
    notes: 'Overlay menu with LinkedIn/Twitter/Email links.',
  },
  {
    component: 'TabsNavigation',
    file: 'src/components/TabsNavigation.tsx',
    variants: 'selected, unselected, hover, pressed',
    styleRecipe: '12/16 uppercase labels; selected uses white background',
    notes: 'Used as primary page navigation.',
  },
  {
    component: 'Time',
    file: 'src/components/Time.tsx',
    variants: 'animated bootstrap + live time',
    styleRecipe: 'font-semibold 12/16 uppercase with tabular numbers',
    notes: 'Kyiv clock with blinking colon.',
  },
  {
    component: 'RunningNews',
    file: 'src/components/RunningNews.tsx',
    variants: 'custom text, repeat count, speed',
    styleRecipe: 'horizontal marquee, 12px uppercase mono text',
    notes: 'Animation pauses when modal is open.',
  },
  {
    component: 'Leaderboard',
    file: 'src/components/Leaderboard.tsx',
    variants: 'default row, active current user row',
    styleRecipe: 'bg rgba(255,255,255,0.02) + subtle border + 12/16 mono',
    notes: 'Shows top snake scores.',
  },
  {
    component: 'LogoMain',
    file: 'src/components/LogoMain.tsx',
    variants: 'default, click glitch',
    styleRecipe: '32x32 icon with glitch animation trigger',
    notes: 'Acts as home reset in SharedLayout.',
  },
  {
    component: 'GlitchScramble',
    file: 'src/components/GlitchScramble.tsx',
    variants: 'default text, interaction scramble',
    styleRecipe: 'character randomization effect with configurable radius',
    notes: 'Used in About text and micro interactions.',
  },
  {
    component: 'ScrollCards / DesignCard',
    file: 'src/components/ScrollCards.tsx',
    variants: 'image/video card, hover labels, modal',
    styleRecipe: 'aspect 3:2 + dark overlays + uppercase 12/16 labels',
    notes: 'Main work gallery and case-study entry.',
  },
  {
    component: 'Play native fields',
    file: 'src/components/Play.tsx',
    variants: 'text input + textarea',
    styleRecipe: 'native controls styled with mono labels and dark theme',
    notes: 'No shared form component yet.',
  },
];
