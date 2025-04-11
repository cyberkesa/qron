"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useQuery } from "@apollo/client";
import {
  GET_PRODUCTS,
  GET_CATEGORIES,
  GET_CURRENT_REGION,
} from "@/lib/queries";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductFilters } from "@/components/product-list/ProductFilters";
import {
  ProductSortOrder,
  Product,
  ProductStockAvailabilityStatus,
} from "@/types/api";
import Link from "next/link";
import {
  AdjustmentsHorizontalIcon,
  ChevronRightIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useInfiniteScroll } from "@/lib/hooks/useInfiniteScroll";

export default function CatalogPage() {
  const [sortOrder, setSortOrder] = useState<ProductSortOrder>("NEWEST_FIRST");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [currentRegion, setCurrentRegion] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [hideOutOfStock, setHideOutOfStock] = useState(true);

  const { data: regionData, error: regionError } = useQuery(
    GET_CURRENT_REGION,
    {
      fetchPolicy: "cache-and-network",
      onError: (error) => {
        console.error("Ошибка при получении региона:", error);
      },
    },
  );

  const {
    data: productsData,
    loading: productsLoading,
    error: productsError,
    fetchMore,
  } = useQuery(GET_PRODUCTS, {
    variables: {
      first: 100,
      sortOrder,
      categoryId: selectedCategory || undefined,
    },
    skip: !currentRegion,
    fetchPolicy: "cache-and-network",
    onError: (error) => {
      console.error("Ошибка при получении товаров:", error);
    },
  });

  const {
    data: categoriesData,
    loading: categoriesLoading,
    error: categoriesError,
  } = useQuery(GET_CATEGORIES, {
    fetchPolicy: "cache-and-network",
    onError: (error) => {
      console.error("Ошибка при получении категорий:", error);
    },
  });

  useEffect(() => {
    if (regionData?.viewer?.region) {
      setCurrentRegion(regionData.viewer.region);

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(
            "selectedRegion",
            JSON.stringify(regionData.viewer.region),
          );
        } catch (error) {
          console.error("Ошибка при сохранении региона:", error);
        }
      }
    } else if (typeof window !== "undefined") {
      try {
        const savedRegion = localStorage.getItem("selectedRegion");
        if (savedRegion) {
          setCurrentRegion(JSON.parse(savedRegion));
        }
      } catch (e) {
        console.error("Ошибка при разборе сохраненного региона:", e);
        localStorage.removeItem("selectedRegion");
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
          (edge: { node: Product }) => edge.node,
        ) || [];

      return hideOutOfStock
        ? allProducts.filter(
            (product: Product) =>
              product.stockAvailabilityStatus ===
                ProductStockAvailabilityStatus.IN_STOCK ||
              product.stockAvailabilityStatus ===
                ProductStockAvailabilityStatus.IN_STOCK_SOON,
          )
        : allProducts;
    } catch (error) {
      console.error("Ошибка обработки данных товаров:", error);
      return [];
    }
  }, [productsData?.products?.edges, hideOutOfStock]);

  const categories = useMemo(
    () => categoriesData?.rootCategories || [],
    [categoriesData],
  );

  const totalProductsCount = useMemo(() => products.length, [products.length]);

  const isDataLoading = useMemo(
    () => productsLoading || categoriesLoading,
    [productsLoading, categoriesLoading],
  );

  const hasError = useMemo(
    () => productsError || categoriesError || regionError,
    [productsError, categoriesError, regionError],
  );

  const errorMessage = useMemo(
    () =>
      productsError?.message ||
      categoriesError?.message ||
      regionError?.message,
    [productsError, categoriesError, regionError],
  );

  const handleCategoryChange = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
  }, []);

  const toggleMobileFilters = useCallback(() => {
    setShowMobileFilters((prev) => !prev);
  }, []);

  const handleSortChange = useCallback((newSortOrder: ProductSortOrder) => {
    setSortOrder(newSortOrder);
  }, []);

  const handleStockFilterChange = useCallback((checked: boolean) => {
    setHideOutOfStock(checked);
  }, []);

  const resetFilters = useCallback(() => {
    setSelectedCategory("");
    setSortOrder("NEWEST_FIRST");
    setHideOutOfStock(false);
  }, []);

  const ProductGrid = ({ products }: { products: Product[] }) =>
    products.length > 0 ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {products.map((product, index) => (
          <ProductCard
            key={`catalog-${product.id}-${index}`}
            product={product}
          />
        ))}
      </div>
    ) : null;

  return (
    <div className="container mx-auto px-4 py-6 mb-12">
      <div className="mb-4">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-2 text-sm">
            <li className="inline-flex items-center">
              <Link href="/" className="text-gray-700 hover:text-blue-600">
                Главная
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRightIcon className="w-4 h-4 text-gray-500 mx-1" />
                <span className="text-gray-500">Каталог</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Каталог товаров
        </h1>
        <p className="text-gray-600 mt-1">
          Все товары для строительства, ремонта и обустройства дома
        </p>
      </div>

      {isDataLoading && !productsData ? (
        <div className="animate-pulse">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, index) => (
              <div
                key={index}
                className="bg-gray-200 h-72 rounded-lg animate-pulse relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skeleton-loading"></div>
              </div>
            ))}
          </div>
        </div>
      ) : hasError ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center my-8">
          <h2 className="text-lg font-medium text-red-800 mb-2">
            Произошла ошибка при загрузке данных
          </h2>
          <p className="text-red-600 mb-4">{errorMessage}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Обновить страницу
          </button>
        </div>
      ) : products.length === 0 && !isDataLoading ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center my-8">
          <h2 className="text-lg font-medium text-yellow-800 mb-3">
            Товары не найдены
          </h2>
          <p className="text-yellow-700 mb-4">
            По вашему запросу не найдено товаров. Попробуйте изменить параметры
            фильтрации или выбрать другую категорию.
          </p>
          <button
            onClick={resetFilters}
            className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Сбросить фильтры
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          {showMobileFilters && (
            <div
              className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
              onClick={toggleMobileFilters}
            >
              <div
                className="absolute right-0 top-0 h-full w-[320px] max-w-full bg-white overflow-y-auto p-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-4 border-b pb-4">
                  <h3 className="font-medium text-lg">Фильтры</h3>
                  <button
                    onClick={toggleMobileFilters}
                    className="text-gray-500 hover:text-gray-700 p-1 rounded-full bg-gray-100"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
                <ProductFilters
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onCategoryChange={handleCategoryChange}
                  sortOrder={sortOrder}
                  onSortChange={handleSortChange}
                  hideOutOfStock={hideOutOfStock}
                  onStockFilterChange={handleStockFilterChange}
                  showMobileFilters={showMobileFilters}
                  onCloseMobileFilters={toggleMobileFilters}
                />
              </div>
            </div>
          )}

          <div className="hidden lg:block sticky top-24 h-fit">
            <ProductFilters
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
              sortOrder={sortOrder}
              onSortChange={handleSortChange}
              hideOutOfStock={hideOutOfStock}
              onStockFilterChange={handleStockFilterChange}
              showMobileFilters={showMobileFilters}
              onCloseMobileFilters={toggleMobileFilters}
            />
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="text-sm text-gray-600 flex items-center">
                  <span className="bg-blue-50 text-blue-700 rounded-full px-3 py-1 font-medium">
                    Найдено товаров: {totalProductsCount}
                  </span>
                </div>

                <div className="flex gap-2 self-stretch sm:self-center">
                  <button
                    onClick={toggleMobileFilters}
                    className="lg:hidden flex items-center rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white hover:bg-gray-50"
                  >
                    <AdjustmentsHorizontalIcon className="h-5 w-5 mr-1 text-gray-600" />
                    Фильтры
                  </button>

                  <div className="relative sm:hidden">
                    <select
                      value={sortOrder}
                      onChange={(e) =>
                        handleSortChange(e.target.value as ProductSortOrder)
                      }
                      className="block w-full rounded-lg border border-gray-300 py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="NEWEST_FIRST">Сначала новые</option>
                      <option value="PRICE_LOW_TO_HIGH">Сначала дешевле</option>
                      <option value="PRICE_HIGH_TO_LOW">Сначала дороже</option>
                      <option value="NAME_A_TO_Z">По названию (А-Я)</option>
                      <option value="NAME_Z_TO_A">По названию (Я-А)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <ProductGrid products={products} />

            {infiniteScrollIsLoadingMore && (
              <div className="flex justify-center my-6">
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
                  <span className="text-sm text-gray-600">
                    Загрузка товаров...
                  </span>
                </div>
              </div>
            )}

            <div ref={infiniteScrollObserverTarget} className="h-1" />
          </div>
        </div>
      )}
    </div>
  );
}
