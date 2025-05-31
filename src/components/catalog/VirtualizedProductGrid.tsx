import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from 'react';
import { OptimizedProductCard } from '@/components/product/OptimizedProductCard';
import { Product } from '@/types/api';

interface VirtualizedProductGridProps {
  products: Product[];
  className?: string;
  itemsPerRow?: number;
  itemHeight?: number;
  containerHeight?: number;
  overscan?: number;
}

/**
 * Виртуализированная сетка товаров для уменьшения размера DOM
 */
export const VirtualizedProductGrid: React.FC<VirtualizedProductGridProps> = ({
  products,
  className = '',
  itemsPerRow = 4,
  itemHeight = 400,
  containerHeight = 600,
  overscan = 2,
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerSize, setContainerSize] = useState({
    width: 0,
    height: containerHeight,
  });
  const containerRef = useRef<HTMLDivElement>(null);

  // Адаптивное количество элементов в ряду
  const responsiveItemsPerRow = useMemo(() => {
    if (containerSize.width < 640) return 2; // mobile
    if (containerSize.width < 1024) return 3; // tablet
    return itemsPerRow; // desktop
  }, [containerSize.width, itemsPerRow]);

  // Вычисляем видимые элементы
  const visibleItems = useMemo(() => {
    const rowHeight = itemHeight + 16; // включаем gap
    const totalRows = Math.ceil(products.length / responsiveItemsPerRow);
    const startRow = Math.floor(scrollTop / rowHeight);
    const endRow = Math.min(
      totalRows,
      startRow + Math.ceil(containerSize.height / rowHeight) + overscan
    );

    const visibleProducts: Array<{
      product: Product;
      index: number;
      row: number;
      col: number;
    }> = [];

    for (let row = Math.max(0, startRow - overscan); row < endRow; row++) {
      for (let col = 0; col < responsiveItemsPerRow; col++) {
        const index = row * responsiveItemsPerRow + col;
        if (index < products.length) {
          visibleProducts.push({
            product: products[index],
            index,
            row,
            col,
          });
        }
      }
    }

    return visibleProducts;
  }, [
    products,
    responsiveItemsPerRow,
    scrollTop,
    containerSize.height,
    itemHeight,
    overscan,
  ]);

  // Обработчик скролла
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  // Отслеживание размера контейнера
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  // Общая высота контента
  const totalHeight =
    Math.ceil(products.length / responsiveItemsPerRow) * (itemHeight + 16);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      {/* Виртуальный контейнер для правильной работы скролла */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {/* Видимые элементы */}
        <div
          className="absolute inset-0"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${responsiveItemsPerRow}, 1fr)`,
            gap: '16px',
            padding: '16px',
          }}
        >
          {visibleItems.map(({ product, index, row, col }) => (
            <div
              key={`${product.id}-${index}`}
              style={{
                position: 'absolute',
                top: row * (itemHeight + 16),
                left: `${(col / responsiveItemsPerRow) * 100}%`,
                width: `${100 / responsiveItemsPerRow}%`,
                height: itemHeight,
                padding: '0 8px',
              }}
            >
              <OptimizedProductCard
                product={product}
                priority={index < 6} // Приоритет для первых 6 элементов
              />
            </div>
          ))}
        </div>
      </div>

      {/* Индикатор загрузки для пустого состояния */}
      {products.length === 0 && (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Загрузка товаров...</p>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Простая виртуализированная сетка для мобильных устройств
 */
export const MobileVirtualizedGrid: React.FC<{
  products: Product[];
  className?: string;
}> = ({ products, className = '' }) => {
  const [visibleCount, setVisibleCount] = useState(10);
  const [isLoading, setIsLoading] = useState(false);

  const loadMore = useCallback(() => {
    if (isLoading || visibleCount >= products.length) return;

    setIsLoading(true);
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + 10, products.length));
      setIsLoading(false);
    }, 100);
  }, [isLoading, visibleCount, products.length]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 1000
      ) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMore]);

  const visibleProducts = products.slice(0, visibleCount);

  return (
    <div className={className}>
      <div className="grid grid-cols-2 gap-4">
        {visibleProducts.map((product, index) => (
          <OptimizedProductCard
            key={product.id}
            product={product}
            priority={index < 4}
          />
        ))}
      </div>

      {/* Кнопка "Загрузить еще" */}
      {visibleCount < products.length && (
        <div className="mt-8 text-center">
          <button
            onClick={loadMore}
            disabled={isLoading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Загрузка...
              </div>
            ) : (
              'Загрузить еще'
            )}
          </button>
        </div>
      )}
    </div>
  );
};
