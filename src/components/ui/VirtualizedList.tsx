import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from 'react';

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
  onScroll?: (scrollTop: number) => void;
  getItemKey?: (item: T, index: number) => string | number;
}

/**
 * Виртуализированный список для оптимизации рендеринга больших списков
 * Рендерит только видимые элементы + буфер
 */
export function VirtualizedList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className = '',
  onScroll,
  getItemKey,
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  // Вычисляем видимые элементы
  const visibleRange = useMemo(() => {
    const startIndex = Math.max(
      0,
      Math.floor(scrollTop / itemHeight) - overscan
    );
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  // Обработчик скролла с throttling
  const handleScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const newScrollTop = event.currentTarget.scrollTop;
      setScrollTop(newScrollTop);
      onScroll?.(newScrollTop);
    },
    [onScroll]
  );

  // Общая высота контейнера
  const totalHeight = items.length * itemHeight;

  // Видимые элементы
  const visibleItems = useMemo(() => {
    const result = [];
    for (let i = visibleRange.startIndex; i <= visibleRange.endIndex; i++) {
      if (items[i]) {
        result.push({
          item: items[i],
          index: i,
          key: getItemKey ? getItemKey(items[i], i) : i,
        });
      }
    }
    return result;
  }, [items, visibleRange, getItemKey]);

  return (
    <div
      ref={scrollElementRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ item, index, key }) => (
          <div
            key={key}
            style={{
              position: 'absolute',
              top: index * itemHeight,
              left: 0,
              right: 0,
              height: itemHeight,
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Виртуализированная сетка для товаров
 */
interface VirtualizedGridProps<T> {
  items: T[];
  itemWidth: number;
  itemHeight: number;
  containerWidth: number;
  containerHeight: number;
  gap?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
  getItemKey?: (item: T, index: number) => string | number;
}

export function VirtualizedGrid<T>({
  items,
  itemWidth,
  itemHeight,
  containerWidth,
  containerHeight,
  gap = 16,
  renderItem,
  overscan = 5,
  className = '',
  getItemKey,
}: VirtualizedGridProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);

  // Вычисляем количество колонок
  const columnsCount = Math.floor((containerWidth + gap) / (itemWidth + gap));
  const rowsCount = Math.ceil(items.length / columnsCount);

  // Высота строки с учетом gap
  const rowHeight = itemHeight + gap;

  // Вычисляем видимые строки
  const visibleRange = useMemo(() => {
    const startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
    const endRow = Math.min(
      rowsCount - 1,
      Math.ceil((scrollTop + containerHeight) / rowHeight) + overscan
    );

    return { startRow, endRow };
  }, [scrollTop, rowHeight, containerHeight, rowsCount, overscan]);

  // Обработчик скролла
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  // Общая высота контейнера
  const totalHeight = rowsCount * rowHeight;

  // Видимые элементы
  const visibleItems = useMemo(() => {
    const result = [];

    for (let row = visibleRange.startRow; row <= visibleRange.endRow; row++) {
      for (let col = 0; col < columnsCount; col++) {
        const index = row * columnsCount + col;
        if (index < items.length) {
          result.push({
            item: items[index],
            index,
            row,
            col,
            key: getItemKey ? getItemKey(items[index], index) : index,
          });
        }
      }
    }

    return result;
  }, [items, visibleRange, columnsCount, getItemKey]);

  return (
    <div
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ item, index, row, col, key }) => (
          <div
            key={key}
            style={{
              position: 'absolute',
              top: row * rowHeight,
              left: col * (itemWidth + gap),
              width: itemWidth,
              height: itemHeight,
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Хук для автоматического определения размеров контейнера
 */
export function useContainerSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateSize = () => {
      if (ref.current) {
        const { width, height } = ref.current.getBoundingClientRect();
        setSize({ width, height });
      }
    };

    updateSize();

    const resizeObserver = new ResizeObserver(updateSize);
    if (ref.current) {
      resizeObserver.observe(ref.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return { ref, size };
}
