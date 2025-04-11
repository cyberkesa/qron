import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface ImageOptimizerOptions {
  /**
   * URL of the image to load
   */
  src: string;

  /**
   * Whether to lazy load the image
   * @default true
   */
  lazyLoad?: boolean;

  /**
   * Root margin for IntersectionObserver when using lazy loading
   * @default "200px"
   */
  rootMargin?: string;

  /**
   * Threshold for IntersectionObserver when using lazy loading
   * @default 0.1
   */
  threshold?: number;

  /**
   * Width of the image used for calculating aspect ratio
   */
  width?: number;

  /**
   * Height of the image used for calculating aspect ratio
   */
  height?: number;

  /**
   * Whether to preload high-priority images (above the fold)
   * @default false
   */
  preload?: boolean;

  /**
   * Quality of the image for optimization
   * @default 75
   */
  quality?: number;

  /**
   * Format for image optimization
   * @default "webp"
   */
  format?: "jpeg" | "png" | "webp" | "avif";

  /**
   * Placeholder to show before the image is loaded (blur, empty, etc.)
   * @default "empty"
   */
  placeholder?: "blur" | "empty" | "color";

  /**
   * Placeholder color when placeholder is "color"
   * @default "#f3f4f6"
   */
  placeholderColor?: string;
}

interface ImageOptimizerResult {
  /**
   * Final optimized image URL
   */
  imageSrc: string;

  /**
   * Whether the image is currently loading
   */
  isLoading: boolean;

  /**
   * Whether the image has finished loading
   */
  isLoaded: boolean;

  /**
   * Whether there was an error loading the image
   */
  hasError: boolean;

  /**
   * Error message if loading failed
   */
  error: string | null;

  /**
   * Ref to attach to the image container for lazy loading
   */
  ref: React.RefObject<HTMLDivElement>;

  /**
   * Aspect ratio of the image (height / width)
   */
  aspectRatio: number | null;

  /**
   * CSS style object for the aspect ratio container
   */
  containerStyle: React.CSSProperties;

  /**
   * CSS class name for the image container
   */
  containerClassName: string;

  /**
   * Start loading the image manually
   */
  loadImage: () => void;
}

/**
 * Hook to optimize image loading and rendering
 */
export function useImageOptimizer({
  src,
  lazyLoad = true,
  rootMargin = "200px",
  threshold = 0.1,
  width,
  height,
  preload = false,
  quality = 75,
  format = "webp",
  placeholder = "empty",
  placeholderColor = "#f3f4f6",
}: ImageOptimizerOptions): ImageOptimizerResult {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [shouldLoad, setShouldLoad] = useState<boolean>(!lazyLoad || preload);

  const ref = useRef<HTMLDivElement>(null);

  // Calculate aspect ratio if both width and height are provided
  const aspectRatio = width && height ? height / width : null;

  // Optimize the image src with format, quality, etc.
  const optimizedSrc = useMemo(() => {
    try {
      // If using Next.js Image, you could return the original src
      // This is a placeholder for custom image optimization
      // In a real app, you might use imgix, Cloudinary, or other services
      return src;
    } catch (error) {
      console.error("Error optimizing image URL:", error);
      return src;
    }
  }, [src]);

  // Manually load the image
  const loadImage = useCallback(() => {
    setShouldLoad(true);
  }, []);

  // Set up intersection observer for lazy loading
  useEffect(() => {
    if (!lazyLoad || preload || !ref.current) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold },
    );

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [lazyLoad, preload, rootMargin, threshold]);

  // Load the image when shouldLoad is true
  useEffect(() => {
    if (!shouldLoad) {
      return;
    }

    setIsLoading(true);
    setHasError(false);
    setError(null);

    const img = new Image();

    img.onload = () => {
      setIsLoading(false);
      setIsLoaded(true);
    };

    img.onerror = (e) => {
      setIsLoading(false);
      setHasError(true);
      setError(`Failed to load image: ${e}`);
    };

    img.src = optimizedSrc;

    // Preload high priority images
    if (preload) {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = optimizedSrc;
      document.head.appendChild(link);

      return () => {
        document.head.removeChild(link);
      };
    }
  }, [shouldLoad, optimizedSrc, preload]);

  // Container styles for aspect ratio
  const containerStyle: React.CSSProperties = {
    position: "relative",
    overflow: "hidden",
    ...(aspectRatio ? { paddingBottom: `${aspectRatio * 100}%` } : {}),
    ...(placeholder === "color" ? { backgroundColor: placeholderColor } : {}),
  };

  // Container class name based on state
  const containerClassName = [
    "image-container",
    isLoading ? "image-loading" : "",
    isLoaded ? "image-loaded" : "",
    hasError ? "image-error" : "",
    placeholder === "blur" ? "image-blur-placeholder" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return {
    imageSrc: shouldLoad ? optimizedSrc : "",
    isLoading,
    isLoaded,
    hasError,
    error,
    ref,
    aspectRatio,
    containerStyle,
    containerClassName,
    loadImage,
  };
}

export default useImageOptimizer;
