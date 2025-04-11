"use client";

import React, { useState, useEffect, useRef } from "react";
import Image, { ImageProps } from "next/image";
import useCachedImages from "@/lib/hooks/useCachedImages";

export interface LazyImageProps extends Omit<ImageProps, "src" | "onError"> {
  /** Image source URL */
  src: string;
  /** Fallback image URL when loading fails */
  fallbackSrc?: string;
  /** Whether to use blur effect during loading */
  useBlur?: boolean;
  /** Whether to preload and cache image */
  useImagePreloading?: boolean;
  /** Function called when image loads */
  onLoad?: () => void;
  /** Function called when image fails to load */
  onError?: () => void;
}

/**
 * Enhanced image component with caching, preloading, and error handling
 */
const LazyImage: React.FC<LazyImageProps> = ({
  src,
  fallbackSrc = "/images/placeholder.jpg",
  alt,
  width,
  height,
  className = "",
  useBlur = true,
  useImagePreloading = true,
  priority = false,
  onLoad,
  onError,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const imageRef = useRef<HTMLImageElement>(null);

  // Initialize image caching hook regardless of useImagePreloading setting
  // to ensure we always have the hook available in the component
  const {
    getImageUrl,
    isLoaded: isCachedImageLoaded,
    hasError: hasCachedImageError,
  } = useCachedImages([src], {
    priority,
    placeholder: fallbackSrc,
    onLoad: useImagePreloading
      ? () => {
          setIsLoaded(true);
          onLoad?.();
        }
      : undefined,
    onError: useImagePreloading
      ? () => {
          setHasError(true);
          setCurrentSrc(fallbackSrc);
          onError?.();
        }
      : undefined,
  });

  // Set up blur effect class
  const blurClass = useBlur && !isLoaded ? "blur-sm" : "";
  const loadingClass = !isLoaded ? "animate-pulse" : "";
  const baseClass = `transition-all duration-300 ${blurClass} ${loadingClass}`;
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
      { rootMargin: "200px" }, // Start loading when image is 200px away from viewport
    );

    observer.observe(imageRef.current);

    return () => {
      observer.disconnect();
    };
  }, [isLoaded]);

  // Determine the final source URL to use
  const finalSrc = useImagePreloading
    ? getImageUrl(src) || fallbackSrc
    : hasError
      ? fallbackSrc
      : currentSrc;

  return (
    <div className="relative overflow-hidden" ref={imageRef}>
      <Image
        src={finalSrc}
        alt={alt}
        width={width}
        height={height}
        className={finalClassName}
        onLoad={handleLoad}
        onError={handleError}
        priority={priority}
        {...props}
      />
    </div>
  );
};

export default LazyImage;
