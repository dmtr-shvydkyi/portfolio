'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import UiLink from '@/components/Link';
import ConnectButton from '@/components/ConnectButton';
import TabsNavigation from '@/components/TabsNavigation';
import Time from '@/components/Time';
import RunningNews from '@/components/RunningNews';
import Leaderboard from '@/components/Leaderboard';
import LogoMain from '@/components/LogoMain';
import GlitchScramble from '@/components/GlitchScramble';
import { colorTokenRows, typographyTokenRows } from './tokens';

const ScrollCards = dynamic(() => import('@/components/ScrollCards'), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] w-full animate-pulse rounded border border-white/10 bg-white/5" />
  ),
});

function Section({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-32">
      <div className="mb-3 flex items-end justify-between gap-3">
        <h2 className="text-[18px] font-bold uppercase tracking-[0.3px] text-[#0d0d0d] md:text-[20px]">
          {title}
        </h2>
      </div>
      <p className="mb-4 text-[12px] leading-[18px] text-[rgba(13,13,13,0.64)]">
        {description}
      </p>
      {children}
    </section>
  );
}

function TableShell({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded border border-[rgba(13,13,13,0.16)] bg-white">
      {children}
    </div>
  );
}

function HeaderCell({ children }: { children: ReactNode }) {
  return (
    <th className="border-b border-[rgba(13,13,13,0.16)] px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.24px] text-[rgba(13,13,13,0.72)]">
      {children}
    </th>
  );
}

function DataCell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <td
      className={`border-b border-[rgba(13,13,13,0.08)] px-3 py-2 align-top text-[12px] leading-[16px] text-[#0d0d0d] ${className ?? ''}`}
    >
      {children}
    </td>
  );
}

function ColorSwatch({ value }: { value: string }) {
  return (
    <div className="h-6 w-16 overflow-hidden rounded border border-[rgba(13,13,13,0.16)] bg-[linear-gradient(45deg,#f2f2f2_25%,#ffffff_25%,#ffffff_50%,#f2f2f2_50%,#f2f2f2_75%,#ffffff_75%,#ffffff_100%)] [background-size:8px_8px]">
      <div className="h-full w-full" style={{ backgroundColor: value }} />
    </div>
  );
}

function StateChip({
  label,
  surface = 'light',
}: {
  label: string;
  surface?: 'light' | 'dark';
}) {
  const className =
    surface === 'dark'
      ? 'border-[rgba(255,255,255,0.2)] text-[rgba(255,255,255,0.8)] bg-[rgba(255,255,255,0.06)]'
      : 'border-[rgba(13,13,13,0.2)] text-[rgba(13,13,13,0.8)] bg-[rgba(13,13,13,0.02)]';
  return (
    <span
      className={`inline-flex items-center rounded border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.22px] ${className}`}
    >
      {label}
    </span>
  );
}

function ComponentCard({
  name,
  file,
  surface = 'light',
  children,
  states,
}: {
  name: string;
  file: string;
  surface?: 'light' | 'dark';
  children: ReactNode;
  states: string[];
}) {
  const isDark = surface === 'dark';
  return (
    <article
      className={`rounded border p-4 ${
        isDark
          ? 'border-[rgba(255,255,255,0.14)] bg-[#0d0d0d]'
          : 'border-[rgba(13,13,13,0.16)] bg-white'
      }`}
    >
      <p
        className={`text-[11px] font-semibold uppercase tracking-[0.24px] ${
          isDark ? 'text-[rgba(255,255,255,0.72)]' : 'text-[rgba(13,13,13,0.72)]'
        }`}
      >
        {name}
      </p>
      <p
        className={`mt-1 text-[10px] ${
          isDark ? 'text-[rgba(255,255,255,0.56)]' : 'text-[rgba(13,13,13,0.56)]'
        }`}
      >
        {file}
      </p>
      <div
        className={`mt-3 min-h-[72px] rounded border p-3 ${
          isDark
            ? 'border-[rgba(255,255,255,0.14)] bg-[#0f0f0f]'
            : 'border-[rgba(13,13,13,0.14)] bg-[#fafafa]'
        }`}
      >
        {children}
      </div>
      <div className="mt-3">
        <p
          className={`text-[10px] font-semibold uppercase tracking-[0.22px] ${
            isDark ? 'text-[rgba(255,255,255,0.56)]' : 'text-[rgba(13,13,13,0.56)]'
          }`}
        >
          States
        </p>
        <div className="mt-1 flex flex-wrap gap-2">
          {states.map((state) => (
            <StateChip key={state} label={state} surface={surface} />
          ))}
        </div>
      </div>
    </article>
  );
}

