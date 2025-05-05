import { useEffect, useState } from 'react';
import { ProductSortOrder, Category } from '@/types/api';
import Image from 'next/image';
import { ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { ProductSorter } from './ProductSorter';
import { StockFilter } from '@/components/product-list/StockFilter';
import { FunnelIcon } from '@heroicons/react/24/outline';

interface ProductFiltersProps {
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
  hideOutOfStock: boolean;
  onStockFilterChange: (checked: boolean) => void;
  showMobileFilters?: boolean;
  onCloseMobileFilters?: () => void;
}

export function ProductFilters({
  categories,
  selectedCategory,
  onCategoryChange,
  hideOutOfStock,
  onStockFilterChange,
  showMobileFilters,
  onCloseMobileFilters,
}: ProductFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const resetFilters = () => {
    onCategoryChange('');
    onStockFilterChange(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
        <h3 className="font-medium text-gray-800">Фильтры</h3>
        <button
          onClick={resetFilters}
          className="text-sm text-blue-600 hover:text-blue-800 hover:underline active:text-blue-900 transition-colors"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          Сбросить
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <div
            className="flex justify-between items-center cursor-pointer user-select-none mb-2"
            onClick={() => setIsExpanded(!isExpanded)}
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <h4 className="font-medium text-gray-700">Категории</h4>
            <ChevronRightIcon
              className={cn(
                'h-5 w-5 text-gray-500 transition-transform',
                isExpanded ? 'rotate-90' : ''
              )}
            />
          </div>

          {isExpanded && (
            <div className="space-y-1 ml-1 animate-fadeIn">
              <div
                className={cn(
                  'flex items-center py-1.5 px-2 rounded-lg cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors',
                  !selectedCategory ? 'bg-blue-50 text-blue-700' : ''
                )}
                onClick={() => onCategoryChange('')}
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <span className="text-sm">Все категории</span>
              </div>

              {categories.map((category) => (
                <div
                  key={category.id}
                  className={cn(
                    'flex items-center py-1.5 px-2 rounded-lg cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors gap-2',
                    selectedCategory === category.id
                      ? 'bg-blue-50 text-blue-700'
                      : ''
                  )}
                  onClick={() => onCategoryChange(category.id)}
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  {category.iconUrl && (
                    <div className="relative w-6 h-6 rounded-md overflow-hidden">
                      <Image
                        src={category.iconUrl}
                        alt={category.title}
                        width={24}
                        height={24}
                        className="object-cover"
                      />
                    </div>
                  )}
                  <span className="text-sm">{category.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-gray-100">
          <label className="flex items-center space-x-2 cursor-pointer user-select-none">
            <input
              type="checkbox"
              checked={hideOutOfStock}
              onChange={(e) => onStockFilterChange(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
            />
            <span className="text-sm text-gray-700">
              Скрыть товары не в наличии
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
