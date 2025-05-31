import { useEffect } from 'react';

interface ImagePreloaderProps {
  images: string[];
  priority?: boolean;
}

/**
 * Компонент для предзагрузки критических изображений
 */
export const ImagePreloader: React.FC<ImagePreloaderProps> = ({
  images,
  priority = false,
}) => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const preloadImages = images.slice(0, priority ? 6 : 3); // Ограничиваем количество

    preloadImages.forEach((src, index) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;

      if (priority && index < 2) {
        link.setAttribute('fetchpriority', 'high');
      }

      // Добавляем современные форматы
      if (src.includes('tovari-kron.ru')) {
        const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
        const avifSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.avif');

        // Создаем preload для WebP
        const webpLink = document.createElement('link');
        webpLink.rel = 'preload';
        webpLink.as = 'image';
        webpLink.href = webpSrc;
        webpLink.type = 'image/webp';

        // Создаем preload для AVIF
        const avifLink = document.createElement('link');
        avifLink.rel = 'preload';
        avifLink.as = 'image';
        avifLink.href = avifSrc;
        avifLink.type = 'image/avif';

        document.head.appendChild(avifLink);
        document.head.appendChild(webpLink);
      }

      document.head.appendChild(link);
    });

    // Cleanup function
    return () => {
      const preloadLinks = document.querySelectorAll(
        'link[rel="preload"][as="image"]'
      );
      preloadLinks.forEach((link) => {
        if (
          preloadImages.some((src) => link.getAttribute('href')?.includes(src))
        ) {
          link.remove();
        }
      });
    };
  }, [images, priority]);

  return null;
};

/**
 * Хук для предзагрузки изображений
 */
export const useImagePreloader = (images: string[], priority = false) => {
  useEffect(() => {
    if (typeof window === 'undefined' || !images.length) return;

    const preloadImages = images.slice(0, priority ? 6 : 3);
    const imagePromises: Promise<void>[] = [];

    preloadImages.forEach((src) => {
      const promise = new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => reject();
        img.src = src;
      });
      imagePromises.push(promise);
    });

    // Не ждем завершения всех загрузок, чтобы не блокировать рендеринг
    Promise.allSettled(imagePromises);
  }, [images, priority]);
};
