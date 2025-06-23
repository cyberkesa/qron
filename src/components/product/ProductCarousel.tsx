'use client';

import { useRef, useEffect, useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { ProductCard } from './ProductCard';
import { Product } from '@/types/api';

interface ProductCarouselProps {
  products: Product[];
}

export const ProductCarousel = ({ products }: ProductCarouselProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Проверка размера экрана
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Обновление состояния кнопок прокрутки
  const updateScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  // Функция для получения размера карточки в зависимости от экрана
  const getCardWidth = () => {
    if (!scrollContainerRef.current) return 280;

    const container = scrollContainerRef.current;
    const containerWidth = container.clientWidth;

    // На мобиле: 1.5 карточки видно
    if (window.innerWidth < 640) {
      return containerWidth * 0.7; // 70% ширины контейнера
    }

    // На планшете: 2.5 карточки видно
    if (window.innerWidth < 1024) {
      return containerWidth * 0.45; // 45% ширины контейнера
    }

    // На десктопе: стандартная ширина
    return 280;
  };

  // Функция для прокрутки влево
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const cardWidth = getCardWidth();
      const scrollAmount = isMobile ? cardWidth : cardWidth * 2;
      scrollContainerRef.current.scrollBy({
        left: -scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // Функция для прокрутки вправо
  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const cardWidth = getCardWidth();
      const scrollAmount = isMobile ? cardWidth : cardWidth * 2;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // Обработчик прокрутки
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      updateScrollButtons();
      container.addEventListener('scroll', updateScrollButtons);

      return () => {
        container.removeEventListener('scroll', updateScrollButtons);
      };
    }
  }, [products]);

  // Если нет товаров, не отображаем карусель
  if (!products.length) return null;

  return (
    <div className="relative">
      {/* Кнопка "Предыдущий" - скрыта на мобиле если нельзя прокрутить */}
      {canScrollLeft && (
        <button
          onClick={scrollLeft}
          className={`absolute left-0 sm:left-1 top-1/2 -translate-y-1/2 z-10 p-1.5 sm:p-2 rounded-full bg-white shadow-md hover:bg-gray-100 text-gray-700 transition-all duration-200 hover:shadow-lg ${
            isMobile ? 'scale-90' : ''
          }`}
          aria-label="Предыдущий товар"
        >
          <ChevronLeftIcon className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      )}

      {/* Контейнер со скроллом */}
      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto gap-3 sm:gap-4 py-2 sm:py-4 px-8 sm:px-10 no-scrollbar scroll-smooth snap-x snap-mandatory"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch', // Улучшенная прокрутка на iOS
        }}
      >
        {products.map((product, index) => (
          <div
            key={`scroll-${product.id}-${index}`}
            className="flex-shrink-0 w-[70vw] sm:w-[45vw] lg:w-full max-w-[200px] sm:max-w-[240px] lg:max-w-[280px] snap-start"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {/* Кнопка "Следующий" - скрыта на мобиле если нельзя прокрутить */}
      {canScrollRight && (
        <button
          onClick={scrollRight}
          className={`absolute right-0 sm:right-1 top-1/2 -translate-y-1/2 z-10 p-1.5 sm:p-2 rounded-full bg-white shadow-md hover:bg-gray-100 text-gray-700 transition-all duration-200 hover:shadow-lg ${
            isMobile ? 'scale-90' : ''
          }`}
          aria-label="Следующий товар"
        >
          <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      )}

      {/* Индикаторы прокрутки - только на мобиле */}
      {isMobile && products.length > 2 && (
        <div className="flex justify-center mt-2 space-x-1">
          {Array.from({ length: Math.ceil(products.length / 2) }).map(
            (_, index) => (
              <div
                key={index}
                className="cursor-pointer"
                onClick={() => {
                  if (scrollContainerRef.current) {
                    const cardWidth = getCardWidth();
                    scrollContainerRef.current.scrollTo({
                      left: cardWidth * index * 2,
                      behavior: 'smooth',
                    });
                  }
                }}
              >
                <span className="block w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-gray-300 transition-colors duration-200" />
              </div>
            )
          )}
        </div>
      )}

      {/* CSS для скрытия полосы прокрутки и улучшения UX */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        /* Улучшенная прокрутка на мобиле */
        @media (max-width: 768px) {
          .no-scrollbar {
            scroll-snap-type: x mandatory;
            scroll-behavior: smooth;
            -webkit-overflow-scrolling: touch;
          }
        }
      `}</style>
    </div>
  );
};
