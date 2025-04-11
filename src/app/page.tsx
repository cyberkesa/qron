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
import { ProductCard } from "@/components/product/ProductCard";
import { ProductFilters } from "@/components/product-list/ProductFilters";
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
  ArrowRightIcon,
  BuildingStorefrontIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

import { ProductCarousel } from "@/components/product/ProductCarousel";
import Image from "next/image";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useInfiniteScroll } from "@/lib/hooks/useInfiniteScroll";

// Мемоизированный компонент для списка товаров
const ProductGrid = memo(({ products }: { products: Product[] }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map((product, index) => (
        <ProductCard
          key={`home-${product.id}-${index}-${Math.random().toString(36).substring(2, 9)}`}
          product={product}
        />
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
            Единиц оборудования и инвентаря для строительства, садоводства и
            домашнего хозяйства
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
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [currentRegion, setCurrentRegion] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [hideOutOfStock, setHideOutOfStock] = useState(true);

  // Ref для бесконечной прокрутки
  const observerTarget = useRef<HTMLDivElement>(null);

  // Получение текущего региона
  const { data: regionData, error: regionError } = useQuery(
    GET_CURRENT_REGION,
    {
      fetchPolicy: "cache-and-network",
      onError: (error) => {
        console.error("Ошибка при получении региона:", error);
      },
    },
  );

  // Запрос товаров с использованием выбранных фильтров
  const {
    data: productsData,
    loading: productsLoading,
    error: productsError,
    fetchMore,
  } = useQuery(GET_PRODUCTS, {
    variables: {
      first: 48, // Загружаем по 48 товаров за раз
      sortOrder,
      categoryId: selectedCategory || undefined,
    },
    skip: !currentRegion,
    fetchPolicy: "cache-and-network",
    onError: (error) => {
      console.error("Ошибка при получении товаров:", error);
    },
  });

  // Запрос категорий для фильтров
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

  // Запрос лучших предложений
  const {
    data: bestDealsData,
    loading: bestDealsLoading,
    error: bestDealsError,
  } = useQuery(GET_BEST_DEAL_PRODUCTS, {
    skip: !currentRegion,
    fetchPolicy: "cache-and-network",
    onError: (error) => {
      console.error("Ошибка при получении лучших предложений:", error);
    },
  });

  // Запрос данных пользователя
  const { data: userData } = useQuery(GET_VIEWER, {
    fetchPolicy: "cache-and-network",
    onError: (error) => {
      console.error("Ошибка при получении данных пользователя:", error);
    },
  });

  // Подготовка данных для использования в компоненте - мемоизируем эти вычисления
  const user = useMemo(() => userData?.viewer, [userData]);

  // Мемоизируем обработанные товары
  const products = useMemo(() => {
    try {
      const allProducts =
        productsData?.products?.edges?.map(
          (edge: { node: Product }) => edge.node,
        ) || [];

      // Если включен фильтр "скрыть товары не в наличии", отфильтровываем их
      if (hideOutOfStock) {
        return allProducts.filter(
          (product: Product) =>
            product.stockAvailabilityStatus ===
              ProductStockAvailabilityStatus.IN_STOCK ||
            product.stockAvailabilityStatus ===
              ProductStockAvailabilityStatus.IN_STOCK_SOON,
        );
      }

      return allProducts;
    } catch (error) {
      console.error("Ошибка обработки данных товаров:", error);
      return [];
    }
  }, [productsData?.products?.edges, hideOutOfStock]);

  const categories = useMemo(
    () => categoriesData?.rootCategories || [],
    [categoriesData],
  );
  const bestDeals = useMemo(
    () => bestDealsData?.bestDealProducts || [],
    [bestDealsData],
  );
  const hasMoreProducts = useMemo(
    () => productsData?.products?.pageInfo?.hasNextPage || false,
    [productsData],
  );
  const endCursor = useMemo(
    () => productsData?.products?.pageInfo?.endCursor || null,
    [productsData],
  );

  const isDataLoading = useMemo(
    () => productsLoading || categoriesLoading || bestDealsLoading,
    [productsLoading, categoriesLoading, bestDealsLoading],
  );

  const hasError = useMemo(
    () => productsError || categoriesError || bestDealsError || regionError,
    [productsError, categoriesError, bestDealsError, regionError],
  );

  const errorMessage = useMemo(
    () =>
      productsError?.message ||
      categoriesError?.message ||
      bestDealsError?.message ||
      regionError?.message,
    [productsError, categoriesError, bestDealsError, regionError],
  );

  // Получаем общее количество товаров
  const totalProductsCount = useMemo(() => products.length, [products.length]);

  // Получение/установка региона - безопасно для SSR
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
          },
        });
      }
    },
  });

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

    return (
      <>
        <Banner />

        <BestDeals products={bestDeals} />

        {/* Секция о компании */}
        <div className="mb-12">
          <div className="bg-blue-50 rounded-xl p-8 border border-blue-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              О компании
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <p className="text-gray-700 mb-4">
                  Мы специализируемся на продаже строительных материалов,
                  инструментов и товаров для дома и сада с 2010 года. Наша
                  компания предлагает широкий ассортимент продукции от ведущих
                  производителей с гарантией качества.
                </p>
                <p className="text-gray-700 mb-6">
                  Мы постоянно расширяем каталог товаров и стремимся предложить
                  нашим клиентам лучшие цены и условия доставки в регионе.
                </p>
                <Link
                  href="/about"
                  className="inline-flex items-center text-blue-600 font-medium hover:text-blue-800 transition-colors"
                >
                  Подробнее о компании
                  <ChevronRightIcon className="ml-1 w-4 h-4" />
                </Link>
              </div>
              <div className="flex items-center justify-center">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      10+
                    </div>
                    <div className="text-gray-600 text-sm">Лет на рынке</div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      5000+
                    </div>
                    <div className="text-gray-600 text-sm">Позиций товаров</div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      24/7
                    </div>
                    <div className="text-gray-600 text-sm">Поддержка</div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      98%
                    </div>
                    <div className="text-gray-600 text-sm">
                      Довольных клиентов
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Секция с мобильным приложением */}
        <div className="mb-12">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-xl overflow-hidden">
            <div className="grid md:grid-cols-2 items-center">
              <div className="p-8 text-white">
                <h2 className="text-2xl font-bold mb-4">
                  Мобильное приложение
                </h2>
                <p className="mb-6 text-purple-100">
                  Скачайте наше приложение для удобных покупок где бы вы ни
                  находились. Получайте эксклюзивные предложения и отслеживайте
                  свои заказы в реальном времени.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link
                    href="#"
                    className="bg-black text-white px-4 py-2 rounded-lg flex items-center hover:bg-gray-900 transition-colors"
                  >
                    <svg
                      className="w-6 h-6 mr-2"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M17.5072 12.5378C17.4472 9.68781 19.5572 8.29781 19.6572 8.22781C18.3572 6.39781 16.3272 6.16781 15.6272 6.14781C13.9272 5.96781 12.2972 7.10781 11.4372 7.10781C10.5772 7.10781 9.23723 6.15781 7.79723 6.18781C5.95723 6.21781 4.25723 7.20781 3.31723 8.78781C1.39723 11.9978 2.78723 16.7278 4.62723 19.5378C5.53723 20.9178 6.59723 22.4578 7.97723 22.3978C9.31723 22.3378 9.80723 21.5178 11.4272 21.5178C13.0472 21.5178 13.5072 22.3978 14.8872 22.3578C16.3272 22.3378 17.2772 20.9778 18.1772 19.5878C19.2272 18.0178 19.6572 16.4878 19.6772 16.4178C19.6372 16.4078 17.5772 15.5978 17.5072 12.5378Z" />
                      <path d="M15.1975 4.58781C15.9275 3.68781 16.4075 2.42781 16.2675 1.15781C15.1675 1.19781 13.8275 1.89781 13.0675 2.78781C12.3875 3.57781 11.7975 4.87781 11.9675 6.10781C13.1975 6.18781 14.4675 5.48781 15.1975 4.58781Z" />
                    </svg>
                    App Store
                  </Link>
                  <Link
                    href="#"
                    className="bg-black text-white px-4 py-2 rounded-lg flex items-center hover:bg-gray-900 transition-colors"
                  >
                    <svg
                      className="w-6 h-6 mr-2"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M3.60938 2.49609C3.27344 2.83203 3.07031 3.38672 3.07031 4.07812V19.9219C3.07031 20.6133 3.27344 21.168 3.60938 21.5039L3.69531 21.5898L13.7109 11.5742V11.5V11.4258L3.69531 1.41016L3.60938 2.49609Z" />
                      <path d="M17.4844 15.3477L13.7109 11.5742V11.5V11.4258L17.4844 7.65234L17.5703 7.73828L22.082 10.293C23.332 11.0078 23.332 11.9922 22.082 12.707L17.5703 15.2617L17.4844 15.3477Z" />
                      <path d="M17.5703 15.2617L13.7109 11.5L3.60938 21.5039C4.01172 21.9297 4.66797 21.9766 5.41016 21.5508L17.5703 15.2617Z" />
                      <path d="M17.5703 7.73828L5.41016 1.44922C4.66797 1.02344 4.01172 1.07031 3.60938 1.49609L13.7109 11.5L17.5703 7.73828Z" />
                    </svg>
                    Google Play
                  </Link>
                </div>
              </div>
              <div className="hidden md:flex justify-center p-8">
                <div className="relative w-52 h-96 bg-black rounded-3xl overflow-hidden border-8 border-gray-800">
                  <div className="absolute top-0 left-0 right-0 h-6 bg-gray-800 flex justify-center items-end pb-1">
                    <div className="w-20 h-1 bg-gray-600 rounded-full"></div>
                  </div>
                  <div className="w-full h-full bg-gradient-to-b from-blue-500 to-purple-600 pt-6 flex flex-col items-center">
                    <div className="w-full px-4 py-2 flex justify-between items-center text-white text-xs">
                      <span>12:30</span>
                      <div className="flex space-x-1">
                        <span>4G</span>
                        <span>100%</span>
                      </div>
                    </div>
                    <div className="mt-10 text-center text-white">
                      <div className="text-lg font-bold mb-1">КРОНСТРОЙ</div>
                      <div className="text-xs mb-8">Мобильное приложение</div>
                      <div className="flex justify-center">
                        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-purple-600">
                          <BuildingStorefrontIcon className="h-8 w-8" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Секция перехода в каталог */}
        <div className="mb-12 bg-gradient-to-r from-blue-50 to-white rounded-xl p-8 border border-blue-100">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Полный каталог товаров
              </h2>
              <p className="text-gray-600 mb-4 md:mb-0">
                У нас вы найдете все необходимое для строительства, ремонта и
                обустройства дома
              </p>
            </div>
            <Link
              href="/catalog"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center transition-colors"
            >
              Перейти в каталог
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </>
    );
  };

  return <div className="container mx-auto px-4 py-8">{renderContent()}</div>;
}
