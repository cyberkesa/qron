'use client';

import { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import { useQuery } from '@apollo/client';
import {
  GET_PRODUCTS,
  GET_CATEGORIES,
  GET_VIEWER,
  GET_BEST_DEAL_PRODUCTS,
  GET_CURRENT_REGION,
} from '@/lib/queries';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductFilters } from '@/components/product-list/ProductFilters';
import {
  ProductSortOrder,
  Product,
  ProductStockAvailabilityStatus,
  Category,
} from '@/types/api';
import Link from 'next/link';
import {
  ShoppingCartIcon,
  UserIcon,
  FireIcon,
  AdjustmentsHorizontalIcon,
  ArrowRightIcon,
  BuildingStorefrontIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

import { ProductCarousel } from '@/components/product/ProductCarousel';
import { FeaturedCategories } from '@/components/home/FeaturedCategories';
import Image from 'next/image';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useInfiniteScroll } from '@/lib/hooks/useInfiniteScroll';

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

ProductGrid.displayName = 'ProductGrid';

// Мемоизированный компонент для лучших предложений
const BestDeals = memo(({ products }: { products: Product[] }) => {
  if (!products.length) return null;

  return (
    <div className="mb-16">
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <FireIcon className="h-7 w-7 text-orange-500 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">
              Лучшие предложения
            </h2>
          </div>
          <Link
            href="/best-deals"
            className="flex items-center text-orange-600 hover:text-orange-700 transition-colors text-sm font-medium"
          >
            Смотреть все
            <ChevronRightIcon className="ml-1 w-4 h-4" />
          </Link>
        </div>

        <div className="relative">
          <div className="absolute -left-3 -right-3 -top-2 bottom-0 bg-gradient-to-r from-amber-100/20 to-orange-100/20 rounded-xl -z-10"></div>
          <ProductCarousel products={products} />
        </div>

        <div className="mt-4 text-center">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800">
            <FireIcon className="h-4 w-4 mr-1" />
            Специальные цены
          </span>
        </div>
      </div>
    </div>
  );
});

BestDeals.displayName = 'BestDeals';

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

Banner.displayName = 'Banner';

