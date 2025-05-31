import React from 'react';
import Image, { ImageProps } from 'next/image';

interface NextGenImageProps extends Omit<ImageProps, 'src'> {
  src: string;
  webpSrc?: string;
  avifSrc?: string;
  fallbackSrc?: string;
}

/**
 * Компонент для автоматического использования современных форматов изображений
 */
export const NextGenImage: React.FC<NextGenImageProps> = ({
  src,
  webpSrc,
  avifSrc,
  fallbackSrc,
  alt,
  ...props
}) => {
  // Автоматически генерируем WebP и AVIF версии если они не предоставлены
  const generateModernFormat = (
    originalSrc: string,
    format: 'webp' | 'avif'
  ) => {
    if (
      originalSrc.includes('tovari-kron.ru') ||
      originalSrc.includes('files.tovari-kron.ru')
    ) {
      // Для изображений с нашего CDN добавляем параметры формата
      const url = new URL(originalSrc);
      url.searchParams.set('format', format);
      url.searchParams.set('quality', '85');
      return url.toString();
    }
    return originalSrc;
  };

  const finalWebpSrc = webpSrc || generateModernFormat(src, 'webp');
  const finalAvifSrc = avifSrc || generateModernFormat(src, 'avif');

  return (
    <picture>
      {/* AVIF - самый современный формат */}
      <source srcSet={finalAvifSrc} type="image/avif" />

      {/* WebP - широко поддерживаемый современный формат */}
      <source srcSet={finalWebpSrc} type="image/webp" />

      {/* Fallback к оригинальному изображению */}
      <Image
        src={fallbackSrc || src}
        alt={alt}
        {...props}
        onError={(e) => {
          // Если изображение не загрузилось, пробуем fallback
          if (fallbackSrc && e.currentTarget.src !== fallbackSrc) {
            e.currentTarget.src = fallbackSrc;
          }
        }}
      />
    </picture>
  );
};

export default NextGenImage;
