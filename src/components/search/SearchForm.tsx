'use client';

import { useState, useEffect, useCallback, useMemo, useRef, memo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@apollo/client';
import { GET_PRODUCTS, GET_CATEGORIES } from '@/lib/queries';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Product, Category } from '@/types/api';
import Link from 'next/link';
import Image from 'next/image';
import {
  normalizeSearchString,
  processSearchResults,
} from '@/components/search/SearchOptimization';

// Компонент для элемента товара в выпадающем списке результатов
const ProductResultItem = memo(({ product }: { product: Product }) => (
  <Link
    href={`/product/${product.slug}`}
    className="
      flex items-center h-16 px-4 
      hover:bg-blue-50 transition-colors duration-200 
      border-b border-gray-50 last:border-b-0
      group search-result-item
    "
  >
    {product.images && product.images[0] && (
      <div className="w-12 h-12 flex-shrink-0 mr-4 bg-gray-100 rounded-lg overflow-hidden">
        <Image
          src={product.images[0].url}
          alt={product.name}
          width={48}
          height={48}
          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              '/images/product-placeholder.png';
          }}
        />
      </div>
    )}
    <div className="flex-1 min-w-0">
      <div className="font-medium text-gray-900 text-sm truncate group-hover:text-blue-600 transition-colors">
        {product.name}
      </div>
      <div className="text-blue-600 text-sm font-semibold mt-0.5">
        {product.price} ₽
      </div>
    </div>
  </Link>
));

ProductResultItem.displayName = 'ProductResultItem';

// Компонент для элемента категории в выпадающем списке результатов
const CategoryResultItem = memo(({ category }: { category: Category }) => (
  <Link
    href={`/categories/${category.slug}`}
    className="
      flex items-center h-14 px-4 
      hover:bg-blue-50 transition-colors duration-200 
      border-b border-gray-50 last:border-b-0
      group search-result-item
    "
  >
    {category.iconUrl && (
      <div className="w-10 h-10 flex-shrink-0 mr-4 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
        <Image
          src={category.iconUrl}
          alt={category.title}
          width={24}
          height={24}
          className="object-contain transition-transform duration-300 group-hover:scale-110"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              '/images/category-placeholder.png';
          }}
        />
      </div>
    )}
    <div className="flex-1 min-w-0">
      <div className="flex items-center">
        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full mr-3 font-medium">
          Категория
        </span>
        <span className="font-medium text-gray-900 text-sm group-hover:text-blue-600 transition-colors truncate">
          {category.title}
        </span>
      </div>
    </div>
  </Link>
));

CategoryResultItem.displayName = 'CategoryResultItem';

