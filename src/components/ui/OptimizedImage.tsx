"use client";

import React, { useState } from "react";
import Image from "next/image";
import useImageOptimizer from "@/lib/hooks/useImageOptimizer";
import { useMemoryLeakDetector } from "@/lib/hooks/useMemoryLeakDetector";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  containerClassName?: string;
  loading?: "lazy" | "eager";
  placeholder?: "blur" | "empty" | "color";
  placeholderColor?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

/**
 * OptimizedImage component that wraps Next.js Image with performance optimizations
 */
const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  priority = false,
  className = "",
  containerClassName = "",
  loading = "lazy",
  placeholder = "empty",
  placeholderColor = "#f3f4f6",
  onLoad,
  onError,
}) => {
  const [imgError, setImgError] = useState<Error | null>(null);
  const { isMounted } = useMemoryLeakDetector("OptimizedImage");

  // Use our image optimizer hook
  const {
    imageSrc,
    isLoading,
    isLoaded,
    hasError,
    error,
    ref,
    aspectRatio,
    containerStyle,
    containerClassName: hookContainerClass,
    loadImage,
  } = useImageOptimizer({
    src,
    width,
    height,
    lazyLoad: loading === "lazy" && !priority,
    preload: priority,
    placeholder,
    placeholderColor,
  });

  // Handle image load complete
  const handleLoad = () => {
    if (!isMounted.current) return;

    if (onLoad) {
      onLoad();
    }
  };

  // Handle image error
  const handleError = (error: any) => {
    if (!isMounted.current) return;

    setImgError(new Error(`Failed to load image: ${src}`));

    if (onError) {
      onError(new Error(`Failed to load image: ${src}`));
    }
  };

  // Combine class names
  const combinedContainerClassName =
    `${hookContainerClass} ${containerClassName}`.trim();

  // Show fallback for errors
  if (hasError || imgError) {
    return (
      <div
        ref={ref}
        className={`${combinedContainerClassName} bg-gray-100 flex items-center justify-center`}
        style={containerStyle}
        data-testid="image-error"
      >
        <div className="text-sm text-gray-500 p-4 text-center">
          <svg
            className="w-8 h-8 mx-auto mb-2 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p>Failed to load image</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={combinedContainerClassName}
      style={containerStyle}
      data-testid="image-container"
    >
      {(isLoading || !isLoaded) && (
        <div
          className="absolute inset-0 bg-gray-100 animate-pulse"
          style={
            placeholder === "color" ? { backgroundColor: placeholderColor } : {}
          }
        />
      )}

      {imageSrc && (
        <Image
          src={imageSrc}
          alt={alt}
          width={width || 0}
          height={height || 0}
          className={`${className} ${isLoaded ? "opacity-100" : "opacity-0"} transition-opacity duration-300`}
          onLoad={handleLoad}
          onError={handleError}
          priority={priority}
          loading={loading}
          // If we don't have width/height, fill the container
          {...(!width || !height ? { fill: true } : {})}
          // Size appropriately based on device and viewport
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      )}
    </div>
  );
};

export default OptimizedImage;
