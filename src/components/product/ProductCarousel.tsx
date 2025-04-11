"use client";

import { useRef, useEffect } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { ProductCard } from "./ProductCard";
import { Product } from "@/types/api";

interface ProductCarouselProps {
  products: Product[];
}

export const ProductCarousel = ({ products }: ProductCarouselProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Функция для прокрутки влево
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const cardWidth = container.querySelector("div")?.offsetWidth || 300;
      container.scrollBy({ left: -cardWidth, behavior: "smooth" });
    }
  };

  // Функция для прокрутки вправо
  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const cardWidth = container.querySelector("div")?.offsetWidth || 300;
      container.scrollBy({ left: cardWidth, behavior: "smooth" });
    }
  };

  // Если нет товаров, не отображаем карусель
  if (!products.length) return null;

  return (
    <div className="relative">
      {/* Кнопка "Предыдущий" */}
      <button
        onClick={scrollLeft}
        className="absolute left-1 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white shadow-md hover:bg-gray-100 text-gray-700 transition-colors"
        aria-label="Предыдущий товар"
      >
        <ChevronLeftIcon className="w-5 h-5" />
      </button>

      {/* Контейнер со скроллом */}
      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto gap-4 py-4 px-10 no-scrollbar scroll-smooth snap-x"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {products.map((product, index) => (
          <div
            key={`scroll-${product.id}-${index}`}
            className="flex-shrink-0 w-full max-w-[280px] sm:max-w-[240px] snap-start"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {/* Кнопка "Следующий" */}
      <button
        onClick={scrollRight}
        className="absolute right-1 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white shadow-md hover:bg-gray-100 text-gray-700 transition-colors"
        aria-label="Следующий товар"
      >
        <ChevronRightIcon className="w-5 h-5" />
      </button>

      {/* CSS для скрытия полосы прокрутки */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};
