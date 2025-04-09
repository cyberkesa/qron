"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
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
} from "@heroicons/react/24/outline";
import { ProductSorter } from "@/components/product-list/ProductSorter";
import { StockFilter } from "@/components/product-list/StockFilter";
import { useInfiniteScroll } from "@/lib/hooks/useInfiniteScroll";

// Create a client component that uses useSearchParams
function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const searchQuery = searchParams?.get("q") ?? "";
  const initialSort =
    (searchParams?.get("sort") as ProductSortOrder) ?? "NEWEST_FIRST";

  const [sortOrder, setSortOrder] = useState<ProductSortOrder>(initialSort);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [searchInputValue, setSearchInputValue] = useState(searchQuery);
  const [hideOutOfStock, setHideOutOfStock] = useState(true);

  // Создаем ref для элемента-наблюдателя
  const observerTarget = useRef<HTMLDivElement>(null);

  // Запрос товаров с учетом фильтров с пагинацией
  const {
    data: productsData,
    loading: productsLoading,
    error: productsError,
    fetchMore,
  } = useQuery(GET_PRODUCTS, {
    variables: {
      first: 16, // Загружаем по 16 товаров за раз
      sortOrder,
      searchQuery,
    },
    skip: !searchQuery,
  });

  // Подготовка данных для использования в компоненте
  let products =
    productsData?.products?.edges?.map(
      (edge: { node: Product }) => edge.node,
    ) || [];
  const hasMoreProducts =
    productsData?.products?.pageInfo?.hasNextPage || false;
  const endCursor = productsData?.products?.pageInfo?.endCursor || null;
  const isDataLoading = productsLoading && !products.length;

  // Получаем общее количество товаров
  const totalProductsCount =
    productsData?.products?.totalCount || products.length;

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
            first: 16,
            sortOrder,
            searchQuery,
          },
        });
      }
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Поисковая строка */}
      <div className="mb-8">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={searchInputValue}
            onChange={(e) => setSearchInputValue(e.target.value)}
            placeholder="Поиск товаров..."
            className="w-full px-4 py-3 pl-12 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <MagnifyingGlassIcon className="h-6 w-6" />
          </button>
        </form>
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
          {/* Информация о результатах */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <p className="text-gray-600 mb-3 md:mb-0">
                Всего товаров:{" "}
                <span className="font-medium">{totalProductsCount}</span>
                {products.length < totalProductsCount &&
                  ` (загружено ${products.length})`}
              </p>

              {/* Мобильная сортировка видна только на мобильных */}
              <div className="md:hidden">
                <ProductSorter value={sortOrder} onChange={handleSortChange} />
              </div>
            </div>
          </div>

          {/* Сетка товаров */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product: Product, index: number) => (
              <ProductCard key={`${product.id}-${index}`} product={product} />
            ))}
          </div>

          {/* Индикатор загрузки и триггер для подгрузки */}
          {infiniteIsLoadingMore && (
            <div className="flex justify-center mt-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
          )}

          {/* Сообщение об окончании списка товаров */}
          {!hasMoreProducts && products.length >= 16 && (
            <div className="mt-8 text-center text-gray-500">
              Загружены все доступные товары ({products.length} из{" "}
              {totalProductsCount})
            </div>
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
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 rounded-full border-t-transparent"></div>
      </div>
    </div>
  );
}

// Main page component with Suspense
export default function SearchPage() {
  return (
    <Suspense fallback={<SearchLoading />}>
      <SearchPageContent />
    </Suspense>
  );
}
