'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import {
  GET_PRODUCTS,
  GET_CATEGORIES,
  GET_CURRENT_REGION,
} from '@/lib/queries';
import { ProductCard } from '@/components/product/ProductCard';
import {
  ProductFilters,
  ProductFiltersState,
} from '@/components/product-list/ProductFilters';
import { ProductSorter } from '@/components/product-list/ProductSorter';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import {
  ProductSortOrder,
  Product,
  ProductStockAvailabilityStatus,
} from '@/types/api';
import {
  AdjustmentsHorizontalIcon,
  XMarkIcon,
  Squares2X2Icon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { useInfiniteScroll } from '@/lib/hooks/useInfiniteScroll';

export default function CatalogPage() {
  // Объединяем все состояния фильтров в один объект
  const [filters, setFilters] = useState<ProductFiltersState>({
    selectedCategory: '',
    sortOrder: 'NEWEST_FIRST' as ProductSortOrder,
    hideOutOfStock: true,
    priceRange: [0, 100000] as [number, number],
    hasImages: false,
  });

  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [currentRegion, setCurrentRegion] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const { data: regionData, error: regionError } = useQuery(
    GET_CURRENT_REGION,
    {
      fetchPolicy: 'cache-and-network',
      onError: (error) => {
        console.error('Ошибка при получении региона:', error);
      },
    }
  );

  const {
    data: productsData,
    loading: productsLoading,
    error: productsError,
    fetchMore,
  } = useQuery(GET_PRODUCTS, {
    variables: {
      first: 100,
      sortOrder: filters.sortOrder,
      categoryId: filters.selectedCategory || undefined,
    },
    skip: !currentRegion,
    fetchPolicy: 'cache-and-network',
    onError: (error) => {
      console.error('Ошибка при получении товаров:', error);
    },
  });

  const {
    data: categoriesData,
    loading: categoriesLoading,
    error: categoriesError,
  } = useQuery(GET_CATEGORIES, {
    fetchPolicy: 'cache-and-network',
    onError: (error) => {
      console.error('Ошибка при получении категорий:', error);
    },
  });

  useEffect(() => {
    if (regionData?.viewer?.region) {
      setCurrentRegion(regionData.viewer.region);

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(
            'selectedRegion',
            JSON.stringify(regionData.viewer.region)
          );
        } catch (error) {
          console.error('Ошибка при сохранении региона:', error);
        }
      }
    } else if (typeof window !== 'undefined') {
      try {
        const savedRegion = localStorage.getItem('selectedRegion');
        if (savedRegion) {
          setCurrentRegion(JSON.parse(savedRegion));
        }
      } catch (e) {
        console.error('Ошибка при разборе сохраненного региона:', e);
        localStorage.removeItem('selectedRegion');
      }
    }
  }, [regionData]);

  const {
    observerTarget: infiniteScrollObserverTarget,
    isLoadingMore: infiniteScrollIsLoadingMore,
  } = useInfiniteScroll({
    hasMore: productsData?.products?.pageInfo?.hasNextPage || false,
    isLoading: productsLoading,
    onLoadMore: async () => {
      if (productsData?.products?.pageInfo?.endCursor) {
        await fetchMore({
          variables: {
            after: productsData.products.pageInfo.endCursor,
            first: 100,
          },
        });
      }
    },
  });

  const products = useMemo(() => {
    try {
      const allProducts =
        productsData?.products?.edges?.map(
          (edge: { node: Product }) => edge.node
        ) || [];

      let filteredProducts = allProducts;

      // Фильтрация по наличию
      if (filters.hideOutOfStock) {
        filteredProducts = filteredProducts.filter(
          (product: Product) =>
            product.stockAvailabilityStatus ===
              ProductStockAvailabilityStatus.IN_STOCK ||
            product.stockAvailabilityStatus ===
              ProductStockAvailabilityStatus.IN_STOCK_SOON
        );
      }

      // Фильтрация по цене
      if (filters.priceRange[0] > 0 || filters.priceRange[1] < 100000) {
        filteredProducts = filteredProducts.filter((product: Product) => {
          const price = product.price || 0;
          return (
            price >= filters.priceRange[0] && price <= filters.priceRange[1]
          );
        });
      }

      // Фильтрация по наличию изображений
      if (filters.hasImages) {
        filteredProducts = filteredProducts.filter((product: Product) => {
          return product.images && product.images.length > 0;
        });
      }

      return filteredProducts;
    } catch (error) {
      console.error('Ошибка обработки данных товаров:', error);
      return [];
    }
  }, [productsData?.products?.edges, filters]);

  const categories = useMemo(
    () => categoriesData?.rootCategories || [],
    [categoriesData]
  );

  const totalProductsCount = useMemo(() => products.length, [products.length]);

  const isDataLoading = useMemo(
    () => productsLoading || categoriesLoading,
    [productsLoading, categoriesLoading]
  );

  const hasError = useMemo(
    () => productsError || categoriesError || regionError,
    [productsError, categoriesError, regionError]
  );

  const errorMessage = useMemo(
    () =>
      productsError?.message ||
      categoriesError?.message ||
      regionError?.message,
    [productsError, categoriesError, regionError]
  );

  // Обработчик изменения фильтров
  const handleFiltersChange = useCallback(
    (newFilters: Partial<ProductFiltersState>) => {
      setFilters((prev) => ({ ...prev, ...newFilters }));
    },
    []
  );

  const toggleMobileFilters = useCallback(() => {
    setShowMobileFilters((prev) => !prev);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      selectedCategory: '',
      sortOrder: 'NEWEST_FIRST' as ProductSortOrder,
      hideOutOfStock: false,
      priceRange: [0, 100000] as [number, number],
      hasImages: false,
    });
  }, []);

  const ProductGrid = ({ products }: { products: Product[] }) =>
    products.length > 0 ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    ) : null;

  // Breadcrumbs для каталога
  const breadcrumbItems = [
    { title: 'Главная', href: '/' },
    { title: 'Каталог', href: '/catalog', isLast: true },
  ];

  return (
    <>
      {/* Хлебные крошки */}
      <Breadcrumbs items={breadcrumbItems} className="mb-6" />

      {/* Заголовок */}
      <header className="mb-8">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
            <Squares2X2Icon className="h-6 w-6 text-gray-600" />
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            Каталог товаров
          </h1>
        </div>
        <p className="text-gray-600">
          Все товары для строительства, ремонта и обустройства дома
        </p>
      </header>

      {/* Состояния загрузки и ошибок */}
      {isDataLoading && !productsData ? (
        <div className="space-y-6">
          <div className="bg-white rounded-lg p-4 animate-pulse">
            <div className="flex justify-between items-center">
              <div className="h-6 bg-gray-200 rounded w-32"></div>
              <div className="flex gap-2">
                <div className="h-10 bg-gray-200 rounded w-20"></div>
                <div className="h-10 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
            {Array.from({ length: 10 }).map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-lg h-48 sm:h-56 lg:h-64 animate-pulse"
              ></div>
            ))}
          </div>
        </div>
      ) : hasError ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XMarkIcon className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-lg font-semibold text-red-800 mb-2">
            Произошла ошибка при загрузке данных
          </h2>
          <p className="text-red-600 mb-4">{errorMessage}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Обновить страницу
          </button>
        </div>
      ) : products.length === 0 && !isDataLoading ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FunnelIcon className="h-8 w-8 text-yellow-600" />
          </div>
          <h2 className="text-lg font-semibold text-yellow-800 mb-3">
            Товары не найдены
          </h2>
          <p className="text-yellow-700 mb-6">
            По вашему запросу не найдено товаров. Попробуйте изменить параметры
            фильтрации или выбрать другую категорию.
          </p>
          <button
            onClick={resetFilters}
            className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Сбросить фильтры
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-4">
          {/* Мобильные фильтры */}
          {showMobileFilters && (
            <div
              className="fixed inset-0 z-50 bg-black/60 lg:hidden touch-none"
              onClick={toggleMobileFilters}
            >
              <div
                className="absolute right-0 top-0 h-full w-[85vw] sm:w-[420px] bg-white overflow-y-auto pb-safe"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="sticky top-0 bg-white border-b border-gray-200 p-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-lg text-gray-900">
                      Фильтры
                    </h3>
                    <button
                      onClick={toggleMobileFilters}
                      className="text-gray-500 hover:text-gray-700 p-2"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <ProductFilters
                    categories={categories}
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                    showMobileFilters={showMobileFilters}
                    onCloseMobileFilters={toggleMobileFilters}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Десктопные фильтры */}
          <div className="hidden lg:block">
            <div className="sticky top-header md:top-20 lg:top-24">
              <ProductFilters
                categories={categories}
                filters={filters}
                onFiltersChange={handleFiltersChange}
                showMobileFilters={showMobileFilters}
                onCloseMobileFilters={toggleMobileFilters}
              />
            </div>
          </div>

          {/* Товары */}
          <div className="space-y-6">
            {/* Панель управления */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <span className="bg-gray-50 text-gray-700 rounded-full px-4 py-2 text-sm font-medium">
                  Найдено товаров: {totalProductsCount}
                </span>
                <div className="flex gap-3 w-full sm:w-auto">
                  <button
                    onClick={toggleMobileFilters}
                    className="lg:hidden flex items-center justify-center rounded-lg border border-gray-200 px-4 py-2 text-sm bg-white hover:bg-gray-50 transition-colors flex-1 sm:flex-initial max-w-[160px]"
                  >
                    <AdjustmentsHorizontalIcon className="h-4 w-4 mr-2 text-gray-600" />
                    <span className="xs:hidden">Фильтры</span>
                    <span className="hidden xs:inline">Фильтры</span>
                  </button>
                  <div className="flex-1 min-w-0">
                    <ProductSorter
                      value={filters.sortOrder}
                      onChange={(newSortOrder) =>
                        handleFiltersChange({ sortOrder: newSortOrder })
                      }
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Сетка товаров */}
            <ProductGrid products={products} />

            {/* Загрузка дополнительных товаров */}
            {infiniteScrollIsLoadingMore && (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-600"></div>
              </div>
            )}

            {/* Кнопка "Загрузить еще" */}
            {productsData?.products?.pageInfo?.hasNextPage &&
              !infiniteScrollIsLoadingMore && (
                <div className="flex justify-center py-6">
                  <button
                    onClick={() => {
                      if (productsData.products.pageInfo.endCursor) {
                        fetchMore({
                          variables: {
                            after: productsData.products.pageInfo.endCursor,
                            first: 100,
                          },
                        });
                      }
                    }}
                    className="bg-gray-900 text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Загрузить еще товары
                  </button>
                </div>
              )}

            <div ref={infiniteScrollObserverTarget} className="h-1" />
          </div>
        </div>
      )}
    </>
  );
}
