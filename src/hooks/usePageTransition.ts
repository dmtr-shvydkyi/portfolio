'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  clearPageTransitionState,
  prefersReducedMotion,
  setPageTransitionDirection,
  setPageTransitionStage,
  type PageTransitionDirection,
} from '@/lib/pageTransition';

export function usePageTransition() {
  const router = useRouter();
  const navigate = useCallback((href: string, direction: PageTransitionDirection = 'forward') => {
    const root = document.documentElement;
    clearPageTransitionState(root);
    if (!prefersReducedMotion() && new URL(href, window.location.href).pathname !== window.location.pathname) {
      setPageTransitionDirection(root, direction);
      // Keep the current page visible and interactive while the route loads.
      setPageTransitionStage(root, 'pending');
    }
    router.push(href);
  }, [router]);
  return { navigate };
}