// Компонент для загрузки результатов в виртуализированном списке
const SearchResults = memo(
  ({
    searchQuery,
    searchProductResults,
    searchCategoryResults,
    isLoading,
    onSubmit,
  }: {
    searchQuery: string;
    searchProductResults: Product[];
    searchCategoryResults: Category[];
    isLoading: boolean;
    onSubmit: () => void;
  }) => {
    const normalizedQuery = normalizeSearchString(searchQuery);
    const hasResults =
      searchProductResults.length > 0 || searchCategoryResults.length > 0;

    const resultsContainerRef = useRef<HTMLDivElement>(null);

    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-20 text-gray-500">
          <div className="inline-block w-5 h-5 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin mr-3"></div>
          <span className="text-sm font-medium">Поиск...</span>
        </div>
      );
    }

    if (!hasResults && normalizedQuery.length >= 2) {
      return (
        <div className="flex flex-col items-center justify-center h-24 text-gray-500 animate-fade-in">
          <div className="text-sm font-medium mb-1">Ничего не найдено</div>
          <div className="text-xs">По запросу «{searchQuery}»</div>
        </div>
      );
    }

    return (
      <div
        ref={resultsContainerRef}
        className="max-h-96 overflow-y-auto custom-scrollbar"
      >
        {/* Категории */}
        {searchCategoryResults.length > 0 && (
          <div>
            <div className="h-10 px-4 flex items-center bg-gray-50/80 border-b border-gray-100">
              <span className="text-xs text-gray-600 uppercase font-semibold tracking-wide">
                Категории
              </span>
            </div>
            {searchCategoryResults
              .slice(0, 3)
              .map((category: Category, index) => (
                <div
                  key={category.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CategoryResultItem category={category} />
                </div>
              ))}
          </div>
        )}

        {/* Товары */}
        {searchProductResults.length > 0 && (
          <div>
            <div className="h-10 px-4 flex items-center bg-gray-50/80 border-b border-gray-100">
              <span className="text-xs text-gray-600 uppercase font-semibold tracking-wide">
                Товары
              </span>
            </div>
            {searchProductResults.map((product: Product, index: number) => (
              <div
                key={product.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${Math.min(index + 1, 10) * 50}ms` }}
              >
                <ProductResultItem product={product} />
              </div>
            ))}
          </div>
        )}

        {/* Кнопка "Показать все результаты" */}
        <div className="h-14 px-4 flex items-center justify-center border-t border-gray-100 bg-gray-50/50">
          <button
            onClick={onSubmit}
            className="
              flex items-center justify-center w-full h-10
              text-blue-600 text-sm font-medium 
              hover:text-blue-700 hover:bg-blue-50 
              rounded-lg transition-all duration-200
              active:scale-[0.98]
            "
          >
            Показать все результаты
          </button>
        </div>
      </div>
    );
  }
);

SearchResults.displayName = 'SearchResults';

// Custom hook для дебаунса поискового запроса
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Основной компонент формы поиска
const SearchForm = memo(({ className = '' }: { className?: string }) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isResultsOpen, setIsResultsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Используем debounced значение для поисковых запросов
  const debouncedSearchQuery = useDebounce(searchQuery, 200);

  // Нормализация поискового запроса
  const normalizedQuery = useMemo(() => {
    return normalizeSearchString(debouncedSearchQuery);
  }, [debouncedSearchQuery]);

  // Запрос товаров для живого поиска с улучшенными параметрами
  const { data: productData, loading: productsLoading } = useQuery(
    GET_PRODUCTS,
    {
      variables: {
        first: 8, // Увеличиваем для более полных результатов
        sortOrder: 'NEWEST_FIRST',
        searchQuery: normalizedQuery,
      },
      skip: !normalizedQuery || normalizedQuery.length < 2,
      // Добавляем политику кэширования для быстрых повторных запросов
      fetchPolicy: 'cache-first',
    }
  );

  // Запрос категорий и фильтрация их на клиенте
  const { data: categoryData, loading: categoriesLoading } = useQuery(
    GET_CATEGORIES,
    {
      skip: !normalizedQuery || normalizedQuery.length < 2,
      // Это данные, которые редко меняются
      fetchPolicy: 'cache-first',
    }
  );

  // Обработка результатов поиска товаров
  const searchProductResults = useMemo(() => {
    const products =
      productData?.products?.edges?.map(
        (edge: { node: Product }) => edge.node
      ) || [];

    // Используем нашу утилиту для обработки результатов
    return processSearchResults(products, normalizedQuery, false);
  }, [productData, normalizedQuery]);

  // Получаем и фильтруем результаты поиска категорий на стороне клиента
  const searchCategoryResults = useMemo(() => {
    const allCategories = categoryData?.rootCategories || [];

    if (!normalizedQuery || normalizedQuery.length < 2) {
      return [];
    }

    // Фильтруем категории по запросу локально
    const filteredCategories = allCategories.filter((category: Category) =>
      normalizeSearchString(category.title).includes(normalizedQuery)
    );

    // Удаляем дубликаты категорий по ID
    const uniqueCategories: Category[] = [];
    const categoryIds = new Set();

    filteredCategories.forEach((category: Category) => {
      if (!categoryIds.has(category.id)) {
        categoryIds.add(category.id);
        uniqueCategories.push(category);
      }
    });

    // Сортировка категорий по релевантности
    return uniqueCategories.sort((a: Category, b: Category) => {
      // Точное совпадение имеет высший приоритет
      const aTitle = normalizeSearchString(a.title);
      const bTitle = normalizeSearchString(b.title);

      // Если категория начинается с поискового запроса - более высокий приоритет
      const aStartsWith = aTitle.startsWith(normalizedQuery);
      const bStartsWith = bTitle.startsWith(normalizedQuery);

      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;

      // Затем проверяем включение
      const aIncludes = aTitle.includes(normalizedQuery);
      const bIncludes = bTitle.includes(normalizedQuery);

      if (aIncludes && !bIncludes) return -1;
      if (!aIncludes && bIncludes) return 1;

      return 0;
    });
  }, [categoryData, normalizedQuery]);

  // Определяем есть ли результаты для отображения дропдауна
  const shouldShowResults = useMemo(
    () => debouncedSearchQuery.length >= 2 && isResultsOpen,
    [debouncedSearchQuery, isResultsOpen]
  );

  const isLoading = productsLoading || categoriesLoading;

  // Обработчик изменения поля поиска
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchQuery(value);

      if (value.trim().length >= 2) {
        setIsResultsOpen(true);
      } else if (value.trim().length === 0) {
        setIsResultsOpen(false);
      }
    },
    []
  );

  // Очистка поискового запроса
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setIsResultsOpen(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Обработчик отправки формы
  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      if (searchQuery.trim()) {
        router.push(
          `/search?q=${encodeURIComponent(searchQuery)}&sort=NEWEST_FIRST`
        );
        setIsResultsOpen(false);
      }
    },
    [searchQuery, router]
  );

  // Закрываем результаты при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsResultsOpen(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsResultsOpen(false);
        if (inputRef.current) {
          inputRef.current.blur();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);

  return (
    <div ref={searchRef} className={`relative w-full ${className}`}>
      <form onSubmit={handleSubmit} className="relative search-form">
        <input
          ref={inputRef}
          type="text"
          placeholder="Поиск товаров и категорий..."
          className="
            w-full h-12 px-4 pl-12 pr-10
            bg-white border border-gray-300 rounded-xl
            text-gray-900 placeholder-gray-500
            focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
            transition-all duration-200 ease-out
            hover:border-gray-400 hover:shadow-sm
            text-sm font-medium
            shadow-sm
          "
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={() => searchQuery.length >= 2 && setIsResultsOpen(true)}
          aria-label="Поиск"
          autoComplete="off"
        />

        {/* Иконка поиска */}
        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none" />

        {/* Кнопка очистки */}
        {searchQuery && (
          <button
            type="button"
            onClick={clearSearch}
            className="
              absolute right-3 top-1/2 transform -translate-y-1/2 
              w-6 h-6 flex items-center justify-center
              text-gray-400 hover:text-gray-600 
              rounded-full hover:bg-gray-100
              transition-all duration-200 ease-out
              active:scale-95
            "
            aria-label="Очистить поиск"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        )}
      </form>

      {/* Выпадающий список результатов */}
      {shouldShowResults && (
        <div
          className="
          absolute top-full left-0 right-0 mt-2 
          bg-white rounded-xl shadow-xl border border-gray-200 
          z-50 overflow-hidden
          animate-fade-in-down
          max-w-full
          search-results-dropdown
        "
        >
          <SearchResults
            searchQuery={searchQuery}
            searchProductResults={searchProductResults}
            searchCategoryResults={searchCategoryResults}
            isLoading={isLoading}
            onSubmit={handleSubmit}
          />
        </div>
      )}
    </div>
  );
});

SearchForm.displayName = 'SearchForm';

export default SearchForm;
