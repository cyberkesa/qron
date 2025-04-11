"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

interface PerformanceMetrics {
  // Time to First Byte
  ttfb: number;
  // First Contentful Paint
  fcp: number;
  // Largest Contentful Paint
  lcp: number | null;
  // First Input Delay
  fid: number | null;
  // Cumulative Layout Shift
  cls: number | null;
  // Time to Interactive
  tti: number | null;
  // Total Blocking Time
  tbt: number | null;
  // Interaction to Next Paint
  inp: number | null;
}

interface SlowComponent {
  name: string;
  renderTime: number;
  timestamp: number;
}

interface SlowResource {
  url: string;
  duration: number;
  initiatorType: string;
  timestamp: number;
}

interface PerformanceContextType {
  // Core web vitals and metrics
  metrics: PerformanceMetrics;
  // Components that took too long to render
  slowComponents: SlowComponent[];
  // Resources that took too long to load
  slowResources: SlowResource[];
  // App start timestamp
  appStartTime: number;
  // Whether performance monitoring is enabled
  enabled: boolean;
  // Manually report a slow component render
  reportSlowComponent: (name: string, renderTime: number) => void;
  // Toggle monitoring
  setEnabled: (enabled: boolean) => void;
  // Whether to show the performance dashboard
  isPerformanceDashboardVisible: boolean;
  // Toggle performance dashboard
  togglePerformanceDashboard: () => void;
}

const defaultMetrics: PerformanceMetrics = {
  ttfb: 0,
  fcp: 0,
  lcp: null,
  fid: null,
  cls: null,
  tti: null,
  tbt: null,
  inp: null,
};

const PerformanceContext = createContext<PerformanceContextType>({
  metrics: defaultMetrics,
  slowComponents: [],
  slowResources: [],
  appStartTime: Date.now(),
  enabled: process.env.NODE_ENV === "development",
  reportSlowComponent: () => {},
  setEnabled: () => {},
  isPerformanceDashboardVisible: false,
  togglePerformanceDashboard: () => {},
});

export const usePerformance = () => useContext(PerformanceContext);

interface PerformanceProviderProps {
  children: ReactNode;
  initialEnabled?: boolean;
}

// Расширим интерфейсы для Web Vitals API
interface LayoutShiftEntry extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}

interface FirstInputEntry extends PerformanceEntry {
  processingStart: number;
  startTime: number;
}

export const PerformanceProvider: React.FC<PerformanceProviderProps> = ({
  children,
  initialEnabled = process.env.NODE_ENV === "development",
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>(defaultMetrics);
  const [slowComponents, setSlowComponents] = useState<SlowComponent[]>([]);
  const [slowResources, setSlowResources] = useState<SlowResource[]>([]);
  const [enabled, setEnabled] = useState<boolean>(initialEnabled);
  const [isPerformanceDashboardVisible, setIsPerformanceDashboardVisible] =
    useState<boolean>(false);
  const appStartTime = Date.now();

  // Report slow component render
  const reportSlowComponent = useCallback(
    (name: string, renderTime: number) => {
      if (!enabled) return;

      setSlowComponents((prev) => {
        const newList = [...prev, { name, renderTime, timestamp: Date.now() }];
        // Keep only last 20 slow components
        return newList.slice(-20);
      });
    },
    [enabled],
  );

  // Toggle performance dashboard
  const togglePerformanceDashboard = useCallback(() => {
    setIsPerformanceDashboardVisible((prev) => !prev);
  }, []);

  // Measure web vitals when component mounts
  useEffect(() => {
    if (!enabled) return;

    // Basic metrics that can be measured immediately
    const navigationEntry = performance?.getEntriesByType(
      "navigation",
    )[0] as PerformanceNavigationTiming;

    if (navigationEntry) {
      setMetrics((prev) => ({
        ...prev,
        ttfb: navigationEntry.responseStart,
      }));
    }

    // First Contentful Paint
    const paintEntries = performance?.getEntriesByType("paint");
    const fcpEntry = paintEntries?.find(
      (entry) => entry.name === "first-contentful-paint",
    );

    if (fcpEntry) {
      setMetrics((prev) => ({
        ...prev,
        fcp: fcpEntry.startTime,
      }));
    }

    // Use PerformanceObserver for metrics that happen later
    if ("PerformanceObserver" in window) {
      // Largest Contentful Paint
      try {
        const lcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          if (lastEntry) {
            setMetrics((prev) => ({
              ...prev,
              lcp: lastEntry.startTime,
            }));
          }
        });

        lcpObserver.observe({
          type: "largest-contentful-paint",
          buffered: true,
        });
      } catch (e) {
        console.error("LCP measurement error:", e);
      }

      // Cumulative Layout Shift
      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            const layoutShiftEntry = entry as LayoutShiftEntry;
            if (!layoutShiftEntry.hadRecentInput) {
              clsValue += layoutShiftEntry.value;
              setMetrics((prev) => ({
                ...prev,
                cls: clsValue,
              }));
            }
          }
        });

        clsObserver.observe({ type: "layout-shift", buffered: true });
      } catch (e) {
        console.error("CLS measurement error:", e);
      }

      // First Input Delay
      try {
        const fidObserver = new PerformanceObserver((entryList) => {
          const firstInput = entryList.getEntries()[0];
          if (firstInput) {
            const inputEntry = firstInput as FirstInputEntry;
            const delay = inputEntry.processingStart - inputEntry.startTime;

            setMetrics((prev) => ({
              ...prev,
              fid: delay,
            }));
          }
        });

        fidObserver.observe({ type: "first-input", buffered: true });
      } catch (e) {
        console.error("FID measurement error:", e);
      }

      // Monitor Resource Timing for slow resources
      try {
        const resourceObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          for (const entry of entries) {
            const resourceEntry = entry as PerformanceResourceTiming;
            // Consider resources taking more than 500ms as slow
            if (resourceEntry.duration > 500) {
              setSlowResources((prev) => {
                const newResource = {
                  url: resourceEntry.name,
                  duration: resourceEntry.duration,
                  initiatorType: resourceEntry.initiatorType,
                  timestamp: Date.now(),
                };

                const newList = [...prev, newResource];
                // Keep only last 20 slow resources
                return newList.slice(-20);
              });
            }
          }
        });

        resourceObserver.observe({ type: "resource", buffered: true });
      } catch (e) {
        console.error("Resource monitoring error:", e);
      }
    }
  }, [enabled]);

  const contextValue = {
    metrics,
    slowComponents,
    slowResources,
    appStartTime,
    enabled,
    reportSlowComponent,
    setEnabled,
    isPerformanceDashboardVisible,
    togglePerformanceDashboard,
  };

  return (
    <PerformanceContext.Provider value={contextValue}>
      {children}
    </PerformanceContext.Provider>
  );
};

export default PerformanceProvider;
