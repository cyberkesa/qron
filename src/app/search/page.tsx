'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { GET_PRODUCTS } from '@/lib/queries';
import { ProductCard } from '@/components/product/ProductCard';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  ProductSortOrder,
  Product,
  ProductStockAvailabilityStatus,
} from '@/types/api';
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { ProductSorter } from '@/components/product-list/ProductSorter';
import { StockFilter } from '@/components/product-list/StockFilter';
import { useInfiniteScroll } from '@/lib/hooks/useInfiniteScroll';
import {
  normalizeSearchString,
  processSearchResults,
} from '@/components/search/SearchOptimization';
import { SearchDebugger } from '@/components/search/SearchDebugger';
import { Suspense } from 'react';

// Create a client component that uses useSearchParams
function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const searchQuery = searchParams?.get('q') ?? '';
  const initialSort =
    (searchParams?.get('sort') as ProductSortOrder) || 'NEWEST_FIRST';

  const [sortOrder, setSortOrder] = useState<ProductSortOrder>(initialSort);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [searchInputValue, setSearchInputValue] = useState(searchQuery);
  const [hideOutOfStock, setHideOutOfStock] = useState(true);

  // Нормализация поискового запроса
  const normalizedQuery = useMemo(() => {
    return normalizeSearchString(searchQuery);
  }, [searchQuery]);

  // Запрос товаров с учетом фильтров с пагинацией
  const {
    data: productsData,
    loading: productsLoading,
    error: productsError,
    fetchMore,
  } = useQuery(GET_PRODUCTS, {
    variables: {
      first: 100, // Загружаем по 100 товаров за раз (максимальный лимит)
      sortOrder: sortOrder,
      searchQuery: searchQuery, // Отправляем оригинальный запрос на сервер
    },
    skip: !searchQuery,
  });

  // Обработка и фильтрация результатов
  const products = useMemo(() => {
    // Получаем необработанные данные о товарах
    const rawProducts =
      productsData?.products?.edges?.map(
        (edge: { node: Product; cursor: string }) => ({
          ...edge.node,
          cursor: edge.cursor,
        })
      ) || [];

    // Используем нашу утилиту для обработки результатов
    return processSearchResults(rawProducts, normalizedQuery, false);
  }, [productsData?.products?.edges, normalizedQuery]);

  // Фильтрация товаров, которых нет в наличии, если включен соответствующий фильтр
  const filteredProducts = useMemo(() => {
    if (hideOutOfStock) {
      return products.filter(
        (product: Product) =>
          product.stockAvailabilityStatus !==
          ProductStockAvailabilityStatus.OUT_OF_STOCK
      );
    }
    return products;
  }, [products, hideOutOfStock]);

  const hasMoreProducts =
    productsData?.products?.pageInfo?.hasNextPage || false;
  const endCursor = productsData?.products?.pageInfo?.endCursor || null;
  const isDataLoading = productsLoading && !products.length;

  // Получаем общее количество товаров
  const totalProductsCount = products.length;

  // Обновляем URL при изменении фильтров
  useEffect(() => {
    if (searchQuery) {
      const params = new URLSearchParams();
      params.set('q', searchQuery);
      params.set('sort', sortOrder);

      const newUrl = `/search?${params.toString()}`;
      window.history.replaceState({}, '', newUrl);
    }
  }, [sortOrder, searchQuery]);

  const handleSortChange = useCallback((newSortOrder: ProductSortOrder) => {
    setSortOrder(newSortOrder);
  }, []);

  const handleStockFilterChange = useCallback((newHideOutOfStock: boolean) => {
    setHideOutOfStock(newHideOutOfStock);
  }, []);

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (searchInputValue.trim()) {
        router.push(
          `/search?q=${encodeURIComponent(searchInputValue)}&sort=${sortOrder}`
        );
      }
    },
    [searchInputValue, sortOrder, router]
  );

  const toggleMobileFilters = useCallback(() => {
    setShowMobileFilters((prev) => !prev);
  }, []);

  const {
    observerTarget: infiniteObserverTarget,
    isLoadingMore: infiniteIsLoadingMore,
  } = useInfiniteScroll({
    hasMore: hasMoreProducts,
    isLoading: productsLoading,
    onLoadMore: async () => {
      if (productsData?.products?.pageInfo?.endCursor) {
        await fetchMore({
          variables: {
            after: productsData.products.pageInfo.endCursor,
            first: 100,
            sortOrder,
            searchQuery: searchQuery, // Отправляем оригинальный запрос на сервер
          },
        });
      }
    },
  });

  // Состояние без результатов поиска
  const noResults =
    !isDataLoading &&
    !productsError &&
    filteredProducts.length === 0 &&
    searchQuery;

  return (
    <>
      {/* Заголовок и поисковая строка */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Результаты поиска
        </h1>
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={searchInputValue}
            onChange={(e) => setSearchInputValue(e.target.value)}
            placeholder="Поиск товаров..."
            className="w-full px-4 py-3 pl-12 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <MagnifyingGlassIcon className="h-6 w-6" />
          </div>
          <button
            type="submit"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors duration-200"
          >
            Найти
          </button>
        </form>
      </div>

      {/* Top controls: Sorting and Stock Filter */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 md:gap-6">
        <div className="flex items-center gap-3">
          <ProductSorter value={sortOrder} onChange={handleSortChange} />
          <StockFilter
            value={hideOutOfStock}
            onChange={handleStockFilterChange}
          />
        </div>
        <div className="text-gray-600 text-sm">
          {searchQuery && (
            <span className="font-medium">
              По&nbsp;запросу &laquo;{searchQuery}&raquo;{' '}
            </span>
          )}
          найдено товаров:{' '}
          <span className="font-medium">{totalProductsCount}</span>
        </div>
      </div>

      {/* Debug component (only in development) */}
      {process.env.NODE_ENV === 'development' && searchQuery && (
        <SearchDebugger
          products={products}
          searchQuery={searchQuery}
          className="mb-6"
        />
      )}

      {/* Results grid */}
      {isDataLoading ? (
        <div className="w-full py-16">
          <div className="flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 text-lg">Загрузка результатов...</p>
          </div>
        </div>
      ) : noResults ? (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MagnifyingGlassIcon className="h-8 w-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            По&nbsp;запросу &laquo;{searchQuery}&raquo; ничего не&nbsp;найдено
          </h2>
          <p className="text-gray-600 mb-6">
            Попробуйте изменить поисковый запрос или параметры фильтрации
          </p>
          <button
            onClick={() => setSearchInputValue('')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Очистить поиск
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
            {filteredProducts.map(
              (product: Product & { cursor?: string }, index: number) => (
                <ProductCard
                  key={`search-${product.id}-${index}-${Math.random().toString(36).substring(2, 9)}`}
                  product={product}
                />
              )
            )}
          </div>

          {/* Индикатор загрузки и триггер для подгрузки */}
          {infiniteIsLoadingMore && (
            <div className="flex justify-center mt-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
          )}

          {/* Сообщение об окончании списка товаров */}
          {!hasMoreProducts && filteredProducts.length > 0 && (
            <div className="mt-8 text-center py-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-500">Загружены все доступные товары</p>
            </div>
          )}
        </>
      )}
      <div ref={infiniteObserverTarget} className="h-1" />
    </>
  );
}

// Load indicator for Suspense
function SearchLoading() {
  return (
    <>
      <div className="h-12 bg-gray-200 rounded-lg w-full mb-8 animate-pulse"></div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1">
          <div className="h-96 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>

        <div className="md:col-span-3">
          <div className="h-12 bg-gray-200 rounded-lg w-full mb-6 animate-pulse"></div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="h-48 sm:h-56 lg:h-64 bg-gray-200 rounded-lg relative overflow-hidden"
                >
                  <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-20 bg-gray-300 animate-pulse"></div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<SearchLoading />}>
        <SearchPageContent />
      </Suspense>
    </div>
  );
}
