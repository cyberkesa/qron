'use client';

import { useState, useMemo, useCallback } from 'react';
import Image from 'next/image';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PhotoIcon,
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

  // Мемоизируем текущее изображение
  const currentImage = useMemo(() => {
    return images[selectedImageIndex] || images[0];
  }, [images, selectedImageIndex]);

  // Обработчик изменения изображения
  const handleImageChange = useCallback((index: number) => {
    setSelectedImageIndex(index);
  }, []);

  return (
    <div className="flex flex-col space-y-4 relative md:sticky md:top-4 sm:pb-6">
      <div
        className="rounded-xl overflow-hidden aspect-square relative
        bg-white border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-md"
      >
        {currentImage ? (
          <div className="animate-fadeIn">
            <Image
              src={currentImage.url}
              alt={currentImage.alt}
              className="object-contain p-6 transition-opacity duration-300"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
              quality={90}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <PhotoIcon className="h-16 w-16 mb-2" />
            <span>Изображение отсутствует</span>
          </div>
        )}

        {/* Навигация по изображениям */}
        {images.length > 1 && (
          <>
            <button
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 group active:scale-95"
              onClick={() =>
                handleImageChange(
                  (selectedImageIndex - 1 + images.length) % images.length
                )
              }
              aria-label="Предыдущее изображение"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <ChevronLeftIcon className="h-5 w-5 text-gray-600 group-hover:text-gray-900" />
            </button>
            <button
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 group active:scale-95"
              onClick={() =>
                handleImageChange((selectedImageIndex + 1) % images.length)
              }
              aria-label="Следующее изображение"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <ChevronRightIcon className="h-5 w-5 text-gray-600 group-hover:text-gray-900" />
            </button>
          </>
        )}
      </div>

      {/* Миниатюры изображений - оптимизированы для свайпа на мобильных */}
      {images.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto overflow-y-hidden py-2 px-1 no-scrollbar -mx-1 px-1">
          {images.map((image: ProductImage, index: number) => (
            <button
              key={image.id}
              className={`relative flex-shrink-0 ${
                selectedImageIndex === index
                  ? 'border-2 border-blue-600 ring-2 ring-blue-200 scale-[1.05] shadow-md'
                  : 'border border-gray-200 hover:border-gray-300'
              } rounded-lg w-16 h-16 sm:w-20 sm:h-20 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 active:scale-95`}
              onClick={() => handleImageChange(index)}
              aria-label={`Выбрать изображение ${index + 1}`}
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <Image
                src={image.url}
                alt={`${productName} - изображение ${index + 1}`}
                className="object-contain p-1"
                width={80}
                height={80}
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImageGallery;
