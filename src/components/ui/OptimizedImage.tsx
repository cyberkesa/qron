import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image, { ImageProps } from 'next/image';

interface OptimizedImageProps
  extends Omit<ImageProps, 'src' | 'onLoad' | 'onError'> {
  src: string;
  fallbackSrc?: string;
  webpSrc?: string;
  avifSrc?: string;
  blurDataURL?: string;
  enableLazyLoading?: boolean;
  enableBlurEffect?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  quality?: number;
  sizes?: string;
}

/**
 * Оптимизированный компонент изображения с поддержкой:
 * - Современных форматов (WebP, AVIF)
 * - Ленивой загрузки
 * - Blur-эффекта при загрузке
 * - Fallback изображений
 * - Адаптивных размеров
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  fallbackSrc = '/images/product-placeholder.png',
  webpSrc,
  avifSrc,
  alt,
  width,
  height,
  className = '',
  blurDataURL,
  enableLazyLoading = true,
  enableBlurEffect = true,
  onLoad,
  onError,
  quality = 85,
  sizes,
  priority = false,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [isInView, setIsInView] = useState(!enableLazyLoading || priority);
  const imgRef = useRef<HTMLDivElement>(null);

  // Intersection Observer для ленивой загрузки
  useEffect(() => {
    if (!enableLazyLoading || priority || isInView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Начинаем загрузку за 50px до появления в viewport
        threshold: 0.1,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [enableLazyLoading, priority, isInView]);

  // Обработчики загрузки
  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    if (!hasError && fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setHasError(true);
    } else {
      setHasError(true);
      onError?.();
    }
  }, [hasError, fallbackSrc, currentSrc, onError]);

  // Определяем лучший источник изображения с HTTP/2 оптимизацией
  const getBestImageSrc = useCallback(() => {
    // Автоматически генерируем современные форматы для доменов tovari-kron.ru
    if (
      currentSrc.includes('tovari-kron.ru') ||
      currentSrc.includes('files.tovari-kron.ru')
    ) {
      // Проверяем поддержку форматов браузером
      if (typeof window !== 'undefined') {
        // Проверяем поддержку AVIF
        if (avifSrc || currentSrc.match(/\.(jpg|jpeg|png)$/i)) {
          const avifUrl =
            avifSrc || currentSrc.replace(/\.(jpg|jpeg|png)$/i, '.avif');
          // Возвращаем AVIF если поддерживается
          if (CSS.supports('(content: url("data:image/avif;base64,"))')) {
            return avifUrl;
          }
        }

        // Проверяем поддержку WebP
        if (webpSrc || currentSrc.match(/\.(jpg|jpeg|png)$/i)) {
          const webpUrl =
            webpSrc || currentSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp');
          // Возвращаем WebP если поддерживается
          if (CSS.supports('(content: url("data:image/webp;base64,"))')) {
            return webpUrl;
          }
        }
      }
    }

    return currentSrc;
  }, [avifSrc, webpSrc, currentSrc]);

  // Генерируем srcSet для адаптивных изображений
  const generateSrcSet = useCallback(
    (baseSrc: string) => {
      if (!width || !height) return undefined;

      const widthNum =
        typeof width === 'number' ? width : parseInt(width.toString());
      const heightNum =
        typeof height === 'number' ? height : parseInt(height.toString());

      const srcSet = [
        `${baseSrc}?w=${Math.round(widthNum * 0.5)}&h=${Math.round(heightNum * 0.5)}&q=${quality} 0.5x`,
        `${baseSrc}?w=${widthNum}&h=${heightNum}&q=${quality} 1x`,
        `${baseSrc}?w=${Math.round(widthNum * 1.5)}&h=${Math.round(heightNum * 1.5)}&q=${quality} 1.5x`,
        `${baseSrc}?w=${Math.round(widthNum * 2)}&h=${Math.round(heightNum * 2)}&q=${quality} 2x`,
      ].join(', ');

      return srcSet;
    },
    [width, height, quality]
  );

  // Стили для blur-эффекта
  const imageClassName = `
    ${className}
    transition-all duration-300 ease-in-out
    ${enableBlurEffect && !isLoaded && !hasError ? 'filter blur-sm scale-105' : 'filter-none scale-100'}
    ${isLoaded ? 'opacity-100' : 'opacity-0'}
  `.trim();

  // Если изображение не должно загружаться (ленивая загрузка), показываем placeholder
  if (!isInView) {
    return (
      <div
        ref={imgRef}
        className={`animate-shimmer ${className}`}
        style={{ width, height }}
        aria-label={alt}
      >
        {blurDataURL && (
          <Image
            src={blurDataURL}
            alt=""
            width={width}
            height={height}
            className="opacity-50"
            {...props}
          />
        )}
      </div>
    );
  }

  const bestSrc = getBestImageSrc();

  return (
    <div ref={imgRef} className="relative overflow-hidden">
      {/* Основное изображение */}
      <Image
        src={bestSrc}
        alt={alt}
        width={width}
        height={height}
        className={imageClassName}
        onLoad={handleLoad}
        onError={handleError}
        priority={priority}
        quality={quality}
        sizes={sizes}
        placeholder={blurDataURL ? 'blur' : 'empty'}
        blurDataURL={blurDataURL}
        {...props}
      />

      {/* Skeleton loader */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 animate-shimmer" />
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-gray-400 text-sm text-center">
            <svg
              className="w-8 h-8 mx-auto mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Изображение недоступно
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Хук для предзагрузки изображений
 */
export function useImagePreloader(urls: string[]) {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(
    new Set<string>()
  );
  const [failedImages, setFailedImages] = useState<Set<string>>(
    new Set<string>()
  );

  useEffect(() => {
    const preloadImage = (url: string) => {
      return new Promise<void>((resolve, reject) => {
        const img = document.createElement('img');

        img.onload = () => {
          setLoadedImages((prev) => new Set<string>(prev).add(url));
          resolve();
        };

        img.onerror = () => {
          setFailedImages((prev) => new Set<string>(prev).add(url));
          reject();
        };

        img.src = url;
      });
    };

    // Предзагружаем все изображения
    urls.forEach((url) => {
      if (!loadedImages.has(url) && !failedImages.has(url)) {
        preloadImage(url).catch(() => {
          // Ошибка уже обработана в onerror
        });
      }
    });
  }, [urls, loadedImages, failedImages]);

  return {
    isLoaded: (url: string) => loadedImages.has(url),
    hasFailed: (url: string) => failedImages.has(url),
    loadedCount: loadedImages.size,
    failedCount: failedImages.size,
    totalCount: urls.length,
  };
}

/**
 * Утилита для генерации blur data URL
 */
export function generateBlurDataURL(
  width: number = 10,
  height: number = 10
): string {
  if (typeof window === 'undefined') return '';

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Создаем простой градиент
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#f3f4f6');
  gradient.addColorStop(1, '#e5e7eb');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  return canvas.toDataURL();
}

export default OptimizedImage;
