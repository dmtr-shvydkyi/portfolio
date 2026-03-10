'use client';

import { useEffect } from 'react';
import { useNavigation } from './NavigationContext';

/** Sets active tab to 'work' when a case study page mounts */
export default function CaseStudySetup() {
  const { setActiveTab } = useNavigation();

  useEffect(() => {
    setActiveTab('work');
  }, [setActiveTab]);

  return null;
}
