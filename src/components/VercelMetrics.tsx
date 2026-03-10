'use client';

import { useEffect, useState } from 'react';

type AnalyticsComponent = React.ComponentType<Record<string, never>>;
type SpeedInsightsComponent = React.ComponentType<Record<string, never>>;

export default function VercelMetrics() {
  const [Analytics, setAnalytics] = useState<AnalyticsComponent | null>(null);
  const [SpeedInsights, setSpeedInsights] = useState<SpeedInsightsComponent | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadMetrics = async () => {
      if (process.env.NODE_ENV !== 'production') {
        return;
      }

      const [analyticsModule, speedInsightsModule] = await Promise.all([
        import('@vercel/analytics/react'),
        import('@vercel/speed-insights/next')
      ]);

      if (!isMounted) return;
      setAnalytics(() => analyticsModule.Analytics as AnalyticsComponent);
      setSpeedInsights(() => speedInsightsModule.SpeedInsights as SpeedInsightsComponent);
    };

    loadMetrics().catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  if (!Analytics && !SpeedInsights) {
    return null;
  }

  return (
    <>
      {Analytics ? <Analytics /> : null}
      {SpeedInsights ? <SpeedInsights /> : null}
    </>
  );
}
