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
    <div className="container mx-auto px-3 md:px-4 py-6 mb-12 animate-fadeIn">
      <div className="mb-4">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="inline-flex items-center text-sm">
            <li className="inline-flex items-center">
              <Link
                href="/"
                className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
              >
                Главная
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRightIcon className="w-4 h-4 text-gray-400 mx-1" />
                <span className="text-gray-500">Каталог</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
          Каталог товаров
        </h1>
        <p className="text-gray-600 text-sm md:text-base">
          Все товары для строительства, ремонта и обустройства дома
        </p>
      </div>

      {isDataLoading && !productsData ? (
        <div className="animate-pulse">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="bg-gray-100 rounded-xl h-64 animate-pulse relative overflow-hidden shadow-sm"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skeleton-loading"></div>
              </div>
            ))}
          </div>
        </div>
      ) : hasError ? (
        <div className="bg-red-50 border border-red-100 rounded-xl p-6 text-center my-8 shadow-sm">
          <h2 className="text-lg font-medium text-red-800 mb-2">
            Произошла ошибка при загрузке данных
          </h2>
          <p className="text-red-600 mb-4 text-sm md:text-base">
            {errorMessage}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors active:scale-[0.98]"
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            Обновить страницу
          </button>
        </div>
      ) : products.length === 0 && !isDataLoading ? (
        <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-6 md:p-8 text-center my-8 shadow-sm">
          <h2 className="text-lg font-medium text-yellow-800 mb-3">
            Товары не найдены
          </h2>
          <p className="text-yellow-700 mb-4 text-sm md:text-base max-w-lg mx-auto">
            По вашему запросу не найдено товаров. Попробуйте изменить параметры
            фильтрации или выбрать другую категорию.
          </p>
          <button
            onClick={resetFilters}
            className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors active:scale-[0.98]"
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            Сбросить фильтры
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 md:gap-6">
          {showMobileFilters && (
            <div
              className="fixed inset-0 z-50 bg-black/60 lg:hidden animate-fadeIn"
              onClick={toggleMobileFilters}
            >
              <div
                className="absolute right-0 top-0 h-full w-[300px] max-w-[80vw] bg-white overflow-y-auto p-4 shadow-xl animate-fadeInRight"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-4 border-b pb-4">
                  <h3 className="font-semibold text-lg text-gray-800">
                    Фильтры
                  </h3>
                  <button
                    onClick={toggleMobileFilters}
                    className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors active:scale-95"
                    style={{ WebkitTapHighlightColor: "transparent" }}
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 transition-shadow duration-300 hover:shadow-md">
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

          <div className="space-y-4 md:space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 md:p-4 transition-shadow duration-300 hover:shadow-md">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 md:gap-4">
                <div className="text-sm text-gray-600 flex items-center">
                  <span className="bg-blue-50 text-blue-700 rounded-full px-3 py-1.5 font-medium">
                    Найдено товаров: {totalProductsCount}
                  </span>
                </div>

                <div className="flex gap-2 self-stretch sm:self-center w-full sm:w-auto">
                  <button
                    onClick={toggleMobileFilters}
                    className="lg:hidden flex items-center justify-center rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white hover:bg-gray-50 transition-colors w-1/2 sm:w-auto active:scale-[0.98]"
                    style={{ WebkitTapHighlightColor: "transparent" }}
                  >
                    <AdjustmentsHorizontalIcon className="h-5 w-5 mr-1.5 text-gray-600" />
                    Фильтры
                  </button>

                  <div className="relative w-1/2 sm:w-auto">
                    <select
                      value={sortOrder}
                      onChange={(e) =>
                        handleSortChange(e.target.value as ProductSortOrder)
                      }
                      className="block w-full rounded-lg border border-gray-200 py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      style={{ WebkitAppearance: "none" }}
                    >
                      <option value="NEWEST_FIRST">Новинки</option>
                      <option value="PRICE_LOW_TO_HIGH">Сначала дешевле</option>
                      <option value="PRICE_HIGH_TO_LOW">Сначала дороже</option>
                      <option value="NAME_A_TO_Z">По названию (А-Я)</option>
                      <option value="NAME_Z_TO_A">По названию (Я-А)</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <svg
                        className="h-4 w-4 text-gray-400"
                        fill="none"
                        viewBox="0 0 20 20"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M19 9l-7 7-7-7"
                        ></path>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
              {products.map((product: Product, index: number) => (
                <div
                  key={`catalog-${product.id}-${index}`}
                  className="animate-fadeIn"
                  style={{ animationDelay: `${(index % 8) * 50}ms` }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>

            {infiniteScrollIsLoadingMore && (
              <div className="flex justify-center py-6">
                <div className="flex items-center justify-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent" />
                  <span className="text-sm text-gray-600 font-medium">
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
