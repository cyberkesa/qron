import { ProductSortOrder, Category } from '@/types/api';
import Image from 'next/image';
import { StockFilter } from '@/components/product-list/StockFilter';
import {
  XMarkIcon,
  FunnelIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';

interface ProductFiltersProps {
  categories: Category[];
  selectedCategory?: string;
  sortOrder: ProductSortOrder;
  hideOutOfStock: boolean;
  onCategoryChange: (category: string) => void;
  onSortChange: (sort: ProductSortOrder) => void;
  onStockFilterChange: (hideOutOfStock: boolean) => void;
  showMobileFilters?: boolean;
  onCloseMobileFilters?: () => void;
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
          ? 'active bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
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

export function ProductFilters({
  categories,
  selectedCategory,
  sortOrder,
  hideOutOfStock,
  onCategoryChange,
  onSortChange,
  onStockFilterChange,
  showMobileFilters,
  onCloseMobileFilters,
}: ProductFiltersProps) {
  const [isMobile, setIsMobile] = useState(false);

  const hasActiveFilters = selectedCategory !== '' || !hideOutOfStock;

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

  const resetFilters = () => {
    onCategoryChange('');
    onStockFilterChange(true);
  };

  // Мобильная версия
  if (isMobile) {
    return (
      <>
        {/* Backdrop */}
        {showMobileFilters && (
          <div
            className="fixed inset-0 bg-black/50 z-40 animate-fade-in mobile-filter-panel"
            onClick={onCloseMobileFilters}
          />
        )}

        {/* Mobile Panel */}
        <div
          className={`
          fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl transform transition-transform duration-300
          ${showMobileFilters ? 'translate-y-0' : 'translate-y-full'}
        `}
        >
          {/* Handle */}
          <div className="flex justify-center pt-4 pb-2">
            <div className="w-12 h-1 bg-gray-300 rounded-full" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <FunnelIcon className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Фильтры</h2>
            </div>
            <button
              onClick={onCloseMobileFilters}
              className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="px-4 py-4 max-h-[70vh] overflow-y-auto">
            <div className="space-y-6">
              {/* Категории */}
              <FilterSection title="Категория">
                <CategoryItem
                  category={null}
                  isSelected={!selectedCategory}
                  onClick={() => onCategoryChange('')}
                />
                {categories.map((category) => (
                  <CategoryItem
                    key={category.id}
                    category={category}
                    isSelected={selectedCategory === category.id}
                    onClick={() => onCategoryChange(category.id)}
                  />
                ))}
              </FilterSection>

              {/* Наличие */}
              <FilterSection title="Наличие">
                <StockFilter
                  value={hideOutOfStock}
                  onChange={onStockFilterChange}
                />
              </FilterSection>
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex gap-3">
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 rounded-xl border border-gray-300 transition-colors"
                >
                  Сбросить
                </button>
              )}
              <button
                onClick={onCloseMobileFilters}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-colors"
              >
                Применить
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Десктопная версия
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-2">
          <FunnelIcon className="w-5 h-5 text-blue-600" />
          <h2 className="font-semibold text-gray-900">Фильтры</h2>
        </div>
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-2 py-1 rounded-md transition-colors flex items-center gap-1"
          >
            <XMarkIcon className="w-3 h-3" />
            Сбросить
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Категории */}
        <FilterSection title="Категория" isCollapsible defaultExpanded>
          <div className="max-h-64 overflow-y-auto space-y-1 filter-scrollbar">
            <CategoryItem
              category={null}
              isSelected={!selectedCategory}
              onClick={() => onCategoryChange('')}
            />
            {categories.map((category) => (
              <CategoryItem
                key={category.id}
                category={category}
                isSelected={selectedCategory === category.id}
                onClick={() => onCategoryChange(category.id)}
              />
            ))}
          </div>
        </FilterSection>

        {/* Наличие */}
        <FilterSection title="Наличие">
          <StockFilter value={hideOutOfStock} onChange={onStockFilterChange} />
        </FilterSection>

        {/* Скрыть отсутствующие */}
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
          Скрыть отсутствующие товары поможет найти только доступные позиции
        </div>
      </div>
    </div>
  );
}
