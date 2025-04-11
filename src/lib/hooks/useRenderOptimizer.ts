import { useEffect, useRef } from "react";

interface RenderOptimizerOptions {
  /**
   * Component name for logging
   */
  componentName: string;

  /**
   * Log renders to console (development only)
   * @default true
   */
  logRenders?: boolean;

  /**
   * Warn if render count exceeds threshold
   * @default 5
   */
  renderCountThreshold?: number;

  /**
   * Warn if render time exceeds threshold (in ms)
   * @default 16 (for 60fps)
   */
  renderTimeThreshold?: number;

  /**
   * Enables warning for multiple renders within short time
   * @default true
   */
  detectFrequentRenders?: boolean;

  /**
   * Time window for frequent render detection (ms)
   * @default 100
   */
  frequentRenderWindow?: number;

  /**
   * Dependencies array (same as in useEffect)
   * Tracks which dependency caused the re-render
   */
  dependencies?: any[];

  /**
   * Set to false in production
   * @default process.env.NODE_ENV === 'development'
   */
  enabled?: boolean;
}

/**
 * Hook to track and optimize component renders
 * Helps identify performance issues and unnecessary re-renders
 */
export function useRenderOptimizer({
  componentName,
  logRenders = true,
  renderCountThreshold = 5,
  renderTimeThreshold = 16,
  detectFrequentRenders = true,
  frequentRenderWindow = 100,
  dependencies = [],
  enabled = process.env.NODE_ENV === "development",
}: RenderOptimizerOptions) {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(0);
  const renderStartTime = useRef(0);
  const prevDependencies = useRef<any[]>([]);

  // Initialize render timing regardless of enabled state
  renderStartTime.current = performance.now();

  // Always increment render count for accurate tracking
  renderCount.current += 1;

  // Find which dependency changed and caused the re-render
  const changedDeps = dependencies
    .map((dep, index) => {
      const prevDep = prevDependencies.current[index];
      return prevDep !== dep && prevDependencies.current.length > 0;
    })
    .filter(Boolean);

  // Main effect for optimization reporting
  useEffect(() => {
    // Skip tracking and reporting if feature is disabled
    if (!enabled) return;

    const renderDuration = performance.now() - renderStartTime.current;
    const timeSinceLastRender =
      renderStartTime.current - lastRenderTime.current;

    // Warning for slow renders
    if (renderDuration > renderTimeThreshold) {
      console.warn(
        `[RenderOptimizer] Slow render detected in ${componentName}: ${renderDuration.toFixed(
          2,
        )}ms` + ` (threshold: ${renderTimeThreshold}ms)`,
      );
    }

    // Warning for too many renders
    if (renderCount.current > renderCountThreshold) {
      console.warn(
        `[RenderOptimizer] High render count for ${componentName}: ${
          renderCount.current
        } renders` + ` (threshold: ${renderCountThreshold})`,
      );
    }

    // Warning for frequent renders
    if (
      detectFrequentRenders &&
      timeSinceLastRender < frequentRenderWindow &&
      lastRenderTime.current > 0
    ) {
      console.warn(
        `[RenderOptimizer] Frequent renders detected in ${componentName}: ` +
          `${timeSinceLastRender.toFixed(2)}ms between renders` +
          ` (threshold: ${frequentRenderWindow}ms)`,
      );
    }

    // Log render information
    if (logRenders) {
      console.log(`[RenderOptimizer] ${componentName} rendered:`, {
        renderCount: renderCount.current,
        renderDuration: `${renderDuration.toFixed(2)}ms`,
        timeSinceLastRender:
          lastRenderTime.current > 0
            ? `${timeSinceLastRender.toFixed(2)}ms`
            : "First render",
        changedDependencies:
          changedDeps.length > 0
            ? `${changedDeps.length} dependencies changed`
            : "No tracked dependencies changed",
      });
    }

    // Update for next render
    lastRenderTime.current = performance.now();
    prevDependencies.current = [...dependencies];

    // No actual cleanup needed
  });
}

export default useRenderOptimizer;
