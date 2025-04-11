"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery } from "@apollo/client";
import { GET_PRODUCTS } from "@/lib/queries";
import { ProductCard } from "@/components/product/ProductCard";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ProductSortOrder,
  Product,
  ProductStockAvailabilityStatus,
} from "@/types/api";
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import { ProductSorter } from "@/components/product-list/ProductSorter";
import { StockFilter } from "@/components/product-list/StockFilter";
import { useInfiniteScroll } from "@/lib/hooks/useInfiniteScroll";
import { Suspense } from "react";

// Create a client component that uses useSearchParams
function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const searchQuery = searchParams?.get("q") ?? "";
  const initialSort =
    (searchParams?.get("sort") as ProductSortOrder) || "NEWEST_FIRST";

  const [sortOrder, setSortOrder] = useState<ProductSortOrder>(initialSort);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [searchInputValue, setSearchInputValue] = useState(searchQuery);
  const [hideOutOfStock, setHideOutOfStock] = useState(true);

  // Запрос товаров с учетом фильтров с пагинацией
  const {
    data: productsData,
    loading: productsLoading,
    error: productsError,
    fetchMore,
  } = useQuery(GET_PRODUCTS, {
    variables: {
      first: 48, // Загружаем по 48 товаров за раз
      sortOrder: sortOrder,
      searchQuery,
    },
    skip: !searchQuery,
  });

  // Подготовка данных для использования в компоненте
  let products =
    productsData?.products?.edges?.map(
      (edge: { node: Product; cursor: string }) => ({
        ...edge.node,
        cursor: edge.cursor,
      }),
    ) || [];

  // Удаляем дубликаты по ID товара
  const uniqueProductIds = new Set();
  products = products.filter((product: Product) => {
    if (uniqueProductIds.has(product.id)) {
      return false;
    }
    uniqueProductIds.add(product.id);
    return true;
  });

  const hasMoreProducts =
    productsData?.products?.pageInfo?.hasNextPage || false;
  const endCursor = productsData?.products?.pageInfo?.endCursor || null;
  const isDataLoading = productsLoading && !products.length;

  // Получаем общее количество товаров
  const totalProductsCount = products.length;

  // Фильтрация товаров, которых нет в наличии, если включен соответствующий фильтр
  if (hideOutOfStock) {
    products = products.filter(
      (product: Product) =>
        product.stockAvailabilityStatus !==
        ProductStockAvailabilityStatus.OUT_OF_STOCK,
    );
  }

  // Обновляем URL при изменении фильтров
  useEffect(() => {
    if (searchQuery) {
      const params = new URLSearchParams();
      params.set("q", searchQuery);
      params.set("sort", sortOrder);

      const newUrl = `/search?${params.toString()}`;
      window.history.replaceState({}, "", newUrl);
    }
  }, [sortOrder, searchQuery]);

  const handleSortChange = (newSortOrder: ProductSortOrder) => {
    setSortOrder(newSortOrder);
  };

  const handleStockFilterChange = (newHideOutOfStock: boolean) => {
    setHideOutOfStock(newHideOutOfStock);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInputValue.trim()) {
      router.push(
        `/search?q=${encodeURIComponent(searchInputValue)}&sort=${sortOrder}`,
      );
    }
  };

  const toggleMobileFilters = () => {
    setShowMobileFilters(!showMobileFilters);
  };

  const {
    observerTarget: infiniteObserverTarget,
    isLoadingMore: infiniteIsLoadingMore,
  } = useInfiniteScroll({
    hasMore: productsData?.products?.pageInfo?.hasNextPage || false,
    isLoading: productsLoading,
    onLoadMore: async () => {
      if (productsData?.products?.pageInfo?.endCursor) {
        await fetchMore({
          variables: {
            after: productsData.products.pageInfo.endCursor,
            first: 48,
            sortOrder,
            searchQuery,
          },
        });
      }
    },
  });

  // Состояние без результатов поиска
  const noResults =
    !isDataLoading && !productsError && products.length === 0 && searchQuery;

  return (
    <div className="container mx-auto px-4 py-8">
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

      {/* Мобильный переключатель фильтров */}
      <div className="md:hidden mb-4">
        <button
          onClick={toggleMobileFilters}
          className="flex items-center justify-center w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium transition-colors duration-200"
        >
          <FunnelIcon className="h-5 w-5 mr-2" />
          {showMobileFilters ? "Скрыть фильтры" : "Показать фильтры"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Боковая панель с фильтрами */}
        <div
          className={`md:col-span-1 ${
            showMobileFilters ? "block" : "hidden md:block"
          }`}
        >
          <div className="sticky top-4 space-y-6">
            {/* Блок фильтров */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Заголовок фильтров */}
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <h2 className="font-medium text-gray-800">Фильтры поиска</h2>
              </div>

              {/* Фильтр сортировки */}
              <div className="p-4">
                <h3 className="font-medium text-gray-700 mb-3">Сортировка</h3>
                <ProductSorter
                  value={sortOrder}
                  onChange={handleSortChange}
                  className="flex-col items-start"
                />
              </div>

              {/* Фильтр наличия */}
              <div className="p-4 border-t border-gray-200">
                <h3 className="font-medium text-gray-700 mb-3">Наличие</h3>
                <StockFilter
                  value={hideOutOfStock}
                  onChange={handleStockFilterChange}
                  className="flex-col items-start"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Результаты поиска */}
        <div className="md:col-span-3">
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
                По запросу &quot;{searchQuery}&quot; ничего не найдено
              </h2>
              <p className="text-gray-600 mb-6">
                Попробуйте изменить поисковый запрос или параметры фильтрации
              </p>
              <button
                onClick={() => setSearchInputValue("")}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Очистить поиск
              </button>
            </div>
          ) : (
            <>
              {/* Информация о результатах */}
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <p className="text-gray-600 mb-3 md:mb-0">
                    {searchQuery && (
                      <span className="font-medium">
                        По запросу &quot;{searchQuery}&quot;{" "}
                      </span>
                    )}
                    найдено товаров:{" "}
                    <span className="font-medium">{totalProductsCount}</span>
                  </p>

                  {/* Мобильная сортировка видна только на мобильных */}
                  <div className="md:hidden">
                    <ProductSorter
                      value={sortOrder}
                      onChange={handleSortChange}
                    />
                  </div>
                </div>
              </div>

              {/* Сетка товаров */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(
                  (product: Product & { cursor?: string }, index: number) => (
                    <ProductCard
                      key={`search-${product.id}-${index}-${Math.random().toString(36).substring(2, 9)}`}
                      product={product}
                    />
                  ),
                )}
              </div>

              {/* Индикатор загрузки и триггер для подгрузки */}
              {infiniteIsLoadingMore && (
                <div className="flex justify-center mt-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
                </div>
              )}

              {/* Сообщение об окончании списка товаров */}
              {!hasMoreProducts && products.length > 0 && (
                <div className="mt-8 text-center py-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-500">
                    Загружены все доступные товары
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <div ref={infiniteObserverTarget} className="h-1" />
    </div>
  );
}

// Load indicator for Suspense
function SearchLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="h-12 bg-gray-200 rounded-lg w-full mb-8 animate-pulse"></div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1">
          <div className="h-96 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>

        <div className="md:col-span-3">
          <div className="h-12 bg-gray-200 rounded-lg w-full mb-6 animate-pulse"></div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="h-64 bg-gray-200 rounded-lg relative overflow-hidden"
                >
                  <div className="absolute bottom-0 left-0 right-0 h-20 bg-gray-300 animate-pulse"></div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
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
