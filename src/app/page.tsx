"use client";

import { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";
import { useQuery } from "@apollo/client";
import {
  GET_PRODUCTS,
  GET_CATEGORIES,
  GET_VIEWER,
  GET_BEST_DEAL_PRODUCTS,
  GET_CURRENT_REGION,
} from "@/lib/queries";
import { ProductCard } from "@/components/ProductCard";
import { ProductFilters } from "@/components/ProductFilters";
import {
  ProductSortOrder,
  Product,
  ProductStockAvailabilityStatus,
  Category,
} from "@/types/api";
import Link from "next/link";
import {
  ShoppingCartIcon,
  UserIcon,
  FireIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";

import { ProductCarousel } from "@/components/ProductCarousel";
import Image from "next/image";

// Мемоизированный компонент для списка товаров
const ProductGrid = memo(({ products }: { products: Product[] }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map((product, index) => (
        <ProductCard key={`grid-${product.id}-${index}`} product={product} />
      ))}
    </div>
  );
});

ProductGrid.displayName = "ProductGrid";

// Мемоизированный компонент для лучших предложений
const BestDeals = memo(({ products }: { products: Product[] }) => {
  if (!products.length) return null;

  return (
    <div className="mb-12">
      <div className="flex items-center mb-6">
        <FireIcon className="h-6 w-6 text-red-600 mr-2" />
        <h2 className="text-2xl font-bold text-gray-900">Лучшие предложения</h2>
      </div>
      <ProductCarousel products={products} />
    </div>
  );
});

BestDeals.displayName = "BestDeals";

// Мемоизированный компонент для баннера
const Banner = memo(() => {
  return (
    <div className="mb-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-md flex flex-col">
          <div className="text-2xl font-bold mb-2">Бесплатная доставка</div>
          <p className="text-blue-100 text-sm mb-auto">
            При заказе от 5000 рублей доставим бесплатно в любую точку региона
          </p>
          <Link
            href="/delivery"
            className="mt-4 text-white bg-blue-600/30 hover:bg-blue-600/50 px-4 py-2 rounded-lg text-sm inline-block w-fit transition-colors"
          >
            Подробнее
          </Link>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-md flex flex-col">
          <div className="text-2xl font-bold mb-2">Скидка 10%</div>
          <p className="text-green-100 text-sm mb-auto">
            На все строительные материалы до конца месяца
          </p>
          <Link
            href="/special-offers"
            className="mt-4 text-white bg-green-600/30 hover:bg-green-600/50 px-4 py-2 rounded-lg text-sm inline-block w-fit transition-colors"
          >
            Все акции
          </Link>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-6 text-white shadow-md flex flex-col">
          <div className="text-2xl font-bold mb-2">Более 1000+</div>
          <p className="text-amber-100 text-sm mb-auto">
            Товаров для строительства и ремонта с возможностью быстрой доставки
          </p>
          <Link
            href="/about"
            className="mt-4 text-white bg-amber-600/30 hover:bg-amber-600/50 px-4 py-2 rounded-lg text-sm inline-block w-fit transition-colors"
          >
            О компании
          </Link>
        </div>
      </div>
    </div>
  );
});

Banner.displayName = "Banner";

