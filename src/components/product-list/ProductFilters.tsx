'use client';

import { ProductSortOrder, Category } from '@/types/api';
import Image from 'next/image';
import { StockFilter } from '@/components/product-list/StockFilter';
import {
  XMarkIcon,
  FunnelIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { ProductSorter } from './ProductSorter';
import { AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';

interface ProductFiltersProps {
  categories: Category[];
  filters: ProductFiltersState;
  onFiltersChange: (filters: Partial<ProductFiltersState>) => void;
  showMobileFilters: boolean;
  onCloseMobileFilters: () => void;
  className?: string;
}

export interface ProductFiltersState {
  selectedCategory: string;
  sortOrder: ProductSortOrder;
  hideOutOfStock: boolean;
  priceRange: [number, number];
  hasImages: boolean;
}

// Компонент для элемента категории
const CategoryItem = ({
  category,
  isSelected,
  onClick,
}: {
  category: Category | null;
  isSelected: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`
      category-item filter-item w-full flex items-center px-3 py-2.5 rounded-lg text-left
      ${
        isSelected
          ? 'active bg-gray-50 text-gray-900 border border-gray-300 shadow-sm'
          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
      }
    `}
  >
    {category?.iconUrl && (
      <div className="w-5 h-5 mr-3 flex-shrink-0">
        <Image
          src={category.iconUrl}
          alt={category.title}
          width={20}
          height={20}
          className="object-contain"
          loading="lazy"
        />
      </div>
    )}
    <span className="text-sm font-medium truncate">
      {category?.title || 'Все категории'}
    </span>
  </button>
);

// Компонент секции фильтров
const FilterSection = ({
  title,
  children,
  isCollapsible = false,
  defaultExpanded = true,
}: {
  title: string;
  children: React.ReactNode;
  isCollapsible?: boolean;
  defaultExpanded?: boolean;
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="filter-section space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        {isCollapsible && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-md hover:bg-gray-100 transition-colors"
          >
            <ChevronDownIcon
              className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                isExpanded ? 'rotate-180' : ''
              }`}
            />
          </button>
        )}
      </div>

      {(!isCollapsible || isExpanded) && (
        <div className="space-y-2 animate-fade-in">{children}</div>
      )}
    </div>
  );
};

// Компонент слайдера для цены
const PriceRangeSlider = ({
  value,
  onChange,
  min = 0,
  max = 100000,
  step = 100,
}: {
  value: [number, number];
  onChange: (value: [number, number]) => void;
  min?: number;
  max?: number;
  step?: number;
}) => {
  const [localValue, setLocalValue] = useState(value);

  const handleMinChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newMin = Math.min(Number(e.target.value), localValue[1] - step);
      const newValue: [number, number] = [newMin, localValue[1]];
      setLocalValue(newValue);
      onChange(newValue);
    },
    [localValue, onChange, step]
  );

  const handleMaxChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newMax = Math.max(Number(e.target.value), localValue[0] + step);
      const newValue: [number, number] = [localValue[0], newMax];
      setLocalValue(newValue);
      onChange(newValue);
    },
    [localValue, onChange, step]
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <div className="flex-1">
          <label className="block text-xs text-gray-600 mb-1">От</label>
          <input
            type="number"
            value={localValue[0]}
            onChange={handleMinChange}
            min={min}
            max={max}
            step={step}
            className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs text-gray-600 mb-1">До</label>
          <input
            type="number"
            value={localValue[1]}
            onChange={handleMaxChange}
            min={min}
            max={max}
            step={step}
            className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="relative h-5 flex items-center">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue[0]}
          onChange={handleMinChange}
          className="absolute w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue[1]}
          onChange={handleMaxChange}
          className="absolute w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
        />
      </div>

      <div className="text-center text-xs text-gray-600 bg-gray-50 rounded py-1.5">
        {localValue[0].toLocaleString()} ₽ - {localValue[1].toLocaleString()} ₽
      </div>
    </div>
  );
};

export const ProductFilters = ({
  categories,
  filters,
  onFiltersChange,
  showMobileFilters,
  onCloseMobileFilters,
  className = '',
}: ProductFiltersProps) => {
  const [isMobile, setIsMobile] = useState(false);

  const hasActiveFilters =
    filters.selectedCategory !== '' || !filters.hideOutOfStock;

  // Проверка мобильного устройства
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Блокировка прокрутки при открытом мобильном фильтре
  useEffect(() => {
    if (isMobile && showMobileFilters) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isMobile, showMobileFilters]);

  const handleCategoryChange = useCallback(
    (categoryId: string) => {
      onFiltersChange({ selectedCategory: categoryId });
    },
    [onFiltersChange]
  );

  const handleSortChange = useCallback(
    (sortOrder: ProductSortOrder) => {
      onFiltersChange({ sortOrder });
    },
    [onFiltersChange]
  );

  const handleStockFilterChange = useCallback(
    (hideOutOfStock: boolean) => {
      onFiltersChange({ hideOutOfStock });
    },
    [onFiltersChange]
  );

  const handlePriceRangeChange = useCallback(
    (priceRange: [number, number]) => {
      onFiltersChange({ priceRange });
    },
    [onFiltersChange]
  );

  const handleImagesFilterChange = useCallback(
    (hasImages: boolean) => {
      onFiltersChange({ hasImages });
    },
    [onFiltersChange]
  );

  const resetFilters = useCallback(() => {
    onFiltersChange({
      selectedCategory: '',
      sortOrder: 'NEWEST_FIRST',
      hideOutOfStock: false,
      priceRange: [0, 100000],
      hasImages: false,
    });
  }, [onFiltersChange]);

  // Подсчет активных фильтров
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.selectedCategory) count++;
    if (filters.hideOutOfStock) count++;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 100000) count++;
    if (filters.hasImages) count++;
    return count;
  }, [filters]);

  const filtersContent = (
    <div className="space-y-4">
      {/* Заголовок с кнопкой сброса */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-200">
        <h3 className="text-base font-semibold text-gray-900 flex items-center">
          <FunnelIcon className="h-4 w-4 mr-2 text-gray-600" />
          Фильтры
          {activeFiltersCount > 0 && (
            <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </h3>
        {activeFiltersCount > 0 && (
          <button
            onClick={resetFilters}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
          >
            Сбросить
          </button>
        )}
      </div>

      {/* Сортировка */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-2">Сортировка</h4>
        <ProductSorter value={filters.sortOrder} onChange={handleSortChange} />
      </div>

      {/* Категории */}
      {categories.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">Категории</h4>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            <button
              onClick={() => handleCategoryChange('')}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all duration-200 ${
                !filters.selectedCategory
                  ? 'bg-blue-50 text-blue-700 font-medium border border-blue-200'
                  : 'text-gray-700 hover:bg-gray-50 border border-transparent'
              }`}
            >
              Все категории
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all duration-200 ${
                  filters.selectedCategory === category.id
                    ? 'bg-blue-50 text-blue-700 font-medium border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50 border border-transparent'
                }`}
              >
                {category.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Цена */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-2">Цена, ₽</h4>
        <PriceRangeSlider
          value={filters.priceRange}
          onChange={handlePriceRangeChange}
          min={0}
          max={100000}
          step={100}
        />
      </div>

      {/* Дополнительные фильтры */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-2">
          Дополнительно
        </h4>
        <div className="space-y-2">
          <StockFilter
            value={filters.hideOutOfStock}
            onChange={handleStockFilterChange}
          />

          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={filters.hasImages}
              onChange={(e) => handleImagesFilterChange(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
            />
            <span className="ml-2 text-sm text-gray-700">Только с фото</span>
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Десктопная версия */}
      <div className={`hidden lg:block ${className}`}>
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm max-h-[calc(100vh-200px)] overflow-y-auto">
          {filtersContent}
        </div>
      </div>

      {/* Мобильная версия */}
      {showMobileFilters && (
        <div className="lg:hidden fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={onCloseMobileFilters}
          />
          <div className="absolute right-0 top-0 h-full w-80 max-w-full bg-white shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Фильтры</h2>
              <button
                onClick={onCloseMobileFilters}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto h-full pb-20">
              {filtersContent}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
