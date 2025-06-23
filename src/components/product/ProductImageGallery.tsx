'use client';

import { useState, useMemo, useCallback } from 'react';
import Image from 'next/image';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PhotoIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
}

interface ProductImageGalleryProps {
  images: ProductImage[];
  productName: string;
}

const ProductImageGallery = ({
  images,
  productName,
}: ProductImageGalleryProps) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isImageLoading, setIsImageLoading] = useState(true);

  // Мемоизируем текущее изображение
  const currentImage = useMemo(() => {
    return images[selectedImageIndex] || images[0];
  }, [images, selectedImageIndex]);

  // Обработчик изменения изображения
  const handleImageChange = useCallback(
    (index: number) => {
      if (index !== selectedImageIndex) {
        setIsImageLoading(true);
        setSelectedImageIndex(index);
      }
    },
    [selectedImageIndex]
  );

  const handleImageLoad = useCallback(() => {
    setIsImageLoading(false);
  }, []);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Основное изображение */}
      <div className="relative group">
        <div className="aspect-square bg-white rounded-lg md:rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-500 overflow-hidden product-image-container">
          {currentImage ? (
            <div className="relative w-full h-full">
              {/* Загрузочный скелетон */}
              {isImageLoading && (
                <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-200 rounded-full animate-pulse"></div>
                </div>
              )}

              <Image
                src={currentImage.url}
                alt={currentImage.alt}
                className={`object-contain p-2 sm:p-4 md:p-8 transition-all duration-500 ${
                  isImageLoading ? 'opacity-0' : 'opacity-100'
                }`}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 100vw, 50vw"
                priority={selectedImageIndex === 0}
                quality={95}
                onLoad={handleImageLoad}
                unoptimized={true}
              />

              {/* Кнопка увеличения */}
              <div className="absolute top-2 right-2 md:top-4 md:right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button className="bg-white/90 backdrop-blur-sm p-2 md:p-3 rounded-lg md:rounded-xl shadow-lg hover:bg-white hover:shadow-xl transition-all duration-300 transform hover:scale-110">
                  <MagnifyingGlassIcon className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 bg-gray-50">
              <PhotoIcon className="w-16 h-16 md:w-20 md:h-20 mb-3 md:mb-4 text-gray-300" />
              <span className="text-sm font-medium">
                Изображение отсутствует
              </span>
            </div>
          )}

          {/* Навигация по изображениям */}
          {images.length > 1 && (
            <>
              <button
                className="absolute left-1 sm:left-2 md:left-4 top-1/2 transform -translate-y-1/2 bg-white/95 backdrop-blur-sm p-1.5 sm:p-2 md:p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 group/nav opacity-70 md:opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95"
                onClick={() =>
                  handleImageChange(
                    (selectedImageIndex - 1 + images.length) % images.length
                  )
                }
                aria-label="Предыдущее изображение"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <ChevronLeftIcon className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-gray-700 group-hover/nav:text-blue-600 transition-colors" />
              </button>

              <button
                className="absolute right-1 sm:right-2 md:right-4 top-1/2 transform -translate-y-1/2 bg-white/95 backdrop-blur-sm p-1.5 sm:p-2 md:p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 group/nav opacity-70 md:opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95"
                onClick={() =>
                  handleImageChange((selectedImageIndex + 1) % images.length)
                }
                aria-label="Следующее изображение"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <ChevronRightIcon className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-gray-700 group-hover/nav:text-blue-600 transition-colors" />
              </button>
            </>
          )}

          {/* Индикатор изображений */}
          {images.length > 1 && (
            <div className="absolute bottom-2 sm:bottom-3 md:bottom-4 left-1/2 transform -translate-x-1/2 flex gap-0.5 sm:gap-1 md:gap-2 opacity-90 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
              {images.map((_, index) => (
                <div 
                  key={index}
                  onClick={() => handleImageChange(index)}
                  className="cursor-pointer focus:outline-none"
                  role="button"
                  tabIndex={0}
                  aria-label={`Перейти к изображению ${index + 1}`}
                >
                  <span
                    className={`block rounded-full ${
                      selectedImageIndex === index
                        ? 'bg-blue-600 w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-3 md:h-3'
                        : 'bg-white/70 w-1 h-1 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2'
                    }`}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Миниатюры изображений */}
      {images.length > 1 && (
        <div className="space-y-2 md:space-y-3">
          <h3 className="text-sm font-semibold text-gray-900 px-1">
            Все фото ({images.length})
          </h3>

          <div className="flex gap-2 md:gap-3 overflow-x-auto overflow-y-hidden py-2 px-1 no-scrollbar -mx-1">
            {images.map((image: ProductImage, index: number) => (
              <button
                key={image.id}
                className={`relative flex-shrink-0 group/thumb transition-all duration-300 ${
                  selectedImageIndex === index
                    ? 'ring-2 ring-blue-500 ring-offset-1 md:ring-offset-2 scale-105 shadow-lg'
                    : 'hover:scale-105 hover:shadow-md'
                } rounded-lg md:rounded-xl w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-95 overflow-hidden bg-white border border-gray-100`}
                onClick={() => handleImageChange(index)}
                aria-label={`Выбрать изображение ${index + 1}`}
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <Image
                  src={image.url}
                  alt={`${productName} - изображение ${index + 1}`}
                  className="object-contain p-1.5 md:p-2 transition-transform duration-300 group-hover/thumb:scale-110"
                  fill
                  sizes="(max-width: 640px) 64px, (max-width: 768px) 80px, 96px"
                  unoptimized={true}
                />

                {/* Overlay для неактивных миниатюр */}
                {selectedImageIndex !== index && (
                  <div className="absolute inset-0 bg-gray-900/10 group-hover/thumb:bg-transparent transition-colors duration-300" />
                )}

                {/* Индикатор активной миниатюры */}
                {selectedImageIndex === index && (
                  <div className="absolute top-1 right-1 w-2.5 h-2.5 md:w-3 md:h-3 bg-blue-500 rounded-full border-2 border-white shadow-sm" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductImageGallery;