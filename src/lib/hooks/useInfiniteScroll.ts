import {useCallback, useEffect, useRef, useState} from 'react';

interface UseInfiniteScrollOptions {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => Promise<void>;
  threshold?: number;
  rootMargin?: string;
}

export function useInfiniteScroll({
  hasMore,
  isLoading,
  onLoadMore,
  threshold = 0.1,
  rootMargin = '100px',
}: UseInfiniteScrollOptions) {
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  const handleLoadMore = useCallback(async () => {
    if (hasMore && !isLoading && !isLoadingMore) {
      try {
        setIsLoadingMore(true);
        await onLoadMore();
      } catch (error) {
        console.error('Error loading more items:', error);
      } finally {
        setIsLoadingMore(false);
      }
    }
  }, [hasMore, isLoading, isLoadingMore, onLoadMore]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const currentObserverTarget = observerTarget.current;
    if (!currentObserverTarget || !hasMore) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        handleLoadMore();
      }
    }, {threshold, rootMargin});

    observer.observe(currentObserverTarget);

    return () => {
      if (currentObserverTarget) {
        observer.unobserve(currentObserverTarget);
      }
    };
  }, [handleLoadMore, hasMore, threshold, rootMargin]);

  return {
    observerTarget,
    isLoadingMore,
  };
}