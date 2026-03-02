export type TabId = 'work' | 'info' | 'play' | 'resume';

export const TAB_IDS: TabId[] = ['work', 'info', 'play', 'resume'];

export function isTabId(value: string | null): value is TabId {
  return value !== null && TAB_IDS.includes(value as TabId);
}

export const TAB_LABELS: Record<TabId, string> = {
  work: 'WORK',
  info: 'ABOUT',
  play: 'PLAY',
  resume: 'CV'
};

export const TAB_HASHES: Record<TabId, string> = {
  work: 'work',
  info: 'about',
  play: 'play',
  resume: 'cv'
};

const HASH_TO_TAB_MAP: Record<string, TabId> = {
  work: 'work',
  about: 'info',
  play: 'play',
  cv: 'resume'
};

export function tabIdToHash(tab: TabId): string {
  return TAB_HASHES[tab];
}

export function hashToTabId(hash: string | null): TabId | null {
  if (!hash) return null;
  const normalizedHash = hash.replace(/^#/, '').toLowerCase();
  return HASH_TO_TAB_MAP[normalizedHash] ?? null;
}

export const TAB_HREFS: Record<TabId, string> = {
  work: '/#work',
  info: '/#about',
  play: '/#play',
  resume: '/#cv'
};
