import { useCallback, useEffect, useRef, useState } from 'react';

type ImageCacheEntry = {
  url: string;
  loadedAt: number;
  element: HTMLImageElement;
};

/**
 * Global image cache to prevent reloading images
 * The cache uses a Map with URL as key and contains:
 * - The actual image element
 * - When it was loaded
 */
const imageCache = new Map<string, ImageCacheEntry>();

// Cache expiration in milliseconds (30 minutes)
const CACHE_EXPIRATION = 30 * 60 * 1000;

// Maximum cache size (number of images)
const MAX_CACHE_SIZE = 100;

/**
 * Hook for preloading and caching product images
 *
 * @param urls - Array of image URLs to preload
 * @param options - Configuration options
 * @returns Object with loading states for each image
 */
export function useCachedImages(
  urls: string[],
  options: {
    priority?: boolean;
    onLoad?: (url: string) => void;
    onError?: (url: string, error: ErrorEvent) => void;
    placeholder?: string;
  } = {}
) {
  const [loadingStates, setLoadingStates] = useState<
    Record<string, 'loading' | 'loaded' | 'error'>
  >({});

  // Create stable references to the options callbacks
  const optionsRef = useRef(options);

  // Update the ref when options change
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  // Get the stable load and error handlers
  const handleLoad = useCallback((url: string) => {
    if (optionsRef.current.onLoad) {
      optionsRef.current.onLoad(url);
    }
  }, []);

  const handleError = useCallback((url: string, error: ErrorEvent) => {
    if (optionsRef.current.onError) {
      optionsRef.current.onError(url, error);
    }
  }, []);

  // Cleanup expired cache entries
  useEffect(() => {
    const now = Date.now();
    let expired = false;

    imageCache.forEach((entry, url) => {
      if (now - entry.loadedAt > CACHE_EXPIRATION) {
        imageCache.delete(url);
        expired = true;
      }
    });

    // If cache is too large, remove oldest entries
    if (imageCache.size > MAX_CACHE_SIZE) {
      const entries = Array.from(imageCache.entries());
      // Sort by loading time (oldest first)
      entries.sort((a, b) => a[1].loadedAt - b[1].loadedAt);
      // Remove oldest entries to get back to 75% of max size
      const toRemove = imageCache.size - Math.floor(MAX_CACHE_SIZE * 0.75);

      for (let i = 0; i < toRemove; i++) {
        if (entries[i]) {
          imageCache.delete(entries[i][0]);
        }
      }
    }
  }, [urls]);

  // Preload images
  useEffect(() => {
    if (!urls.length) return;

    const initialStates: Record<string, 'loading' | 'loaded' | 'error'> = {};
    const currentOptions = optionsRef.current;

    // Initialize loading states
    urls.forEach((url) => {
      // Skip invalid URLs
      if (!url) return;

      // If already in cache and not expired
      if (imageCache.has(url)) {
        const cachedEntry = imageCache.get(url)!;
        const now = Date.now();

        // If not expired, mark as loaded
        if (now - cachedEntry.loadedAt < CACHE_EXPIRATION) {
          initialStates[url] = 'loaded';
          return;
        } else {
          // Remove expired entry
          imageCache.delete(url);
        }
      }

      initialStates[url] = 'loading';
    });

    setLoadingStates(initialStates);

    // Preload images not in cache
    urls.forEach((url) => {
      if (!url || (initialStates[url] && initialStates[url] === 'loaded')) {
        return;
      }

      const img = new Image();

      if (currentOptions.priority) {
        img.fetchPriority = 'high';
      }

      img.onload = () => {
        // Add to cache
        imageCache.set(url, { url, loadedAt: Date.now(), element: img });

        // Update loading state
        setLoadingStates((prev) => ({ ...prev, [url]: 'loaded' }));

        handleLoad(url);
      };

      img.onerror = () => {
        // Update loading state
        setLoadingStates((prev) => ({ ...prev, [url]: 'error' }));

        // Create a synthetic error event since the actual error event might
        // be complex
        const errorEvent = new ErrorEvent('error', {
          message: `Failed to load image: ${url}`,
          filename: url,
        });
        handleError(url, errorEvent);
      };

      img.src = url;
    });
  }, [urls, handleLoad, handleError]);

  /**
   * Get the best URL to use:
   * - If image is loaded, use the original URL
   * - If loading failed, use the placeholder
   * - If still loading, use undefined to show loading state
   */
  const getImageUrl = useCallback(
    (url: string): string | undefined => {
      const state = loadingStates[url];
      const currentOptions = optionsRef.current;

      if (state === 'loaded') {
        return url;
      } else if (state === 'error' && currentOptions.placeholder) {
        return currentOptions.placeholder;
      } else if (state === 'loading') {
        // Still loading, could return undefined or a tiny placeholder
        return undefined;
      }

      return url; // Fallback to original
    },
    [loadingStates]
  );

  return {
    loadingStates,
    getImageUrl,
    isLoaded: useCallback(
      (url: string) => loadingStates[url] === 'loaded',
      [loadingStates]
    ),
    isLoading: useCallback(
      (url: string) => loadingStates[url] === 'loading',
      [loadingStates]
    ),
    hasError: useCallback(
      (url: string) => loadingStates[url] === 'error',
      [loadingStates]
    ),
  };
}

/**
 * Preload image URLs without using the hook
 * Useful for preloading images that will be needed soon
 */
export function preloadImages(urls: string[]): void {
  urls.forEach((url) => {
    if (!url || imageCache.has(url)) return;

    const img = new Image();

    img.onload = () => {
      imageCache.set(url, { url, loadedAt: Date.now(), element: img });
    };

    img.src = url;
  });
}

export default useCachedImages;