export default function Home() {
  // Состояния компонента
  const [sortOrder, setSortOrder] = useState<ProductSortOrder>('NEWEST_FIRST');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
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
      fetchPolicy: 'cache-and-network',
      onError: (error) => {
        console.error('Ошибка при получении региона:', error);
      },
    }
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
    fetchPolicy: 'cache-and-network',
    onError: (error) => {
      console.error('Ошибка при получении товаров:', error);
    },
  });

  // Запрос категорий для фильтров
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

  // Запрос лучших предложений
  const {
    data: bestDealsData,
    loading: bestDealsLoading,
    error: bestDealsError,
  } = useQuery(GET_BEST_DEAL_PRODUCTS, {
    skip: !currentRegion,
    fetchPolicy: 'cache-and-network',
    onError: (error) => {
      console.error('Ошибка при получении лучших предложений:', error);
    },
  });

  // Запрос данных пользователя
  const { data: userData } = useQuery(GET_VIEWER, {
    fetchPolicy: 'cache-and-network',
    onError: (error) => {
      console.error('Ошибка при получении данных пользователя:', error);
    },
  });

  // Подготовка данных для использования в компоненте - мемоизируем эти вычисления
  const user = useMemo(() => userData?.viewer, [userData]);

  // Мемоизируем обработанные товары
  const products = useMemo(() => {
    try {
      const allProducts =
        productsData?.products?.edges?.map(
          (edge: { node: Product }) => edge.node
        ) || [];

      // Если включен фильтр "скрыть товары не в наличии", отфильтровываем их
      if (hideOutOfStock) {
        return allProducts.filter(
          (product: Product) =>
            product.stockAvailabilityStatus ===
              ProductStockAvailabilityStatus.IN_STOCK ||
            product.stockAvailabilityStatus ===
              ProductStockAvailabilityStatus.IN_STOCK_SOON
        );
      }

      return allProducts;
    } catch (error) {
      console.error('Ошибка обработки данных товаров:', error);
      return [];
    }
  }, [productsData?.products?.edges, hideOutOfStock]);

  const categories = useMemo(
    () => categoriesData?.rootCategories || [],
    [categoriesData]
  );
  const bestDeals = useMemo(
    () => bestDealsData?.bestDealProducts || [],
    [bestDealsData]
  );
  const hasMoreProducts = useMemo(
    () => productsData?.products?.pageInfo?.hasNextPage || false,
    [productsData]
  );
  const endCursor = useMemo(
    () => productsData?.products?.pageInfo?.endCursor || null,
    [productsData]
  );

  const isDataLoading = useMemo(
    () => productsLoading || categoriesLoading || bestDealsLoading,
    [productsLoading, categoriesLoading, bestDealsLoading]
  );

  const hasError = useMemo(
    () => productsError || categoriesError || bestDealsError || regionError,
    [productsError, categoriesError, bestDealsError, regionError]
  );

  const errorMessage = useMemo(
    () =>
      productsError?.message ||
      categoriesError?.message ||
      bestDealsError?.message ||
      regionError?.message,
    [productsError, categoriesError, bestDealsError, regionError]
  );

  // Получаем общее количество товаров
  const totalProductsCount = useMemo(() => products.length, [products.length]);

  // Получение/установка региона - безопасно для SSR
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

        {/* Featured Categories */}
        <div className="mb-12">
          <div className="flex items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Популярные категории
            </h2>
          </div>
          <FeaturedCategories />
        </div>

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
          <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-purple-800 rounded-2xl overflow-hidden shadow-xl transform transition-all duration-300 hover:shadow-2xl">
            <div className="grid md:grid-cols-5 lg:grid-cols-2 items-center">
              <div className="p-6 sm:p-8 md:p-10 md:col-span-3 lg:col-span-1">
                <div className="space-y-5 sm:space-y-6">
                  <div className="inline-block bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-white">
                    Мобильное приложение КРОН
                  </div>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white">
                    Совершайте покупки с любого устройства
                  </h2>
                  <p className="text-indigo-100 text-base sm:text-lg leading-relaxed max-w-2xl">
                    Скачайте наше приложение для удобных покупок где бы вы ни
                    находились. Получайте эксклюзивные предложения и
                    отслеживайте свои заказы в реальном времени.
                  </p>

                  <div className="space-y-3 sm:space-y-4 md:space-y-0 md:flex md:gap-4">
                    <Link
                      href="https://apps.apple.com/ru/app/крон-интернет-магазин/id1611541742"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center md:justify-start bg-black/80 backdrop-blur-sm hover:bg-black w-full md:w-auto px-5 py-3 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg group"
                    >
                      <svg
                        className="w-6 h-6 sm:w-7 sm:h-7 mr-3 text-white flex-shrink-0"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M17.5072 12.5378C17.4472 9.68781 19.5572 8.29781 19.6572 8.22781C18.3572 6.39781 16.3272 6.16781 15.6272 6.14781C13.9272 5.96781 12.2972 7.10781 11.4372 7.10781C10.5772 7.10781 9.23723 6.15781 7.79723 6.18781C5.95723 6.21781 4.25723 7.20781 3.31723 8.78781C1.39723 11.9978 2.78723 16.7278 4.62723 19.5378C5.53723 20.9178 6.59723 22.4578 7.97723 22.3978C9.31723 22.3378 9.80723 21.5178 11.4272 21.5178C13.0472 21.5178 13.5072 22.3978 14.8872 22.3578C16.3272 22.3378 17.2772 20.9778 18.1772 19.5878C19.2272 18.0178 19.6572 16.4878 19.6772 16.4178C19.6372 16.4078 17.5772 15.5978 17.5072 12.5378Z" />
                        <path d="M15.1975 4.58781C15.9275 3.68781 16.4075 2.42781 16.2675 1.15781C15.1675 1.19781 13.8275 1.89781 13.0675 2.78781C12.3875 3.57781 11.7975 4.87781 11.9675 6.10781C13.1975 6.18781 14.4675 5.48781 15.1975 4.58781Z" />
                      </svg>
                      <div className="text-left">
                        <div className="text-xs text-gray-300">Скачать в</div>
                        <div className="text-white font-medium group-hover:text-indigo-200 transition-colors">
                          App Store
                        </div>
                      </div>
                    </Link>

                    <Link
                      href="https://www.rustore.ru/catalog/app/ru.tovarikron.android"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center md:justify-start bg-black/80 backdrop-blur-sm hover:bg-black w-full md:w-auto px-5 py-3 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg group"
                    >
                      <svg
                        className="w-6 h-6 sm:w-7 sm:h-7 mr-3 text-white flex-shrink-0"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                      </svg>
                      <div className="text-left">
                        <div className="text-xs text-gray-300">Доступно в</div>
                        <div className="text-white font-medium group-hover:text-indigo-200 transition-colors">
                          RuStore
                        </div>
                      </div>
                    </Link>
                  </div>

                  <div className="flex flex-col xs:flex-row items-start xs:items-center gap-4 xs:space-x-4 pt-2 sm:pt-4">
                    <div className="bg-white p-3 rounded-xl shadow-lg transform transition-transform duration-300 hover:rotate-2 hover:scale-105">
                      <Image
                        src="/images/qr-code.svg"
                        alt="QR код для скачивания приложения"
                        width={90}
                        height={90}
                        className="w-auto h-auto"
                      />
                    </div>
                    <div className="text-sm text-indigo-100">
                      <p className="font-medium text-white">Быстрый доступ</p>
                      <p>
                        Отсканируйте QR-код для
                        <br className="hidden xs:block" />
                        скачивания приложения
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="hidden md:flex justify-center items-center p-4 md:p-6 lg:p-8 md:col-span-2 lg:col-span-1 relative">
                <div className="absolute -right-12 -top-12 w-32 h-32 bg-yellow-300 rounded-full opacity-20 blur-2xl animate-pulse"></div>
                <div
                  className="absolute right-1/3 bottom-1/3 w-40 h-40 bg-pink-500 rounded-full opacity-20 blur-3xl animate-pulse"
                  style={{ animationDelay: '1s' }}
                ></div>

                <div className="relative z-10 transform transition-all duration-700 hover:rotate-3 hover:translate-y-1 max-w-full">
                  <div className="relative w-56 sm:w-60 md:w-48 lg:w-64 aspect-[9/19] bg-black rounded-[32px] overflow-hidden border-[8px] border-gray-800 shadow-2xl">
                    <div className="absolute top-0 left-0 right-0 h-5 bg-gray-800 flex justify-center items-end pb-1 z-10">
                      <div className="w-20 h-[4px] bg-gray-600 rounded-full"></div>
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-b from-indigo-500 via-purple-500 to-purple-700 bg-300% animate-gradient"></div>

                    <div className="w-full h-full pt-6 flex flex-col items-center relative z-10">
                      <div className="w-full px-4 py-1 flex justify-between items-center text-white text-xs">
                        <span>12:30</span>
                        <div className="flex items-center gap-1">
                          <svg
                            className="w-3 h-3"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M9.5 18.5h5v-13h-5v13zm-7 0h5V10h-5v8.5zm14-8.5v8.5h5V10h-5z" />
                          </svg>
                          <span>4G</span>
                          <svg
                            className="w-4 h-4 ml-1"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M18.5,4h-13a4,4,0,0,0-4,4V16a4,4,0,0,0,4,4h13a4,4,0,0,0,4-4V8A4,4,0,0,0,18.5,4ZM21,16a2.5,2.5,0,0,1-2.5,2.5h-13A2.5,2.5,0,0,1,3,16V8A2.5,2.5,0,0,1,5.5,5.5h13A2.5,2.5,0,0,1,21,8Z" />
                            <path d="M17.93,8.33A2.77,2.77,0,0,1,19.5,11V13a2.77,2.77,0,0,1-1.57,2.67,1,1,0,1,0,1,1.73A4.78,4.78,0,0,0,21.5,13V11a4.78,4.78,0,0,0-2.57-4.4,1,1,0,0,0-1,1.73Z" />
                            <rect x="15.5" y="11" width="2" height="2" />
                          </svg>
                          <span>100%</span>
                        </div>
                      </div>

                      <div className="mt-10 text-center text-white">
                        <div className="text-xl font-bold mb-1">КРОН</div>
                        <div className="text-xs mb-8">Мобильное приложение</div>

                        <div className="flex justify-center">
                          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-purple-600 shadow-lg animate-pulse">
                            <svg
                              className="h-8 w-8"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M22 8.65C21.44 8.26 20.77 8 20.05 8H17V7.05C17 6.37 16.57 5.55 15.93 5.13L14.54 4.24C13.9 3.83 13.47 3 12.83 3H7.17C6.53 3 6.1 3.83 5.46 4.24L4.07 5.13C3.43 5.55 3 6.37 3 7.05V8H2.95C1.77 8 1 9.04 1 10.22V19.99C1 21.17 1.77 22 2.95 22H20.05C21.23 22 22 21.17 22 19.99V10.22C22 9.53 22 9.14 22 8.65ZM5 7.05C5 6.86 5.22 6.46 5.37 6.36L6.77 5.47C7.38 5.06 7.81 4.23 8.45 4.23H14.56C15.19 4.23 15.62 5.06 16.23 5.47L17.63 6.36C17.78 6.46 18 6.86 18 7.05V8H5V7.05ZM20 19.99H3V10.22H20V19.99Z" />
                              <path d="M11.05 17.22C11.22 17.39 11.45 17.48 11.67 17.48C11.9 17.48 12.12 17.39 12.29 17.22L15.22 14.29C15.56 13.95 15.56 13.42 15.22 13.08C14.89 12.74 14.35 12.74 14.01 13.08L12.17 14.92V11.58C12.17 11.11 11.79 10.73 11.32 10.73C10.85 10.73 10.47 11.11 10.47 11.58V15.28C10.47 15.46 10.54 15.64 10.67 15.78L11.05 17.22Z" />
                            </svg>
                          </div>
                        </div>

                        <div className="mt-8 p-2">
                          <div className="h-12 w-full bg-white/20 backdrop-blur-sm rounded-xl mb-2 flex items-center px-3">
                            <div className="rounded-lg bg-white/30 w-6 h-6 mr-2 flex-shrink-0"></div>
                            <div className="w-full space-y-1">
                              <div className="h-1.5 bg-white/30 rounded w-3/4"></div>
                              <div className="h-1.5 bg-white/30 rounded w-1/2"></div>
                            </div>
                          </div>
                          <div className="h-12 w-full bg-white/20 backdrop-blur-sm rounded-xl flex items-center px-3">
                            <div className="rounded-lg bg-white/30 w-6 h-6 mr-2 flex-shrink-0"></div>
                            <div className="w-full space-y-1">
                              <div className="h-1.5 bg-white/30 rounded w-2/3"></div>
                              <div className="h-1.5 bg-white/30 rounded w-1/3"></div>
                            </div>
                          </div>
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
