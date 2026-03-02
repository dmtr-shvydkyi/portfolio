'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import dynamic from 'next/dynamic';
import SharedLayout from '@/components/SharedLayout';
import Work from '@/components/Work';
import About from '@/components/About';
import Resume from '@/components/Resume';
import { useKeyboardSound } from '@/hooks/useKeyboardSound';
import { hashToTabId, isTabId, tabIdToHash, type TabId } from '@/types/tabs';

const Play = dynamic(() => import('@/components/Play'), {
  ssr: false,
  loading: () => null,
});

const TAB_ORDER: TabId[] = ['work', 'info', 'play', 'resume'];

function getScrollDurationMs() {
  if (typeof window === 'undefined') return 560;
  const rawValue = window
    .getComputedStyle(document.documentElement)
    .getPropertyValue('--landing-scroll-duration')
    .trim();

  if (!rawValue) return 560;
  if (rawValue.endsWith('ms')) {
    const parsed = Number.parseFloat(rawValue.slice(0, -2));
    return Number.isFinite(parsed) ? parsed : 560;
  }
  if (rawValue.endsWith('s')) {
    const parsed = Number.parseFloat(rawValue.slice(0, -1));
    return Number.isFinite(parsed) ? parsed * 1000 : 560;
  }

  const parsed = Number.parseFloat(rawValue);
  return Number.isFinite(parsed) ? parsed : 560;
}

function getTabFromLocation(): TabId {
  if (typeof window === 'undefined') return 'work';

  const fromHash = hashToTabId(window.location.hash);
  if (fromHash) return fromHash;

  const params = new URLSearchParams(window.location.search);
  const tabParam = params.get('tab');
  if (isTabId(tabParam)) {
    return tabParam;
  }

  return 'work';
}

