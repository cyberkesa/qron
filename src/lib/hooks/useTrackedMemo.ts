import {useCallback, useMemo, useRef} from 'react';

/**
 * A version of useMemo that tracks computation time and warns about expensive
 * calculations
 *
 * @param factory Function that creates the memoized value
 * @param deps Dependency array (same as for useMemo)
 * @param options Optional configuration
 * @returns The memoized value
 */
export function useTrackedMemo<T>(
    factory: () => T, deps: React.DependencyList, options: {
      /** Name to identify this computation in logs */
      name?: string;
      /** Threshold in ms to warn about expensive computations */
      warnThreshold?: number;
      /** Whether to log even fast computations */
      verbose?: boolean;
      /** Only log in development mode */
      devOnly?: boolean;
    } = {}): T {
  const {name = 'unknown', warnThreshold = 5, verbose = false, devOnly = true} =
      options;

  const enabled = !devOnly || process.env.NODE_ENV === 'development';
  const computationCount = useRef(0);

  // Use normal useMemo for the actual memoization
  return useMemo(() => {
    if (!enabled) return factory();

    // Track computation time
    const startTime = performance.now();
    computationCount.current++;

    // Run the factory function
    const result = factory();

    // Calculate and log the computation time
    const endTime = performance.now();
    const computationTime = endTime - startTime;

    if (verbose || computationTime > warnThreshold) {
      const style = computationTime > warnThreshold ?
          'color: red; font-weight: bold' :
          'color: green';

      console.log(
          `%c[useTrackedMemo] "${name}" computation #${
              computationCount.current}: ${computationTime.toFixed(2)}ms`,
          style);

      if (computationTime > warnThreshold) {
        console.warn(
            `Expensive computation detected: "${name}" took ${
                computationTime.toFixed(2)}ms. ` +
            `Consider optimizing this calculation or moving it out of the render cycle.`);
      }
    }

    return result;
  }, deps);
}

/**
 * A tracked version of useCallback that logs when the callback is recreated
 */
export function useTrackedCallback<T extends(...args: any[]) => any>(
    callback: T, deps: React.DependencyList,
    options: {name?: string; verbose?: boolean; devOnly?: boolean;} = {}): T {
  const {name = 'unknown', verbose = false, devOnly = true} = options;

  const enabled = !devOnly || process.env.NODE_ENV === 'development';
  const recreationCount = useRef(0);

  return useMemo(() => {
    if (!enabled) return callback;

    recreationCount.current++;

    if (verbose || recreationCount.current > 1) {
      console.log(`[useTrackedCallback] "${name}" recreation #${
          recreationCount.current}`);

      if (recreationCount.current > 1) {
        console.groupCollapsed(`Callback "${
            name}" was recreated. Check dependency array to ensure it only changes when necessary.`);
        console.log('Dependencies:', deps);
        console.trace('Recreation stack trace');
        console.groupEnd();
      }
    }

    return callback;
  }, deps);
}

export default useTrackedMemo;