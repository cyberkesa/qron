import { useEffect, useRef } from "react";

/**
 * Hook to detect potential memory leaks by tracking mounted state
 * and warning about async operations that continue after unmount
 *
 * @example
 * function MyComponent() {
 *   const isMounted = useMemoryLeakDetector('MyComponent');
 *
 *   useEffect(() => {
 *     const fetchData = async () => {
 *       // Long async operation
 *       await someSlowOperation();
 *
 *       // Check if still mounted before updating state
 *       if (isMounted.current) {
 *         setData(result);
 *       }
 *     };
 *
 *     fetchData();
 *   }, []);
 * }
 */
export function useMemoryLeakDetector(componentName: string) {
  const isMounted = useRef(true);
  const asyncOperations = useRef(new Set<string>());
  const isDevMode = process.env.NODE_ENV === "development";

  // Track mounted state
  useEffect(() => {
    isMounted.current = true;

    // Get a local reference for cleanup to avoid ESLint warnings
    // This works because the function inside useEffect captures
    // the current value of refs at cleanup time
    const operations = asyncOperations;

    return () => {
      isMounted.current = false;

      // In dev mode, check if there are still active async operations
      if (isDevMode && operations.current.size > 0) {
        console.warn(
          `[MemoryLeakDetector] ${componentName} was unmounted with ${
            operations.current.size
          } pending async operations that might cause memory leaks:`,
          Array.from(operations.current),
        );
      }
    };
  }, [componentName, isDevMode]);

  /**
   * Wrapper for async functions to track their lifecycle
   * Helps prevent setState on unmounted components
   */
  const trackAsyncOperation = <T extends (...args: any[]) => Promise<any>>(
    operationName: string,
    asyncFn: T,
  ): ((...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>>) => {
    return async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
      if (!isMounted.current) {
        console.warn(
          `[MemoryLeakDetector] Starting async operation "${
            operationName
          }" on unmounted component ${componentName}`,
        );
      }

      // Track operation start
      asyncOperations.current.add(operationName);

      try {
        // Run the async function
        const result = await asyncFn(...args);

        // If component is unmounted, log warning
        if (!isMounted.current) {
          console.warn(
            `[MemoryLeakDetector] Async operation "${
              operationName
            }" completed after component ${
              componentName
            } unmounted. Check for memory leaks.`,
          );
        }

        return result;
      } catch (error) {
        // If error, still need to mark operation as complete
        if (!isMounted.current) {
          console.warn(
            `[MemoryLeakDetector] Async operation "${
              operationName
            }" failed after component ${componentName} unmounted:`,
            error,
          );
        }
        throw error;
      } finally {
        // Clean up tracking
        asyncOperations.current.delete(operationName);
      }
    };
  };

  return { isMounted, trackAsyncOperation, pendingOperations: asyncOperations };
}

export default useMemoryLeakDetector;
