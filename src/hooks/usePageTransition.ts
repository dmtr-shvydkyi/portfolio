'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';

type DocumentWithViewTransition = Document & {
  startViewTransition?: (callback: () => Promise<void>) => void;
};

const supportsViewTransitions =
  typeof document !== 'undefined' && 'startViewTransition' in document;

export function usePageTransition() {
  const router = useRouter();

  const navigate = useCallback(
    (href: string, direction: 'forward' | 'back' = 'forward') => {
      if (!supportsViewTransitions) {
        // Fallback: just navigate — CSS classes handle a crossfade
        document.documentElement.dataset.transitionDirection = direction;
        router.push(href);
        // Clean up attribute after transition settles
        setTimeout(() => {
          delete document.documentElement.dataset.transitionDirection;
        }, 600);
        return;
      }

      document.documentElement.dataset.transitionDirection = direction;
      const documentWithViewTransition = document as DocumentWithViewTransition;

      documentWithViewTransition.startViewTransition?.(() => {
        router.push(href);
        // Return a promise that resolves after a tick to let React update
        return new Promise<void>((resolve) => {
          // Wait for Next.js to start rendering the new page
          setTimeout(resolve, 100);
        });
      });

      // Clean up direction attribute after transition completes
      setTimeout(() => {
        delete document.documentElement.dataset.transitionDirection;
      }, 800);
    },
    [router]
  );

  return { navigate };
}