export default function Home() {
  // Состояния компонента
  const [sortOrder, setSortOrder] = useState<ProductSortOrder>("NEWEST_FIRST");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isAuth, setIsAuth] = useState<boolean>(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [currentRegion, setCurrentRegion] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [hideOutOfStock, setHideOutOfStock] = useState(true);

  // Ref для бесконечной прокрутки
  const observerTarget = useRef<HTMLDivElement>(null);

  // Получение текущего региона
  const { data: regionData } = useQuery(GET_CURRENT_REGION);

  // Запрос товаров с использованием выбранных фильтров
  const {
    data: productsData,
    loading: productsLoading,
    error: productsError,
    fetchMore,
  } = useQuery(GET_PRODUCTS, {
    variables: {
      first: 16, // Загружаем по 16 товаров за раз
      sortOrder,
      categoryId: selectedCategory || undefined,
    },
    skip: !currentRegion,
  });

  // Запрос категорий для фильтров
  const {
    data: categoriesData,
    loading: categoriesLoading,
    error: categoriesError,
  } = useQuery(GET_CATEGORIES);

  // Запрос лучших предложений
  const {
    data: bestDealsData,
    loading: bestDealsLoading,
    error: bestDealsError,
  } = useQuery(GET_BEST_DEAL_PRODUCTS, {
    skip: !currentRegion,
  });

  // Запрос данных пользователя
  const { data: userData } = useQuery(GET_VIEWER);

  // Подготовка данных для использования в компоненте - мемоизируем эти вычисления
  const user = useMemo(() => userData?.viewer, [userData]);

  // Мемоизируем обработанные товары
  const products = useMemo(() => {
    const allProducts =
      productsData?.products.edges.map(
        (edge: { node: Product }) => edge.node
      ) || [];

    // Фильтрация товаров, которых нет в наличии, если включен соответствующий фильтр
    if (hideOutOfStock) {
      return allProducts.filter(
        (product: Product) =>
          product.stockAvailabilityStatus !==
          ProductStockAvailabilityStatus.OUT_OF_STOCK
      );
    }

    return allProducts;
  }, [productsData?.products.edges, hideOutOfStock]);

  const categories = useMemo(
    () => categoriesData?.rootCategories || [],
    [categoriesData]
  );
  const bestDeals = useMemo(
    () => bestDealsData?.bestDealProducts || [],
    [bestDealsData]
  );
  const hasMoreProducts = useMemo(
    () => productsData?.products.pageInfo.hasNextPage || false,
    [productsData]
  );
  const endCursor = useMemo(
    () => productsData?.products.pageInfo.endCursor || null,
    [productsData]
  );

  const isDataLoading = useMemo(
    () => productsLoading || categoriesLoading || bestDealsLoading,
    [productsLoading, categoriesLoading, bestDealsLoading]
  );

  const hasError = useMemo(
    () => productsError || categoriesError || bestDealsError,
    [productsError, categoriesError, bestDealsError]
  );

  const errorMessage = useMemo(
    () =>
      productsError?.message ||
      categoriesError?.message ||
      bestDealsError?.message,
    [productsError, categoriesError, bestDealsError]
  );

  // Получаем общее количество товаров
  const totalProductsCount = useMemo(
    () => productsData?.products?.totalCount || products.length,
    [productsData?.products?.totalCount, products.length]
  );

  // Проверка авторизации пользователя
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    setIsAuth(!!token);
  }, [userData]);

  // Получение/установка региона
  useEffect(() => {
    if (regionData?.viewer?.region) {
      setCurrentRegion(regionData.viewer.region);
      localStorage.setItem(
        "selectedRegion",
        JSON.stringify(regionData.viewer.region)
      );
    } else {
      const savedRegion = localStorage.getItem("selectedRegion");
      if (savedRegion) {
        try {
          setCurrentRegion(JSON.parse(savedRegion));
        } catch (e) {
          console.error("Ошибка при разборе сохраненного региона:", e);
          localStorage.removeItem("selectedRegion");
        }
      }
    }
  }, [regionData]);

  // Функция загрузки дополнительных товаров
  const handleLoadMore = useCallback(() => {
    if (hasMoreProducts && !productsLoading && !isLoadingMore) {
      setIsLoadingMore(true);
      fetchMore({
        variables: {
          after: endCursor,
          first: 16,
          sortOrder,
          categoryId: selectedCategory || undefined,
        },
      })
        .then(() => {
          setIsLoadingMore(false);
        })
        .catch((error) => {
          console.error("Error loading more products:", error);
          setIsLoadingMore(false);
        });
    }
  }, [
    fetchMore,
    hasMoreProducts,
    productsLoading,
    sortOrder,
    selectedCategory,
    isLoadingMore,
    endCursor,
  ]);

  // Настройка Intersection Observer для бесконечной прокрутки
  useEffect(() => {
    const currentObserverTarget = observerTarget.current;

    if (!currentObserverTarget || !hasMoreProducts) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          handleLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(currentObserverTarget);

    return () => {
      if (currentObserverTarget) {
        observer.unobserve(currentObserverTarget);
      }
    };
  }, [handleLoadMore, hasMoreProducts]);

  // Обработчики событий UI
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

  // Рендер содержимого в зависимости от состояния загрузки
  const renderContent = () => {
    if (isDataLoading && !productsData) {
      return (
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded-xl mb-8"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="bg-gray-200 h-72 rounded-lg"></div>
            ))}
          </div>
        </div>
      );
    }

    if (hasError) {
      return (
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
      );
    }

    if (products.length === 0 && !isDataLoading) {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center my-8">
          <h2 className="text-lg font-medium text-yellow-800 mb-3">
            Товары не найдены
          </h2>
          <p className="text-yellow-700 mb-4">
            По вашему запросу не найдено товаров. Попробуйте изменить параметры
            фильтрации или выбрать другую категорию.
          </p>
          <button
            onClick={() => {
              setSelectedCategory("");
              setSortOrder("NEWEST_FIRST");
              setHideOutOfStock(false);
            }}
            className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Сбросить фильтры
          </button>
        </div>
      );
    }

    return (
      <>
        <Banner />

        <BestDeals products={bestDeals} />

        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Каталог товаров</h2>
          <button
            onClick={toggleMobileFilters}
            className="md:hidden flex items-center rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white hover:bg-gray-50"
          >
            <AdjustmentsHorizontalIcon className="h-5 w-5 mr-1 text-gray-600" />
            Фильтры
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8 mb-12">
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

          <div>
            <div className="mb-4 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Найдено товаров: {totalProductsCount}
              </div>
            </div>

            <ProductGrid products={products} />

            {hasMoreProducts && (
              <div ref={observerTarget} className="my-8 flex justify-center">
                {productsLoading || isLoadingMore ? (
                  <div className="animate-spin h-8 w-8 border-2 border-blue-600 rounded-full border-t-transparent"></div>
                ) : (
                  <button
                    onClick={handleLoadMore}
                    className="px-5 py-2 text-sm text-blue-600 border border-blue-200 rounded-full hover:bg-blue-50 transition-colors"
                  >
                    Загрузить еще
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </>
    );
  };

  return <div className="container mx-auto px-4 py-8">{renderContent()}</div>;
}