function SectionDivider({ title }: { title: string }) {
  return (
    <div className="border-[rgba(255,255,255,0.08)] border-solid border-t content-stretch flex items-center pt-[8px] relative shrink-0 w-full">
      <p className="font-mono font-semibold leading-[16px] relative shrink-0 text-[12px] text-[rgba(255,255,255,0.32)] tracking-[0.24px] uppercase whitespace-pre">
        {title}
      </p>
    </div>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>('work');
  const [connectToggleTrigger, setConnectToggleTrigger] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [scrollViewportHeight, setScrollViewportHeight] = useState(0);
  const playSound = useKeyboardSound();

  const activeTabRef = useRef<TabId>('work');
  const hasInitializedRef = useRef(false);
  const isAnimatingRef = useRef(false);
  const reducedMotionRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const sectionRefs = useRef<Record<TabId, HTMLElement | null>>({
    work: null,
    info: null,
    play: null,
    resume: null,
  });

  const setActiveTabIfChanged = useCallback((tab: TabId) => {
    setActiveTab(prev => (prev === tab ? prev : tab));
  }, []);

  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateReducedMotion = () => {
      reducedMotionRef.current = mediaQuery.matches;
    };

    updateReducedMotion();
    mediaQuery.addEventListener('change', updateReducedMotion);
    return () => mediaQuery.removeEventListener('change', updateReducedMotion);
  }, []);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const cancelScrollAnimation = useCallback(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    isAnimatingRef.current = false;
  }, []);

  const getActiveTabFromScroll = useCallback((scrollTop: number) => {
    const container = scrollContainerRef.current;
    if (!container) return activeTabRef.current;

    const switchOffset = Math.min(Math.max(container.clientHeight * 0.2, 72), 160);
    const anchor = scrollTop + switchOffset;
    let activeFromTop: TabId = TAB_ORDER[0];

    for (const tab of TAB_ORDER) {
      const section = sectionRefs.current[tab];
      if (!section) continue;
      if (section.offsetTop <= anchor) {
        activeFromTop = tab;
        continue;
      }
      break;
    }

    return activeFromTop;
  }, []);

  const updateUrlHash = useCallback((tab: TabId, mode: 'push' | 'replace') => {
    const hash = tabIdToHash(tab);
    const nextUrl = `/#${hash}`;

    if (mode === 'push') {
      window.history.pushState({ tab }, '', nextUrl);
      return;
    }

    window.history.replaceState({ tab }, '', nextUrl);
  }, []);

  const scrollToTab = useCallback((
    tab: TabId,
    options: { animated?: boolean; historyMode?: 'push' | 'replace' | 'none' } = {}
  ) => {
    const {
      animated = true,
      historyMode = 'none',
    } = options;

    const container = scrollContainerRef.current;
    const section = sectionRefs.current[tab];
    if (!container || !section) return;

    const targetTop = section.offsetTop;
    const startTop = container.scrollTop;
    const delta = targetTop - startTop;
    const prefersReducedMotion = reducedMotionRef.current;

    if (historyMode !== 'none') {
      updateUrlHash(tab, historyMode);
    }

    setActiveTabIfChanged(tab);
    cancelScrollAnimation();

    if (!animated || prefersReducedMotion || Math.abs(delta) < 1) {
      container.scrollTop = targetTop;
      return;
    }

    const durationMs = getScrollDurationMs();
    const startTime = performance.now();
    isAnimatingRef.current = true;

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      const eased = 1 - (1 - progress) ** 3;
      container.scrollTop = startTop + delta * eased;

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(step);
        return;
      }

      container.scrollTop = targetTop;
      isAnimatingRef.current = false;
      animationFrameRef.current = null;
    };

    animationFrameRef.current = requestAnimationFrame(step);
  }, [cancelScrollAnimation, setActiveTabIfChanged, updateUrlHash]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const updateHeight = () => {
      setScrollViewportHeight(container.clientHeight);
      const nextTab = getActiveTabFromScroll(container.scrollTop);
      if (nextTab !== activeTabRef.current) {
        setActiveTabIfChanged(nextTab);
      }
    };

    updateHeight();

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(updateHeight);
      resizeObserver.observe(container);
    } else {
      window.addEventListener('resize', updateHeight);
    }

    let scrollFrame = 0;
    const handleScroll = () => {
        if (scrollFrame) return;
      scrollFrame = requestAnimationFrame(() => {
        scrollFrame = 0;
        if (isAnimatingRef.current) return;

        const nextTab = getActiveTabFromScroll(container.scrollTop);
        if (nextTab !== activeTabRef.current) {
          setActiveTabIfChanged(nextTab);
        }
      });
    };

    container.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      if (scrollFrame) {
        cancelAnimationFrame(scrollFrame);
      }
      container.removeEventListener('scroll', handleScroll);
      if (resizeObserver) {
        resizeObserver.disconnect();
      } else {
        window.removeEventListener('resize', updateHeight);
      }
    };
  }, [getActiveTabFromScroll, setActiveTabIfChanged]);

  useEffect(() => {
    if (hasInitializedRef.current || scrollViewportHeight <= 0) return;

    const initialTab = getTabFromLocation();
    setActiveTabIfChanged(initialTab);
    requestAnimationFrame(() => {
      scrollToTab(initialTab, { animated: false, historyMode: 'replace' });
    });
    hasInitializedRef.current = true;
  }, [scrollToTab, scrollViewportHeight, setActiveTabIfChanged]);

  useEffect(() => {
    const handlePopState = () => {
      const tab = getTabFromLocation();
      setActiveTabIfChanged(tab);
      scrollToTab(tab, { animated: false, historyMode: 'none' });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [scrollToTab, setActiveTabIfChanged]);

  useEffect(() => {
    if (!hasInitializedRef.current || isAnimatingRef.current) return;
    const expectedHash = `#${tabIdToHash(activeTab)}`;
    if (window.location.hash.toLowerCase() === expectedHash) return;
    updateUrlHash(activeTab, 'replace');
  }, [activeTab, updateUrlHash]);

  const handleTabChange = useCallback((tab: TabId) => {
    scrollToTab(tab, { animated: true, historyMode: 'push' });
  }, [scrollToTab]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (event.key) {
        case '1':
          playSound();
          handleTabChange('work');
          break;
        case '2':
          playSound();
          handleTabChange('info');
          break;
        case '3':
          playSound();
          handleTabChange('play');
          break;
        case '4':
          playSound();
          handleTabChange('resume');
          break;
        case '5':
          playSound();
          setConnectToggleTrigger(prev => prev + 1);
          break;
        case 'ArrowLeft': {
          event.preventDefault();
          playSound();
          const currentIndex = TAB_ORDER.indexOf(activeTabRef.current);
          const nextIndex = (currentIndex - 1 + TAB_ORDER.length) % TAB_ORDER.length;
          handleTabChange(TAB_ORDER[nextIndex]);
          break;
        }
        case 'ArrowRight': {
          event.preventDefault();
          playSound();
          const currentIndex = TAB_ORDER.indexOf(activeTabRef.current);
          const nextIndex = (currentIndex + 1) % TAB_ORDER.length;
          handleTabChange(TAB_ORDER[nextIndex]);
          break;
        }
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleTabChange, playSound]);

  useEffect(() => {
    return () => {
      cancelScrollAnimation();
    };
  }, [cancelScrollAnimation]);

  const sectionStyle = {
    '--landing-scroll-viewport': `${scrollViewportHeight}px`,
  } as CSSProperties;

  return (
    <div className="relative size-full">
      <div
        className={`fixed inset-0 bg-white z-50 transition-opacity duration-[1400ms] pointer-events-none ${isLoaded ? 'opacity-0' : 'opacity-100'}`}
      />

      <SharedLayout
        selectedTab={activeTab}
        onTabChange={handleTabChange}
        connectToggleTrigger={connectToggleTrigger}
        hideMobileIntro
      >
        <div ref={scrollContainerRef} className="landing-scroll-container relative h-full w-full overflow-x-clip overflow-y-auto" style={sectionStyle}>
          <div className="content-stretch flex flex-col gap-0 items-center relative shrink-0 w-full">
            <section
              id="work"
              ref={node => {
                sectionRefs.current.work = node;
              }}
              data-tab-id="work"
              className="content-stretch flex flex-col items-center relative shrink-0 w-full"
            >
              <Work landingMode />
            </section>

            <section
              id="about"
              ref={node => {
                sectionRefs.current.info = node;
              }}
              data-tab-id="info"
              className="landing-fit-section box-border content-stretch flex flex-col gap-[8px] items-center relative shrink-0 w-full"
            >
              <SectionDivider title="ABOUT" />
              <div className="basis-0 content-stretch flex grow items-center min-h-0 min-w-px relative shrink-0 w-full">
                <About landingMode />
              </div>
            </section>

            <section
              id="play"
              ref={node => {
                sectionRefs.current.play = node;
              }}
              data-tab-id="play"
              className="landing-fit-section box-border content-stretch flex flex-col gap-[8px] items-center relative shrink-0 w-full"
            >
              <SectionDivider title="PLAY" />
              <div className="basis-0 content-stretch flex grow items-center min-h-0 min-w-px relative shrink-0 w-full">
                <Play landingMode />
              </div>
            </section>

            <section
              id="cv"
              ref={node => {
                sectionRefs.current.resume = node;
              }}
              data-tab-id="resume"
              className="landing-fit-section box-border content-stretch flex flex-col gap-[8px] items-center relative shrink-0 w-full"
            >
              <SectionDivider title="CV" />
              <div className="basis-0 content-stretch flex grow items-center min-h-0 min-w-px relative shrink-0 w-full">
                <Resume landingMode />
              </div>
            </section>
          </div>
        </div>
      </SharedLayout>
    </div>
  );
}
