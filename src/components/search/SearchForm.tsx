"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@apollo/client";
import { GET_PRODUCTS, GET_CATEGORIES_BY_QUERY } from "@/lib/queries";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Product, Category } from "@/types/api";
import Link from "next/link";
import Image from "next/image";

// Компонент для элемента товара в выпадающем списке результатов
const ProductResultItem = ({ product }: { product: Product }) => (
  <Link
    href={`/product/${product.slug}`}
    className="block px-4 py-3 hover:bg-gray-50 transition-colors duration-150 border-b border-gray-100 last:border-b-0"
  >
    <div className="flex items-center">
      {product.images && product.images[0] && (
        <div className="w-10 h-10 flex-shrink-0 mr-3 bg-gray-100 rounded overflow-hidden">
          <Image
            src={product.images[0].url}
            alt={product.name}
            width={40}
            height={40}
            className="object-cover w-full h-full"
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
    className="block px-4 py-3 hover:bg-gray-50 transition-colors duration-150 border-b border-gray-100 last:border-b-0"
  >
    <div className="flex items-center">
      {category.iconUrl && (
        <div className="w-8 h-8 flex-shrink-0 mr-3 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
          <Image
            src={category.iconUrl}
            alt={category.title}
            width={24}
            height={24}
            className="object-contain"
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

  // Запрос товаров для живого поиска
  const { data: productData, loading: productsLoading } = useQuery(
    GET_PRODUCTS,
    {
      variables: {
        first: 6,
        sortOrder: "NEWEST_FIRST",
        searchQuery,
      },
      skip: !searchQuery || searchQuery.length < 2,
    },
  );

  // Запрос категорий для живого поиска
  const { data: categoryData, loading: categoriesLoading } = useQuery(
    GET_CATEGORIES_BY_QUERY,
    {
      variables: {
        query: searchQuery,
      },
      skip: !searchQuery || searchQuery.length < 2,
    },
  );

  // Получаем результаты поиска товаров и удаляем дубликаты
  const searchProductResults = useMemo(() => {
    const products =
      productData?.products?.edges?.map(
        (edge: { node: Product }) => edge.node,
      ) || [];

    // Удаляем дубликаты товаров по ID
    const uniqueProducts: Product[] = [];
    const productIds = new Set();

    products.forEach((product: Product) => {
      if (!productIds.has(product.id)) {
        productIds.add(product.id);
        uniqueProducts.push(product);
      }
    });

    return uniqueProducts;
  }, [productData]);

  // Получаем результаты поиска категорий и удаляем дубликаты
  const searchCategoryResults = useMemo(() => {
    const categories = categoryData?.categoriesByQuery || [];

    // Удаляем дубликаты категорий по ID
    const uniqueCategories: Category[] = [];
    const categoryIds = new Set();

    categories.forEach((category: Category) => {
      if (!categoryIds.has(category.id)) {
        categoryIds.add(category.id);
        uniqueCategories.push(category);
      }
    });

    return uniqueCategories;
  }, [categoryData]);

  // Определяем есть ли результаты
  const hasResults =
    searchProductResults.length > 0 || searchCategoryResults.length > 0;
  const isLoading = productsLoading || categoriesLoading;

  // Обработчик изменения поля поиска
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchQuery(value);

      // Очищаем предыдущий таймаут
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }

      // Устанавливаем новый таймаут для задержки запроса
      searchTimeout.current = setTimeout(() => {
        if (value.length >= 2) {
          setIsResultsOpen(true);
        } else {
          setIsResultsOpen(false);
        }
      }, 250);
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
          className="w-full py-2.5 px-4 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={() => searchQuery.length >= 2 && setIsResultsOpen(true)}
        />
        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />

        {searchQuery && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
            aria-label="Clear search"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </form>

      {/* Выпадающий список результатов */}
      {isResultsOpen && (isLoading || hasResults) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[70vh] overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
              <p>Поиск...</p>
            </div>
          ) : !hasResults ? (
            <div className="p-4 text-center text-gray-500">
              <p>По запросу "{searchQuery}" ничего не найдено</p>
            </div>
          ) : (
            <>
              <div className="py-1 px-3 bg-gray-50 text-xs font-medium text-gray-700">
                Результаты поиска по "{searchQuery}"
              </div>

              {searchCategoryResults.length > 0 && (
                <div className="py-2">
                  <div className="px-4 py-1 text-xs text-gray-500 uppercase tracking-wider font-semibold bg-gray-50">
                    Категории ({searchCategoryResults.length})
                  </div>
                  {searchCategoryResults.map((category: Category) => (
                    <CategoryResultItem key={category.id} category={category} />
                  ))}
                </div>
              )}

              {searchProductResults.length > 0 && (
                <div className="py-2">
                  <div className="px-4 py-1 text-xs text-gray-500 uppercase tracking-wider font-semibold bg-gray-50">
                    Товары ({searchProductResults.length})
                  </div>
                  {searchProductResults.map((product: Product) => (
                    <ProductResultItem key={product.id} product={product} />
                  ))}
                </div>
              )}

              {hasResults && (
                <div className="border-t border-gray-200 p-3 bg-gray-50">
                  <Link
                    href={`/search?q=${encodeURIComponent(
                      searchQuery,
                    )}&sort=NEWEST_FIRST`}
                    className="w-full py-2 px-4 text-center block bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors duration-200"
                  >
                    Показать все результаты
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchForm;
