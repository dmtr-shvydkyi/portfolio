'use client';

import { useState } from 'react';
import SharedLayout from '@/components/SharedLayout';
import Work from '@/components/Work';
import About from '@/components/About';
import Resume from '@/components/Resume';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'work' | 'info' | 'resume'>('work');

  const renderContent = () => {
    switch (activeTab) {
      case 'work':
        return <Work />;
      case 'info':
        return <About />;
      case 'resume':
        return <Resume />;
      default:
        return <Work />;
    }
  };

  return (
    <SharedLayout selectedTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </SharedLayout>
  );
}
