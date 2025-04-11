"use client";

import { useEffect, useRef } from "react";

interface PerformanceMarkerProps {
  /**
   * Name of the component to measure
   */
  componentName: string;

  /**
   * Enable or disable measurement
   * @default true
   */
  enabled?: boolean;

  /**
   * Threshold in ms to log warnings for slow renders
   * @default 16
   */
  warnThreshold?: number;

  /**
   * Log to console even if under threshold
   * @default false
   */
  verbose?: boolean;

  /**
   * Whether to report to telemetry system
   * @default false
   */
  reportToTelemetry?: boolean;

  /**
   * Children to render
   */
  children: React.ReactNode;
}

/**
 * A component that measures the render time of its children
 * Only works in development mode
 */
export default function PerformanceMarker({
  componentName,
  enabled = true,
  warnThreshold = 16,
  verbose = false,
  reportToTelemetry = false,
  children,
}: PerformanceMarkerProps) {
  const renderStartTime = useRef<number>(0);
  const renderEndTime = useRef<number>(0);
  const renderCount = useRef<number>(0);
  const isDevMode = process.env.NODE_ENV === "development";

  // Don't do anything in production unless explicitly enabled
  if (!isDevMode && !enabled) {
    return <>{children}</>;
  }

  // Start timing at render start
  if (enabled) {
    renderStartTime.current = performance.now();
    renderCount.current += 1;
  }

  useEffect(() => {
    if (!enabled) return;

    // Measure render completion time
    renderEndTime.current = performance.now();
    const renderTime = renderEndTime.current - renderStartTime.current;

    // Only log if verbose or above threshold
    if (verbose || renderTime > warnThreshold) {
      const style =
        renderTime > warnThreshold
          ? "color: red; font-weight: bold"
          : "color: green";
      console.log(
        `%c[PerformanceMarker] ${componentName} render #${renderCount.current}: ${renderTime.toFixed(2)}ms`,
        style,
      );
    }

    // Report to telemetry system if enabled
    if (reportToTelemetry) {
      // This would send data to your analytics or monitoring system
      try {
        // Example implementation:
        // window.dataLayer?.push({
        //   event: 'componentRender',
        //   componentName,
        //   renderTime,
        //   renderCount: renderCount.current,
        // });
      } catch (error) {
        console.error("Failed to report performance data:", error);
      }
    }

    // Help detect slow components in the React DevTools
    if (renderTime > warnThreshold) {
      // This creates a marker in the Performance tab
      performance.mark(`${componentName}-slow-render-${renderCount.current}`);
    }

    // Check for multiple renders in the same frame
    return () => {
      if (!enabled) return;
      const unmountTime = performance.now();
      const lifetimeMs = unmountTime - renderStartTime.current;

      if (lifetimeMs < 32 && renderCount.current > 1) {
        console.warn(
          `[PerformanceMarker] ${componentName} rendered ${renderCount.current} times within ${lifetimeMs.toFixed(2)}ms - possible render loop!`,
        );
      }
    };
  });

  return <>{children}</>;
}

/**
 * HOC that wraps a component with performance measurement
 */
export function withPerformanceMarking<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<PerformanceMarkerProps, "children" | "componentName"> = {},
) {
  const displayName = Component.displayName || Component.name || "Component";

  const WrappedComponent = (props: P) => (
    <PerformanceMarker componentName={displayName} {...options}>
      <Component {...props} />
    </PerformanceMarker>
  );

  WrappedComponent.displayName = `withPerformanceMarking(${displayName})`;
  return WrappedComponent;
}
