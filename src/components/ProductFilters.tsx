import { ProductSortOrder, Category } from "@/types/api";
import Image from "next/image";
import { ProductSorter } from "@/components/ProductSorter";
import { StockFilter } from "@/components/StockFilter";
import { XMarkIcon, FunnelIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

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
  const [isExpanded, setIsExpanded] = useState(true);
  const hasActiveFilters =
    selectedCategory !== "" || sortOrder !== "NEWEST_FIRST" || !hideOutOfStock;

  const resetFilters = () => {
    onCategoryChange("");
    onSortChange("NEWEST_FIRST");
    onStockFilterChange(true);
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-white rounded-lg shadow-md border border-gray-100 transition-all duration-300">
      {/* Заголовок с кнопкой сворачивания/разворачивания */}
      <div className="flex items-center justify-between border-b pb-3">
        <div className="flex items-center gap-2">
          <FunnelIcon className="h-5 w-5 text-blue-600" />
          <h2 className="font-medium text-gray-800">Фильтры</h2>
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors p-1 px-2 rounded-md flex items-center"
            >
              <XMarkIcon className="h-3 w-3 mr-1" />
              Сбросить
            </button>
          )}
          {showMobileFilters && onCloseMobileFilters && (
            <button
              onClick={onCloseMobileFilters}
              className="md:hidden text-gray-500 hover:text-gray-700 p-1"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-500 hover:text-gray-700 p-1"
          >
            <svg
              className={`h-5 w-5 transition-transform duration-300 ${
                isExpanded ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Содержимое фильтров */}
      <div
        className={`transition-all duration-300 overflow-hidden ${
          isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Категория
            </label>

            {/* Отображение категорий с изображениями */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
              <div
                className={`p-2 rounded cursor-pointer flex items-center ${
                  !selectedCategory
                    ? "bg-blue-50 text-blue-600 border border-blue-100"
                    : "hover:bg-gray-50 border border-transparent hover:border-gray-100"
                } transition-all duration-200`}
                onClick={() => onCategoryChange("")}
              >
                <span className="ml-2">Все категории</span>
              </div>

              {categories.map((category) => (
                <div
                  key={category.id}
                  className={`p-2 rounded cursor-pointer flex items-center ${
                    selectedCategory === category.id
                      ? "bg-blue-50 text-blue-600 border border-blue-100"
                      : "hover:bg-gray-50 border border-transparent hover:border-gray-100"
                  } transition-all duration-200`}
                  onClick={() => onCategoryChange(category.id)}
                >
                  {category.iconUrl && (
                    <div className="w-6 h-6 mr-2 flex-shrink-0">
                      <Image
                        src={category.iconUrl}
                        alt={category.title}
                        width={24}
                        height={24}
                        className="object-contain"
                      />
                    </div>
                  )}
                  <span className="ml-2">{category.title}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Сортировка
              </label>
              <ProductSorter
                value={sortOrder}
                onChange={onSortChange}
                className="flex-col items-start"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Наличие
              </label>
              <StockFilter
                value={hideOutOfStock}
                onChange={onStockFilterChange}
                className="flex-col items-start"
              />
            </div>
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="w-full mt-4 bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium py-2 rounded-lg flex items-center justify-center transition-colors"
            >
              <XMarkIcon className="h-4 w-4 mr-2" />
              Сбросить все фильтры
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
