'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  clearPageTransitionState,
  getContentAreaElement,
  PAGE_TRANSITION_EXIT_DURATION_FALLBACK_MS,
  prefersReducedMotion,
  readDurationFromCss,
  setPageTransitionDirection,
  setPageTransitionStage,
  type PageTransitionDirection,
} from '@/lib/pageTransition';

const EXIT_DURATION_VARIABLE = '--route-transition-exit-duration';

export function usePageTransition() {
  const router = useRouter();
  const exitTimerRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (exitTimerRef.current !== null) {
      window.clearTimeout(exitTimerRef.current);
      exitTimerRef.current = null;

      if (typeof document !== 'undefined') {
        const root = document.documentElement;
        clearPageTransitionState(root);
        const contentArea = getContentAreaElement();
        if (contentArea) {
          contentArea.style.pointerEvents = '';
          contentArea.style.willChange = '';
        }
      }
    }
  }, []);

  const navigate = useCallback(
    (href: string, direction: PageTransitionDirection = 'forward') => {
      if (typeof document === 'undefined') {
        router.push(href);
        return;
      }

      const root = document.documentElement;
      if (
        root.dataset.transitionStage === 'leaving'
        || root.dataset.transitionStage === 'between'
        || root.dataset.transitionStage === 'entering'
      ) {
        return;
      }

      setPageTransitionDirection(root, direction);

      if (prefersReducedMotion()) {
        clearPageTransitionState(root);
        router.push(href);
        return;
      }

      const contentArea = getContentAreaElement();
      if (!contentArea) {
        clearPageTransitionState(root);
        router.push(href);
        return;
      }

      contentArea.style.pointerEvents = 'none';
      contentArea.style.willChange = 'opacity';
      setPageTransitionStage(root, 'leaving');

      const exitDurationMs = readDurationFromCss(
        EXIT_DURATION_VARIABLE,
        PAGE_TRANSITION_EXIT_DURATION_FALLBACK_MS,
      );

      if (exitTimerRef.current !== null) {
        window.clearTimeout(exitTimerRef.current);
      }

      exitTimerRef.current = window.setTimeout(() => {
        exitTimerRef.current = null;
        setPageTransitionStage(root, 'between');
        router.push(href);
      }, exitDurationMs);
    },
    [router]
  );

  return { navigate };
}
