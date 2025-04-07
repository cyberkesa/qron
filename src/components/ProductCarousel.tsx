"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { ProductCard } from "./ProductCard";
import { Product } from "@/types/api";

interface ProductCarouselProps {
  products: Product[];
}

export const ProductCarousel = ({ products }: ProductCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleItems, setVisibleItems] = useState(4);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Обновляем количество видимых элементов в зависимости от размера экрана
  useEffect(() => {
    const updateVisibleItems = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setVisibleItems(1);
      } else if (width < 768) {
        setVisibleItems(2);
      } else if (width < 1024) {
        setVisibleItems(3);
      } else {
        setVisibleItems(4);
      }
    };

    updateVisibleItems();
    window.addEventListener("resize", updateVisibleItems);
    return () => window.removeEventListener("resize", updateVisibleItems);
  }, []);

  // Переход к следующему товару
  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex + 1 >= products.length ? 0 : prevIndex + 1
    );
  };

  // Переход к предыдущему товару
  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? products.length - 1 : prevIndex - 1
    );
  };

  // Если нет товаров, не отображаем карусель
  if (!products.length) return null;

  return (
    <div className="relative">
      {/* Кнопка "Предыдущий" */}
      <button
        onClick={prevSlide}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 p-2 rounded-full bg-white shadow-md hover:bg-gray-100 text-gray-700 transition-colors"
        aria-label="Предыдущий товар"
      >
        <ChevronLeftIcon className="w-5 h-5" />
      </button>

      {/* Контейнер карусели */}
      <div className="overflow-hidden" ref={carouselRef}>
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{
            transform: `translateX(-${(currentIndex * 100) / visibleItems}%)`,
            width: `${(products.length * 100) / visibleItems}%`,
          }}
        >
          {products.map((product, index) => (
            <div
              key={`carousel-${product.id}-${index}`}
              className="px-2"
              style={{ width: `${100 / visibleItems}%` }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>

      {/* Кнопка "Следующий" */}
      <button
        onClick={nextSlide}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 p-2 rounded-full bg-white shadow-md hover:bg-gray-100 text-gray-700 transition-colors"
        aria-label="Следующий товар"
      >
        <ChevronRightIcon className="w-5 h-5" />
      </button>
    </div>
  );
};
