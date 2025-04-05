import { ProductSortOrder, Category } from "@/types/api";
import Image from "next/image";
import { ProductSorter } from "@/components/ProductSorter";

interface ProductFiltersProps {
  categories: Category[];
  selectedCategory?: string;
  sortOrder: ProductSortOrder;
  onCategoryChange: (category: string) => void;
  onSortChange: (sort: ProductSortOrder) => void;
}

export function ProductFilters({
  categories,
  selectedCategory,
  sortOrder,
  onCategoryChange,
  onSortChange,
}: ProductFiltersProps) {
  return (
    <div className="flex flex-col gap-4 p-4 bg-white rounded-lg shadow-md">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Категория
        </label>
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="">Все категории</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.title}
            </option>
          ))}
        </select>

        {/* Отображение категорий с изображениями */}
        <div className="mt-4 space-y-2">
          <div
            className={`p-2 rounded cursor-pointer flex items-center ${
              !selectedCategory
                ? "bg-blue-50 text-blue-600"
                : "hover:bg-gray-50"
            }`}
            onClick={() => onCategoryChange("")}
          >
            <span className="ml-2">Все категории</span>
          </div>

          {categories.map((category) => (
            <div
              key={category.id}
              className={`p-2 rounded cursor-pointer flex items-center ${
                selectedCategory === category.id
                  ? "bg-blue-50 text-blue-600"
                  : "hover:bg-gray-50"
              }`}
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
    </div>
  );
}
