"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@apollo/client";
import { GET_PRODUCTS, GET_CATEGORIES } from "@/lib/queries";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Product, Category } from "@/types/api";
import Link from "next/link";
import Image from "next/image";
import {
  normalizeSearchString,
  processSearchResults,
} from "@/components/search/SearchOptimization";

// Компонент для элемента товара в выпадающем списке результатов
const ProductResultItem = ({ product }: { product: Product }) => (
  <Link
    href={`/product/${product.slug}`}
    className="block px-4 py-3 hover:bg-gray-50 transition-colors duration-150 border-b border-gray-100 last:border-b-0 hover-bright"
  >
    <div className="flex items-center">
      {product.images && product.images[0] && (
        <div className="w-10 h-10 flex-shrink-0 mr-3 bg-gray-100 rounded overflow-hidden">
          <Image
            src={product.images[0].url}
            alt={product.name}
            width={40}
            height={40}
            className="object-cover w-full h-full transition-transform duration-300 hover:scale-110"
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-gray-900 text-sm truncate">
          {product.name}
        </div>
        <div className="text-blue-600 text-sm font-semibold">
          {product.price} ₽
        </div>
      </div>
    </div>
  </Link>
);

// Компонент для элемента категории в выпадающем списке результатов
const CategoryResultItem = ({ category }: { category: Category }) => (
  <Link
    href={`/categories/${category.slug}`}
    className="block px-4 py-3 hover:bg-gray-50 transition-colors duration-150 border-b border-gray-100 last:border-b-0 hover-bright"
  >
    <div className="flex items-center">
      {category.iconUrl && (
        <div className="w-8 h-8 flex-shrink-0 mr-3 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
          <Image
            src={category.iconUrl}
            alt={category.title}
            width={24}
            height={24}
            className="object-contain transition-transform duration-300 hover:scale-110"
          />
        </div>
      )}
      <div className="flex-1">
        <div className="font-medium text-gray-900 text-sm flex items-center">
          <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded mr-2">
            Категория
          </span>
          {category.title}
        </div>
      </div>
    </div>
  </Link>
);

// Основной компонент формы поиска
const SearchForm = ({ className = "" }: { className?: string }) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isResultsOpen, setIsResultsOpen] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout>();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Нормализация поискового запроса
  const normalizedQuery = useMemo(() => {
    return normalizeSearchString(searchQuery);
  }, [searchQuery]);

  // Запрос товаров для живого поиска с улучшенными параметрами
  const { data: productData, loading: productsLoading } = useQuery(
    GET_PRODUCTS,
    {
      variables: {
        first: 8, // Увеличиваем для более полных результатов
        sortOrder: "NEWEST_FIRST",
        searchQuery: normalizedQuery,
      },
      skip: !normalizedQuery || normalizedQuery.length < 2,
    },
  );

  // Запрос категорий и фильтрация их на клиенте
  const { data: categoryData, loading: categoriesLoading } = useQuery(
    GET_CATEGORIES,
    {
      skip: !normalizedQuery || normalizedQuery.length < 2,
    },
  );

  // Обработка результатов поиска товаров
  const searchProductResults = useMemo(() => {
    const products =
      productData?.products?.edges?.map(
        (edge: { node: Product }) => edge.node,
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
      normalizeSearchString(category.title).includes(normalizedQuery),
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

  // Определяем есть ли результаты
  const hasResults =
    searchProductResults.length > 0 || searchCategoryResults.length > 0;
  const isLoading = productsLoading || categoriesLoading;

  // Обработчик изменения поля поиска с дебаунсом
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchQuery(value);

      // Очищаем предыдущий таймаут
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }

      // Устанавливаем новый таймаут для задержки запроса - уменьшаем до 150мс для более быстрого отклика
      searchTimeout.current = setTimeout(() => {
        if (value.trim().length >= 2) {
          setIsResultsOpen(true);
        } else {
          setIsResultsOpen(false);
        }
      }, 150);
    },
    [],
  );

  // Очистка поискового запроса
  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setIsResultsOpen(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Обработчик отправки формы
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (searchQuery.trim()) {
        router.push(
          `/search?q=${encodeURIComponent(searchQuery)}&sort=NEWEST_FIRST`,
        );
        setIsResultsOpen(false);
      }
    },
    [searchQuery, router],
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

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={searchRef} className={`relative w-full ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder="Поиск товаров и категорий..."
          className="w-full py-2.5 px-4 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 form-input"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={() => searchQuery.length >= 2 && setIsResultsOpen(true)}
        />
        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />

        {searchQuery && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors hover-scale"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </form>

      {isResultsOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto border border-gray-200 animate-fade-in-down">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="inline-block w-5 h-5 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin mr-2"></div>
              Поиск...
            </div>
          ) : !hasResults && normalizedQuery.length >= 2 ? (
            <div className="p-4 text-center text-gray-500 animate-fade-in">
              По запросу «{searchQuery}» ничего не найдено
            </div>
          ) : (
            <>
              {searchCategoryResults.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase font-semibold">
                    Категории
                  </div>
                  {searchCategoryResults
                    .slice(0, 3)
                    .map((category: Category) => (
                      <div
                        key={category.id}
                        className="animate-fade-in-up"
                        style={{ animationDelay: "50ms" }}
                      >
                        <CategoryResultItem category={category} />
                      </div>
                    ))}
                </div>
              )}

              {searchProductResults.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase font-semibold">
                    Товары
                  </div>
                  {searchProductResults.map(
                    (product: Product, index: number) => (
                      <div
                        key={product.id}
                        className="animate-fade-in-up"
                        style={{ animationDelay: `${(index + 1) * 50}ms` }}
                      >
                        <ProductResultItem product={product} />
                      </div>
                    ),
                  )}
                </div>
              )}

              <div className="p-3 text-center border-t border-gray-100">
                <button
                  onClick={handleSubmit}
                  className="text-blue-600 text-sm font-medium hover:text-blue-800 hover-lift transition-colors w-full py-1.5 hover:bg-blue-50 rounded-md"
                >
                  Показать все результаты
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchForm;
