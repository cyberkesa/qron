'use client';

import { useEffect, useState, useCallback } from 'react';

interface Http2ImageLoaderProps {
  images: string[];
  onImagesLoaded?: (loadedImages: string[]) => void;
  maxConcurrent?: number;
  priority?: boolean;
}

/**
 * Компонент для оптимизированной загрузки изображений через HTTP/2
 * Использует мультиплексирование для параллельной загрузки
 */
export const Http2ImageLoader: React.FC<Http2ImageLoaderProps> = ({
  images,
  onImagesLoaded,
  maxConcurrent = 6, // HTTP/2 рекомендует до 6 параллельных потоков
  priority = false,
}) => {
  const [loadedImages, setLoadedImages] = useState<string[]>([]);
  const [loadingQueue, setLoadingQueue] = useState<string[]>([]);

  // Функция для загрузки изображения
  const loadImage = useCallback(
    (src: string): Promise<string> => {
      return new Promise((resolve, reject) => {
        const img = new Image();

        // Оптимизации для HTTP/2
        img.crossOrigin = 'anonymous';
        img.decoding = 'async';
        img.loading = priority ? 'eager' : 'lazy';

        img.onload = () => {
          resolve(src);
        };

        img.onerror = () => {
          reject(new Error(`Failed to load image: ${src}`));
        };

        // Добавляем параметры оптимизации для tovari-kron.ru
        if (
          src.includes('tovari-kron.ru') ||
          src.includes('files.tovari-kron.ru')
        ) {
          // Пытаемся загрузить WebP версию
          const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');

          // Проверяем поддержку WebP
          const testWebP = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 1;
            canvas.height = 1;
            return (
              canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0
            );
          };

          if (testWebP()) {
            img.src = webpSrc;
          } else {
            img.src = src;
          }
        } else {
          img.src = src;
        }
      });
    },
    [priority]
  );

  // Функция для загрузки пакета изображений
  const loadImageBatch = useCallback(
    async (batch: string[]) => {
      try {
        const promises = batch.map((src) => loadImage(src));
        const results = await Promise.allSettled(promises);

        const successful = results
          .filter(
            (result): result is PromiseFulfilledResult<string> =>
              result.status === 'fulfilled'
          )
          .map((result) => result.value);

        setLoadedImages((prev) => [...prev, ...successful]);

        // Логируем ошибки в development
        if (process.env.NODE_ENV === 'development') {
          results.forEach((result, index) => {
            if (result.status === 'rejected') {
              console.warn(
                `Failed to load image ${batch[index]}:`,
                result.reason
              );
            }
          });
        }

        return successful;
      } catch (error) {
        console.error('Error loading image batch:', error);
        return [];
      }
    },
    [loadImage]
  );

  // Основная логика загрузки
  useEffect(() => {
    if (images.length === 0) return;

    const loadImages = async () => {
      // Разбиваем изображения на пакеты для HTTP/2 мультиплексирования
      const batches: string[][] = [];
      for (let i = 0; i < images.length; i += maxConcurrent) {
        batches.push(images.slice(i, i + maxConcurrent));
      }

      // Загружаем пакеты последовательно, но изображения в пакете параллельно
      for (const batch of batches) {
        setLoadingQueue((prev) => [...prev, ...batch]);
        await loadImageBatch(batch);
        setLoadingQueue((prev) => prev.filter((img) => !batch.includes(img)));
      }
    };

    loadImages();
  }, [images, maxConcurrent, loadImageBatch]);

  // Уведомляем о завершении загрузки
  useEffect(() => {
    if (loadedImages.length > 0 && onImagesLoaded) {
      onImagesLoaded(loadedImages);
    }
  }, [loadedImages, onImagesLoaded]);

  return null;
};

/**
 * Хук для оптимизированной загрузки изображений
 */
export const useHttp2ImageLoader = (
  images: string[],
  options: {
    maxConcurrent?: number;
    priority?: boolean;
    preload?: boolean;
  } = {}
) => {
  const { maxConcurrent = 6, priority = false, preload = false } = options;

  const [loadedImages, setLoadedImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const loadImages = useCallback(async () => {
    if (images.length === 0) return;

    setIsLoading(true);
    setProgress(0);

    try {
      const batches: string[][] = [];
      for (let i = 0; i < images.length; i += maxConcurrent) {
        batches.push(images.slice(i, i + maxConcurrent));
      }

      let totalLoaded = 0;

      for (const batch of batches) {
        const promises = batch.map(async (src) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.decoding = 'async';
          img.loading = priority ? 'eager' : 'lazy';

          return new Promise<string>((resolve, reject) => {
            img.onload = () => {
              totalLoaded++;
              setProgress((totalLoaded / images.length) * 100);
              resolve(src);
            };
            img.onerror = () => reject(new Error(`Failed to load: ${src}`));
            img.src = src;
          });
        });

        const batchResults = await Promise.allSettled(promises);
        const successful = batchResults
          .filter(
            (result): result is PromiseFulfilledResult<string> =>
              result.status === 'fulfilled'
          )
          .map((result) => result.value);

        setLoadedImages((prev) => [...prev, ...successful]);
      }
    } catch (error) {
      console.error('Error in useHttp2ImageLoader:', error);
    } finally {
      setIsLoading(false);
    }
  }, [images, maxConcurrent, priority]);

  // Автоматическая загрузка при preload
  useEffect(() => {
    if (preload) {
      loadImages();
    }
  }, [preload, loadImages]);

  return {
    loadedImages,
    isLoading,
    progress,
    loadImages,
  };
};

/**
 * Компонент для предзагрузки критических изображений
 */
export const CriticalImagePreloader: React.FC<{
  images: string[];
  onComplete?: () => void;
}> = ({ images, onComplete }) => {
  const { loadedImages, isLoading } = useHttp2ImageLoader(images, {
    maxConcurrent: 3, // Меньше для критических изображений
    priority: true,
    preload: true,
  });

  useEffect(() => {
    if (!isLoading && loadedImages.length === images.length && onComplete) {
      onComplete();
    }
  }, [isLoading, loadedImages.length, images.length, onComplete]);

  return null;
};