export default function StyleguidePage() {
  const [selectedTab, setSelectedTab] = useState<'work' | 'info' | 'play' | 'resume'>('work');

  return (
    <div className="h-screen overflow-y-auto bg-[var(--background)] text-[var(--foreground)]">
      <div className="sticky top-0 z-20 border-b border-[rgba(13,13,13,0.12)] bg-[rgba(255,255,255,0.95)] backdrop-blur">
        <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-4 px-4 py-3 md:px-6">
          <div>
            <h1 className="text-[18px] font-bold uppercase tracking-[0.32px] text-[#0d0d0d] md:text-[20px]">
              Style Guide
            </h1>
            <p className="text-[11px] text-[rgba(13,13,13,0.64)]">
              Internal reference for tokens and component styling
            </p>
          </div>
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24px]">
            <a
              href="#colors"
              className="rounded border border-[rgba(13,13,13,0.16)] px-2 py-1 text-[rgba(13,13,13,0.72)] transition-colors hover:text-[#0d0d0d]"
            >
              Colors
            </a>
            <a
              href="#typography"
              className="rounded border border-[rgba(13,13,13,0.16)] px-2 py-1 text-[rgba(13,13,13,0.72)] transition-colors hover:text-[#0d0d0d]"
            >
              Typography
            </a>
            <a
              href="#components"
              className="rounded border border-[rgba(13,13,13,0.16)] px-2 py-1 text-[rgba(13,13,13,0.72)] transition-colors hover:text-[#0d0d0d]"
            >
              Components
            </a>
          </div>
        </div>
      </div>

      <main className="mx-auto flex max-w-[1320px] flex-col gap-10 px-4 py-6 font-mono md:px-6 md:py-8">
        <Section
          id="colors"
          title="Colors"
          description="Single source of project color values. Scan by token name, then copy value or Tailwind/variable reference."
        >
          <TableShell>
            <table className="w-full min-w-[980px] border-collapse">
              <thead>
                <tr>
                  <HeaderCell>Token</HeaderCell>
                  <HeaderCell>Swatch</HeaderCell>
                  <HeaderCell>Value</HeaderCell>
                  <HeaderCell>Reference</HeaderCell>
                  <HeaderCell>Context</HeaderCell>
                  <HeaderCell>Used in</HeaderCell>
                </tr>
              </thead>
              <tbody>
                {colorTokenRows.map((row) => (
                  <tr key={row.token}>
                    <DataCell>
                      <code className="text-[11px] text-[rgba(13,13,13,0.88)]">{row.token}</code>
                    </DataCell>
                    <DataCell>
                      <ColorSwatch value={row.value} />
                    </DataCell>
                    <DataCell>
                      <code className="text-[11px] text-[rgba(13,13,13,0.88)]">{row.value}</code>
                    </DataCell>
                    <DataCell>
                      <code className="text-[11px] text-[rgba(13,13,13,0.88)]">{row.reference}</code>
                    </DataCell>
                    <DataCell className="uppercase">{row.context}</DataCell>
                    <DataCell>
                      <code className="text-[11px] text-[rgba(13,13,13,0.72)]">{row.usedIn}</code>
                    </DataCell>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableShell>
        </Section>

        <Section
          id="typography"
          title="Typography"
          description="One table only: each row maps to real classes used in the project. Font family is Geist Mono (`--font-geist-mono`)."
        >
          <TableShell>
            <table className="w-full min-w-[1180px] border-collapse">
              <thead>
                <tr>
                  <HeaderCell>Role</HeaderCell>
                  <HeaderCell>Sample</HeaderCell>
                  <HeaderCell>Classes</HeaderCell>
                  <HeaderCell>Size / Line / Track</HeaderCell>
                  <HeaderCell>Weight</HeaderCell>
                  <HeaderCell>Case</HeaderCell>
                  <HeaderCell>Used in</HeaderCell>
                </tr>
              </thead>
              <tbody>
                {typographyTokenRows.map((row) => (
                  <tr key={row.role}>
                    <DataCell>{row.role}</DataCell>
                    <DataCell>
                      <span className={row.sampleClassName}>{row.sample}</span>
                    </DataCell>
                    <DataCell>
                      <code className="text-[11px] text-[rgba(13,13,13,0.88)]">{row.classes}</code>
                    </DataCell>
                    <DataCell>{row.metrics}</DataCell>
                    <DataCell>{row.weight}</DataCell>
                    <DataCell className="uppercase">{row.textCase}</DataCell>
                    <DataCell>{row.usedIn}</DataCell>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableShell>
        </Section>

        <Section
          id="components"
          title="Components"
          description="Live interactive previews with states listed separately for each component."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <ComponentCard
              name="Link (light)"
              file="src/components/Link.tsx"
              states={['default', 'hover']}
            >
              <div className="flex flex-wrap items-center gap-4">
                <UiLink theme="light" className="inline">Live link</UiLink>
                <UiLink theme="light" state="default" className="inline">Default</UiLink>
                <UiLink theme="light" state="hover" className="inline">Hover</UiLink>
              </div>
            </ComponentCard>

            <ComponentCard
              name="Link (dark)"
              file="src/components/Link.tsx"
              surface="dark"
              states={['default', 'hover']}
            >
              <div className="flex flex-wrap items-center gap-4">
                <UiLink theme="dark" className="inline">Live link</UiLink>
                <UiLink theme="dark" state="default" className="inline">Default</UiLink>
                <UiLink theme="dark" state="hover" className="inline">Hover</UiLink>
              </div>
            </ComponentCard>

            <ComponentCard
              name="ConnectButton"
              file="src/components/ConnectButton.tsx"
              surface="dark"
              states={['default', 'hover', 'pressed', 'opened']}
            >
              <div className="flex flex-wrap items-start gap-6">
                <ConnectButton />
                <ConnectButton state="opened" />
              </div>
            </ComponentCard>

            <ComponentCard
              name="TabsNavigation"
              file="src/components/TabsNavigation.tsx"
              surface="dark"
              states={['selected', 'unselected', 'hover', 'pressed']}
            >
              <TabsNavigation selected={selectedTab} onTabChange={setSelectedTab} />
            </ComponentCard>

            <ComponentCard
              name="Time"
              file="src/components/Time.tsx"
              surface="dark"
              states={['boot animation', 'live ticking']}
            >
              <Time className="inline-flex bg-[#0d0d0d] px-[4px] py-[2px] text-[12px] font-semibold leading-[16px] tracking-[0.24px] text-white uppercase" />
            </ComponentCard>

            <ComponentCard
              name="RunningNews"
              file="src/components/RunningNews.tsx"
              surface="dark"
              states={['running', 'hover slowed']}
            >
              <RunningNews
                className="h-[24px] w-full px-[4px] py-[2px]"
                text="style guide live preview"
                repeatCount={6}
                speedSeconds={18}
              />
            </ComponentCard>

            <ComponentCard
              name="Leaderboard"
              file="src/components/Leaderboard.tsx"
              surface="dark"
              states={['default row', 'current user row']}
            >
              <Leaderboard
                entries={[
                  { nick: '012.321.111.ABC', score: 147 },
                  { nick: '220.011.939.YOU', score: 121 },
                  { nick: '081.444.777.XYZ', score: 99 },
                ]}
                currentNick="220.011.939.YOU"
              />
            </ComponentCard>

            <ComponentCard
              name="LogoMain"
              file="src/components/LogoMain.tsx"
              surface="dark"
              states={['default', 'glitch on click']}
            >
              <div className="relative h-10 w-10">
                <LogoMain className="relative size-8" />
              </div>
            </ComponentCard>

            <ComponentCard
              name="GlitchScramble"
              file="src/components/GlitchScramble.tsx"
              surface="dark"
              states={['default', 'pointer scramble']}
            >
              <GlitchScramble>
                <span className="text-[14px] font-semibold text-white">Hover to scramble</span>
              </GlitchScramble>
            </ComponentCard>

            <ComponentCard
              name="Native Input / Textarea"
              file="src/components/Play.tsx"
              states={['default', 'focus']}
            >
              <div className="flex w-full flex-col gap-3">
                <input
                  type="text"
                  placeholder="Input preview"
                  className="rounded border border-[rgba(13,13,13,0.32)] bg-white px-3 py-2 text-[12px] text-[#0d0d0d] outline-none focus:ring-1 focus:ring-[rgba(13,13,13,0.48)]"
                />
                <textarea
                  rows={2}
                  placeholder="Textarea preview"
                  className="rounded border border-[rgba(13,13,13,0.32)] bg-white px-3 py-2 text-[12px] text-[#0d0d0d] outline-none focus:ring-1 focus:ring-[rgba(13,13,13,0.48)]"
                />
              </div>
            </ComponentCard>

            <div className="md:col-span-2">
              <ComponentCard
                name="ScrollCards / DesignCard"
                file="src/components/ScrollCards.tsx"
                surface="dark"
                states={['default', 'hover overlays', 'open modal']}
              >
                <div className="h-[300px] overflow-hidden rounded border border-white/10">
                  <ScrollCards className="h-full w-full" />
                </div>
              </ComponentCard>
            </div>
          </div>
        </Section>
      </main>
    </div>
  );
}
