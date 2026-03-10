export type PageTransitionDirection = 'forward' | 'back';
export type PageTransitionStage = 'leaving' | 'between' | 'entering';

export const CONTENT_AREA_SELECTOR = '[data-content-area]';
export const PAGE_TRANSITION_EXIT_DURATION_FALLBACK_MS = 160;
export const PAGE_TRANSITION_ENTER_DURATION_FALLBACK_MS = 160;

export function getContentAreaElement() {
  if (typeof document === 'undefined') {
    return null;
  }

  return document.querySelector<HTMLElement>(CONTENT_AREA_SELECTOR);
}

export function prefersReducedMotion() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function isPageTransitionActive(root: HTMLElement = document.documentElement) {
  return Boolean(root.dataset.transitionDirection || root.dataset.transitionStage);
}

export function readDurationFromCss(variableName: string, fallbackMs: number) {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return fallbackMs;
  }

  const rawValue = window.getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
  if (!rawValue) {
    return fallbackMs;
  }

  if (rawValue.endsWith('ms')) {
    const parsed = Number.parseFloat(rawValue.slice(0, -2));
    return Number.isFinite(parsed) ? parsed : fallbackMs;
  }

  if (rawValue.endsWith('s')) {
    const parsed = Number.parseFloat(rawValue.slice(0, -1));
    return Number.isFinite(parsed) ? parsed * 1000 : fallbackMs;
  }

  const parsed = Number.parseFloat(rawValue);
  return Number.isFinite(parsed) ? parsed : fallbackMs;
}

export function setPageTransitionDirection(root: HTMLElement, direction: PageTransitionDirection) {
  root.dataset.transitionDirection = direction;
}

export function setPageTransitionStage(root: HTMLElement, stage: PageTransitionStage) {
  root.dataset.transitionStage = stage;
}

export function clearPageTransitionState(root: HTMLElement) {
  delete root.dataset.transitionDirection;
  delete root.dataset.transitionStage;
}
