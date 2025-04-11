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
 * Component to measure and track rendering performance
 * Provides timing data for component renders
 */
const PerformanceMarker: React.FC<PerformanceMarkerProps> = ({
  componentName,
  enabled = true,
  warnThreshold = 16,
  verbose = false,
  reportToTelemetry = false,
  children,
}) => {
  const startTime = useRef(performance.now());
  const mounted = useRef(false);
  const renderCount = useRef(0);

  // Skip measurement if not enabled or not in development
  const shouldMeasure =
    enabled && (process.env.NODE_ENV === "development" || reportToTelemetry);

  // Increment render count on each render
  renderCount.current += 1;

  useEffect(() => {
    // Skip if measurement is disabled
    if (!shouldMeasure) return;

    // This is the initial render
    if (!mounted.current) {
      mounted.current = true;
      return;
    }

    // Calculate render time
    const endTime = performance.now();
    const renderTime = endTime - startTime.current;

    // Log slow renders or all renders if verbose
    if (renderTime > warnThreshold || verbose) {
      const severity = renderTime > warnThreshold ? "warn" : "log";
      console[severity](
        `[PerformanceMarker] ${componentName} rendered in ${renderTime.toFixed(
          2,
        )}ms (render #${renderCount.current})`,
      );
    }

    // Update start time for next render
    startTime.current = performance.now();
  });

  // Simply render children
  return <>{children}</>;
};

export default PerformanceMarker;

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
