"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import Image from "next/image";
import {
  ArrowsPointingOutIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  PhotoIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

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
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Мемоизируем текущее изображение
  const currentImage = useMemo(() => {
    return images[selectedImageIndex] || images[0];
  }, [images, selectedImageIndex]);

  // Обработчик изменения изображения
  const handleImageChange = useCallback((index: number) => {
    setSelectedImageIndex(index);
    setIsZooming(false);
  }, []);

  // Обработчик открытия/закрытия галереи
  const handleGalleryToggle = useCallback(() => {
    setIsGalleryOpen((prev) => !prev);
    setIsZooming(false);
  }, []);

  // Функция для обработки зума изображения
  const handleZoomToggle = useCallback(() => {
    setIsZooming((prev) => !prev);
  }, []);

  // Обработчик движения мыши для зума
  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!isZooming || !imageContainerRef.current) return;

      const container = imageContainerRef.current;
      const rect = container.getBoundingClientRect();

      // Вычисляем относительную позицию курсора в контейнере (0-1)
      const x = Math.min(
        Math.max(0, (event.clientX - rect.left) / rect.width),
        1,
      );
      const y = Math.min(
        Math.max(0, (event.clientY - rect.top) / rect.height),
        1,
      );

      setZoomPosition({ x, y });
    },
    [isZooming],
  );

  // Сброс зума при смене изображения или закрытии галереи
  useEffect(() => {
    setIsZooming(false);
  }, [selectedImageIndex, isGalleryOpen]);

  return (
    <div className="flex flex-col space-y-4 relative md:sticky md:top-4 sm:pb-6">
      <div
        className={`rounded-xl overflow-hidden aspect-square relative ${isZooming ? "cursor-zoom-out" : "cursor-zoom-in"}`}
        ref={imageContainerRef}
        onClick={handleZoomToggle}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => isZooming && setIsZooming(false)}
      >
        {currentImage ? (
          <>
            {isZooming ? (
              <div className="absolute inset-0 overflow-hidden">
                <div
                  className="absolute w-[200%] h-[200%] transition-transform duration-75"
                  style={{
                    transform: `translate(${-zoomPosition.x * 100}%, ${-zoomPosition.y * 100}%)`,
                    backgroundImage: `url(${currentImage.url})`,
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "contain",
                  }}
                />
              </div>
            ) : (
              <Image
                src={currentImage.url}
                alt={currentImage.alt}
                className="object-contain p-6"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            )}
            <div className="absolute bottom-4 right-4 flex space-x-2">
              <button
                className="bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-white transition-all focus:outline-none"
                onClick={(e) => {
                  e.stopPropagation();
                  handleZoomToggle();
                }}
                aria-label={
                  isZooming ? "Отключить увеличение" : "Увеличить изображение"
                }
              >
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-600" />
              </button>
              <button
                className="bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-white transition-all focus:outline-none"
                onClick={(e) => {
                  e.stopPropagation();
                  handleGalleryToggle();
                }}
                aria-label="Открыть полноэкранный просмотр"
              >
                <ArrowsPointingOutIcon className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </>
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
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-white transition-all focus:outline-none group"
              onClick={(e) => {
                e.stopPropagation();
                handleImageChange(
                  (selectedImageIndex - 1 + images.length) % images.length,
                );
              }}
              aria-label="Предыдущее изображение"
            >
              <ChevronLeftIcon className="h-5 w-5 text-gray-600 group-hover:text-gray-900" />
            </button>
            <button
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-white transition-all focus:outline-none group"
              onClick={(e) => {
                e.stopPropagation();
                handleImageChange((selectedImageIndex + 1) % images.length);
              }}
              aria-label="Следующее изображение"
            >
              <ChevronRightIcon className="h-5 w-5 text-gray-600 group-hover:text-gray-900" />
            </button>
          </>
        )}
      </div>

      {/* Миниатюры изображений */}
      {images.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto overflow-y-hidden py-2 px-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 no-scrollbar">
          {images.map((image: ProductImage, index: number) => (
            <button
              key={image.id}
              className={`relative flex-shrink-0 ${
                selectedImageIndex === index
                  ? "border-2 border-blue-600 ring-2 ring-blue-200"
                  : "border border-gray-200 hover:border-gray-300"
              } rounded-lg w-16 h-16 sm:w-20 sm:h-20 transition-all focus:outline-none`}
              onClick={() => handleImageChange(index)}
              aria-label={`Выбрать изображение ${index + 1}`}
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

      {/* Полноэкранный просмотр галереи */}
      {isGalleryOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <div className="relative w-full h-full">
            <button
              className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 transition-colors p-2 rounded-full text-white z-10"
              onClick={() => setIsGalleryOpen(false)}
              aria-label="Закрыть галерею"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>

            <div className="absolute top-0 bottom-0 left-0 right-0 flex items-center justify-center">
              <Image
                src={currentImage.url}
                alt={currentImage.alt}
                className="object-contain p-8"
                width={1200}
                height={1200}
                sizes="100vw"
              />
            </div>

            {images.length > 1 && (
              <>
                <button
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 transition-colors p-3 rounded-full text-white"
                  onClick={() =>
                    handleImageChange(
                      (selectedImageIndex - 1 + images.length) % images.length,
                    )
                  }
                  aria-label="Предыдущее изображение"
                >
                  <ChevronLeftIcon className="h-6 w-6" />
                </button>
                <button
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 transition-colors p-3 rounded-full text-white"
                  onClick={() =>
                    handleImageChange((selectedImageIndex + 1) % images.length)
                  }
                  aria-label="Следующее изображение"
                >
                  <ChevronRightIcon className="h-6 w-6" />
                </button>
              </>
            )}

            {/* Миниатюры в галерее */}
            {images.length > 1 && (
              <div className="absolute bottom-0 left-0 right-0 flex justify-center items-center p-4 bg-black/50 backdrop-blur-sm">
                <div className="flex space-x-2 overflow-x-auto">
                  {images.map((image: ProductImage, index: number) => (
                    <button
                      key={image.id}
                      className={`relative ${
                        selectedImageIndex === index
                          ? "border-2 border-white"
                          : "border border-gray-600 opacity-70 hover:opacity-100"
                      } rounded-md w-16 h-16 transition-all focus:outline-none`}
                      onClick={() => handleImageChange(index)}
                      aria-label={`Выбрать изображение ${index + 1}`}
                    >
                      <Image
                        src={image.url}
                        alt={`${productName} - изображение ${index + 1}`}
                        className="object-contain p-1"
                        width={64}
                        height={64}
                        sizes="64px"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductImageGallery;
