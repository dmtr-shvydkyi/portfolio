'use client';

import { useEffect } from 'react';
import { useNavigation } from './NavigationContext';

export default function LoadingSequence() {
  const { setLoadingPhase } = useNavigation();

  useEffect(() => {
    // Check for repeat visit
    const isRepeatVisit = sessionStorage.getItem('portfolio-visited') === '1';

    if (isRepeatVisit) {
      // Abbreviated sequence — skip logo/sidebar, go straight to content
      setLoadingPhase('content');
      const timer = setTimeout(() => setLoadingPhase('done'), 350);
      return () => clearTimeout(timer);
    }

    // Mark as visited for future loads
    sessionStorage.setItem('portfolio-visited', '1');

    // Respect reduced motion — skip to done immediately
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setLoadingPhase('done');
      return;
    }

    // Full premium sequence
    const timers = [
      setTimeout(() => setLoadingPhase('logo'), 50),
      setTimeout(() => setLoadingPhase('sidebar'), 250),
      setTimeout(() => setLoadingPhase('content'), 550),
      setTimeout(() => setLoadingPhase('done'), 1000),
    ];

    return () => timers.forEach(clearTimeout);
  }, [setLoadingPhase]);

  return null;
}
