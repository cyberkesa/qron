import React, { useState, useEffect, useRef, useMemo } from 'react';

interface VirtualizedDOMProps {
  children: React.ReactNode[];
  maxVisibleItems?: number;
  itemHeight?: number;
  containerHeight?: number;
  className?: string;
}

/**
 * Компонент для виртуализации DOM и уменьшения количества элементов
 */
export const VirtualizedDOM: React.FC<VirtualizedDOMProps> = ({
  children,
  maxVisibleItems = 50,
  itemHeight = 100,
  containerHeight = 500,
  className = '',
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Вычисляем видимые элементы
  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      children.length,
      startIndex + Math.ceil(containerHeight / itemHeight) + 2
    );

    return children.slice(startIndex, endIndex).map((child, index) => ({
      child,
      index: startIndex + index,
    }));
  }, [children, scrollTop, itemHeight, containerHeight]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  // Если элементов меньше максимума, рендерим все
  if (children.length <= maxVisibleItems) {
    return <div className={className}>{children}</div>;
  }

  const totalHeight = children.length * itemHeight;

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ child, index }) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: index * itemHeight,
              left: 0,
              right: 0,
              height: itemHeight,
            }}
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Хук для ленивой загрузки компонентов
 */
export const useLazyComponents = <T,>(items: T[], batchSize: number = 20) => {
  const [loadedCount, setLoadedCount] = useState(batchSize);

  const loadMore = () => {
    setLoadedCount((prev) => Math.min(prev + batchSize, items.length));
  };

  const visibleItems = items.slice(0, loadedCount);
  const hasMore = loadedCount < items.length;

  return { visibleItems, hasMore, loadMore };
};

export default VirtualizedDOM;
