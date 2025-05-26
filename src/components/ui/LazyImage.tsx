'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image, { ImageProps } from 'next/image';
import useCachedImages from '@/lib/hooks/useCachedImages';

export interface LazyImageProps extends Omit<ImageProps, 'src' | 'onError'> {
  /**
   * Image URL to display
   */
  src: string;

  /**
   * Fallback image URL to use when the main image fails to load
   * @default "/images/product-placeholder.png"
   */
  fallbackSrc?: string;

  /**
   * Whether to add blur-up effect when loading
   * @default true
   */
  enableBlurEffect?: boolean;

  /**
   * Whether to use image preloading via our cache system
   * @default true
   */
  useImagePreloading?: boolean;

  /**
   * Callback when image loads successfully
   */
  onLoad?: () => void;

  /**
   * Callback when image fails to load
   */
  onError?: () => void;
}

/**
 * Enhanced image component with lazy loading, caching, blur-up effect and error handling
 */
export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  fallbackSrc = '/images/product-placeholder.png',
  alt,
  width,
  height,
  className = '',
  enableBlurEffect = true,
  useImagePreloading = true,
  onLoad,
  onError,
  ...imageProps
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const imageRef = useRef<HTMLImageElement>(null);

  // Always call the hook, but conditionally use its results
  const { getImageUrl, isLoading } = useCachedImages([src], {
    placeholder: fallbackSrc,
    onLoad: () => {
      if (useImagePreloading) {
        setIsLoaded(true);
        onLoad?.();
      }
    },
    onError: () => {
      if (useImagePreloading) {
        setHasError(true);
        setCurrentSrc(fallbackSrc);
        onError?.();
      }
    },
  });

  // Set up blur effect class
  const blurEffectClass =
    enableBlurEffect && !isLoaded && !hasError
      ? 'animate-pulse filter blur-[2px] scale-105 bg-gray-100'
      : 'scale-100';

  // Set up base class
  const baseClass = `transition-all duration-300 ease-in-out ${blurEffectClass}`;

  // Combine with custom class
  const finalClassName = `${baseClass} ${className}`;

  // Handle manual image loading events when not using preloading
  const handleLoad = () => {
    if (!useImagePreloading) {
      setIsLoaded(true);
      onLoad?.();
    }
  };

  const handleError = () => {
    if (!useImagePreloading) {
      setHasError(true);
      setCurrentSrc(fallbackSrc);
      onError?.();
    }
  };

  // Use IntersectionObserver to detect when image enters viewport
  useEffect(() => {
    if (!imageRef.current || isLoaded) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // If image is visible, no need to observe anymore
            observer.disconnect();
          }
        });
      },
      { rootMargin: '200px' } // Start loading when image is 200px away from viewport
    );

    observer.observe(imageRef.current);

    return () => {
      observer.disconnect();
    };
  }, [isLoaded]);

  return (
    <div className="relative overflow-hidden" ref={imageRef}>
      <Image
        src={
          useImagePreloading
            ? hasError
              ? fallbackSrc
              : getImageUrl(src) || currentSrc
            : hasError
              ? fallbackSrc
              : currentSrc
        }
        alt={alt}
        width={width}
        height={height}
        className={finalClassName}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
        {...imageProps}
      />

      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse" />
      )}
    </div>
  );
};

export default LazyImage;
