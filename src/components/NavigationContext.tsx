'use client';

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import type { TabId } from '@/types/tabs';

type TabChangeHandler = (tab: TabId) => void;

interface NavigationContextValue {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  connectToggleTrigger: number;
  triggerConnectToggle: () => void;
  setOnTabChange: (handler: TabChangeHandler | null) => void;
  /** Call the registered handler. Returns true if handled. */
  dispatchTabChange: (tab: TabId) => boolean;
}

const NavigationContext = createContext<NavigationContextValue | null>(null);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTabState] = useState<TabId>('work');
  const [connectToggleTrigger, setConnectToggleTrigger] = useState(0);
  const onTabChangeRef = useRef<TabChangeHandler | null>(null);

  const setActiveTab = useCallback((tab: TabId) => {
    setActiveTabState(prev => (prev === tab ? prev : tab));
  }, []);

  const triggerConnectToggle = useCallback(() => {
    setConnectToggleTrigger(prev => prev + 1);
  }, []);

  const setOnTabChange = useCallback((handler: TabChangeHandler | null) => {
    onTabChangeRef.current = handler;
  }, []);

  const dispatchTabChange = useCallback((tab: TabId): boolean => {
    const handler = onTabChangeRef.current;
    if (handler) {
      handler(tab);
      return true;
    }
    return false;
  }, []);

  return (
    <NavigationContext.Provider
      value={{
        activeTab,
        setActiveTab,
        connectToggleTrigger,
        triggerConnectToggle,
        setOnTabChange,
        dispatchTabChange,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const ctx = useContext(NavigationContext);
  if (!ctx) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return ctx;
}
