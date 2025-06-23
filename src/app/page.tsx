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
  UsersIcon,
  GlobeAsiaAustraliaIcon,
  TagIcon,
  ChatBubbleLeftRightIcon,
  CheckIcon,
  PhoneIcon,
  TruckIcon,
  ShieldCheckIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

import { ProductCarousel } from '@/components/product/ProductCarousel';
import { FeaturedCategories } from '@/components/home/FeaturedCategories';
import Image from 'next/image';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useInfiniteScroll } from '@/lib/hooks/useInfiniteScroll';

// ==============================
// КОНСТАНТЫ И КОНФИГУРАЦИЯ
// ==============================

const HERO_BENEFITS = [
  {
    title: 'Бесплатная доставка',
    description: 'При заказе от 5000 ₽',
    detail: 'Доставим в любую точку региона в кратчайшие сроки',
    icon: TruckIcon,
    color: 'blue',
    href: '/delivery',
  },
  {
    title: 'Скидка 10%',
    description: 'На строительные материалы',
    detail: 'Акция действует до конца месяца на весь ассортимент',
    icon: TagIcon,
    color: 'green',
    href: '/special-offers',
  },
  {
    title: 'Гарантия качества',
    description: 'Более 1000+ товаров',
    detail: 'Сертифицированная продукция от проверенных поставщиков',
    icon: ShieldCheckIcon,
    color: 'amber',
    href: '/about',
  },
];

const COMPANY_INFO = {
  title: 'О компании Крон',
  summary:
    'Компания Крон — это быстро развивающаяся компания, которая насчитывает штат из более 50 сотрудников по всей России, имеет собственный парк автомобилей, а также собственное производство товаров народного потребления в России.',
  whatWeDo: {
    title: 'Что мы делаем',
    items: [
      'Прямой экспорт от крупнейших производителей: Китай, Индия, Иран, Армения, Узбекистан, Туркменистан, Вьетнам',
      'Сферы: товары для сада и огорода, хозяйственные товары',
      'Собственные бренды: «Крон», «Крон эксперт», «Крон эконом» — лучшее соотношение цены и качества',
      'Помогаем импортировать товары из перечисленных стран',
    ],
  },
  technologies: {
    title: 'Наши технологии',
    items: [
      'Мобильное приложение и онлайн-каталог — ассортимент в любой момент',
    ],
  },
  history: {
    title: 'История компании',
    text: 'Компания была основана в 2010 году и за это время прошла путь от небольшого регионального поставщика до федерального игрока с широкой сетью партнёров и клиентов по всей России.',
  },
};

const APP_INFO = {
  title: 'Мобильное приложение',
  description: 'Скачайте наше приложение для удобных покупок.',
  benefits: [],
};

// ==============================
// ВСПОМОГАТЕЛЬНЫЕ КОМПОНЕНТЫ
// ==============================

// Мемоизированный компонент для карточек преимуществ
const BenefitCard = memo(
  ({ benefit }: { benefit: (typeof HERO_BENEFITS)[0] }) => {
    const colorClasses = {
      blue: {
        bg: 'from-blue-500 to-blue-600',
        text: 'text-blue-50',
        button: 'bg-blue-500/40 hover:bg-blue-500/60',
      },
      green: {
        bg: 'from-emerald-500 to-emerald-600',
        text: 'text-emerald-50',
        button: 'bg-emerald-500/40 hover:bg-emerald-500/60',
      },
      amber: {
        bg: 'from-amber-500 to-amber-600',
        text: 'text-amber-50',
        button: 'bg-amber-500/40 hover:bg-amber-500/60',
      },
    };

    const colors = colorClasses[benefit.color as keyof typeof colorClasses];
    const IconComponent = benefit.icon;

    return (
      <div
        className={`bg-gradient-to-br ${colors.bg} rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 lg:p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform sm:hover:-translate-y-1 flex flex-col h-full`}
      >
        {/* Иконка */}
        <div className="flex sm:justify-start justify-center mb-2 sm:mb-3">
          <div className="flex-shrink-0">
            <IconComponent
              className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7"
              aria-hidden="true"
            />
          </div>
        </div>

        {/* Заголовок и описание */}
        <div className="text-center sm:text-left">
          <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold mb-1 sm:mb-2 leading-tight">
            {benefit.title}
          </h3>
          <p className="text-xs sm:text-sm md:text-base font-medium mb-2 sm:mb-3 leading-tight">
            {benefit.description}
          </p>
        </div>

        {/* Детали */}
        <p
          className={`text-xs md:text-sm ${colors.text} mb-3 md:mb-4 text-center sm:text-left line-clamp-2 sm:line-clamp-3`}
        >
          {benefit.detail}
        </p>

        {/* Кнопка - показываем на всех устройствах */}
        <div className="mt-auto">
          <Link
            href={benefit.href}
            className={`inline-block text-white ${colors.button} px-3 md:px-4 py-1.5 md:py-2 rounded-md lg:rounded-lg text-xs md:text-sm font-medium transition-colors w-full text-center`}
          >
            Подробнее
          </Link>
        </div>
      </div>
    );
  }
);

BenefitCard.displayName = 'BenefitCard';

// Компонент каталога
const CatalogSection = memo(() => (
  <section className="mb-4 sm:mb-6 md:mb-8 lg:mb-12">
    <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg sm:rounded-xl md:rounded-2xl p-4 md:p-6 lg:p-8 border border-blue-200 shadow-md max-w-screen-md mx-auto">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-3 sm:space-y-4 lg:space-y-0">
        <div className="flex-1">
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 sm:mb-2 md:mb-3">
            Полный каталог товаров
          </h2>
          <p className="text-gray-600 text-xs sm:text-sm md:text-base">
            Всё необходимое для строительства, ремонта и обустройства дома
          </p>
        </div>
        <Link
          href="/catalog"
          className="w-full lg:w-auto bg-blue-500 hover:bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-md sm:rounded-lg font-medium flex items-center justify-center transition-colors text-sm sm:text-base shadow-md hover:shadow-lg"
        >
          Перейти в каталог
          <ArrowRightIcon
            className="ml-2 h-4 w-4 sm:h-5 sm:w-5"
            aria-hidden="true"
          />
        </Link>
      </div>
    </div>
  </section>
));

CatalogSection.displayName = 'CatalogSection';

// Компонент лучших предложений
const BestDealsSection = memo(({ products }: { products: Product[] }) => {
  if (!products.length || products.length < 4) return null;

  return (
    <section className="mb-4 sm:mb-6 md:mb-8 lg:mb-12">
      <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 border border-amber-200 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-4 md:mb-6 space-y-2 sm:space-y-0">
          <div className="flex items-center">
            <FireIcon
              className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-orange-600 mr-2 sm:mr-3 flex-shrink-0"
              aria-hidden="true"
            />
            <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900">
              Лучшие предложения
            </h2>
          </div>
          <Link
            href="/best-deals"
            className="flex items-center text-orange-600 hover:text-orange-700 transition-colors text-xs sm:text-sm font-medium hover:underline"
          >
            Смотреть все
            <ChevronRightIcon
              className="ml-1 w-3 h-3 sm:w-4 sm:h-4"
              aria-hidden="true"
            />
          </Link>
        </div>

        <div className="relative">
          <ProductCarousel products={products} />
        </div>

        <div className="mt-3 sm:mt-4 text-center">
          <span className="inline-flex items-center px-2 sm:px-3 py-1 sm:py-2 rounded-full text-xs sm:text-sm bg-gradient-to-r from-orange-200 to-amber-200 text-orange-800 shadow-sm border border-orange-300">
            <FireIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            Специальные цены
          </span>
        </div>
      </div>
    </section>
  );
});

BestDealsSection.displayName = 'BestDealsSection';

// Компонент о компании
const CompanySection = memo(() => (
  <section className="bg-gradient-to-b from-white to-blue-50 py-[60px] md:py-[40px] pb-safe">
    <div className="container mx-auto max-w-7xl px-4 md:px-3">
      {/* Заголовок */}
      <h2 className="text-[28px] md:text-[24px] font-bold text-[#1A1A1A] leading-[1.3] mb-6 md:mb-4">
        {COMPANY_INFO.title}
      </h2>

      {/* Краткое описание */}
      <p className="text-base md:text-[15px] text-[#4A4A4A] leading-[1.6] mb-8 md:mb-6">
        {COMPANY_INFO.summary}
      </p>

      {/* Что мы делаем */}
      <div className="mb-8 md:mb-6">
        <h3 className="text-xl md:text-lg font-semibold text-[#2C2C2C] mb-4 md:mb-3 pl-2 relative before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-6 before:bg-[#2563EB] before:rounded-sm">
          {COMPANY_INFO.whatWeDo.title}
        </h3>
        <ul className="space-y-3 md:space-y-2.5">
          {COMPANY_INFO.whatWeDo.items.map((item, index) => (
            <li key={index} className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] flex-shrink-0 mt-2"></span>
              <span className="text-base md:text-[15px] text-[#4A4A4A] leading-[1.6]">
                {item}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Наши технологии */}
      <div className="mb-8 md:mb-6">
        <h3 className="text-xl md:text-lg font-semibold text-[#2C2C2C] mb-4 md:mb-3 pl-2 relative before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-6 before:bg-[#2563EB] before:rounded-sm">
          {COMPANY_INFO.technologies.title}
        </h3>
        <ul className="space-y-3 md:space-y-2.5">
          {COMPANY_INFO.technologies.items.map((item, index) => (
            <li key={index} className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] flex-shrink-0 mt-2"></span>
              <span className="text-base md:text-[15px] text-[#4A4A4A] leading-[1.6]">
                {item}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* История компании */}
      <div className="mb-10 md:mb-8">
        <h3 className="text-xl md:text-lg font-semibold text-[#2C2C2C] mb-4 md:mb-3 pl-2 relative before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-6 before:bg-[#2563EB] before:rounded-sm">
          {COMPANY_INFO.history.title}
        </h3>
        <p className="text-base md:text-[15px] text-[#4A4A4A] leading-[1.6]">
          {COMPANY_INFO.history.text}
        </p>
      </div>

      {/* CTA */}
      <div className="text-center">
        <Link
          href="/contact"
          className="inline-block w-full md:max-w-[280px] bg-blue-500 hover:bg-blue-600 text-white font-semibold text-base py-3 px-6 rounded-md transition-all duration-300 shadow-md hover:shadow-lg"
        >
          Связаться с нами
        </Link>
      </div>
    </div>
  </section>
));

CompanySection.displayName = 'CompanySection';

// Компонент мобильного приложения
const MobileAppSection = memo(() => (
  <section className="mb-4 sm:mb-6 md:mb-8 lg:mb-12 pb-safe">
    <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 lg:p-8 border border-blue-200 shadow-md">
      <div className="text-center max-w-4xl mx-auto">
        <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4">
          {APP_INFO.title}
        </h2>
        <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-700 mb-4 sm:mb-6 md:mb-8">
          {APP_INFO.description}
        </p>

        {/* Кнопки скачивания */}
        <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3 md:gap-4">
          <Link
            href="https://apps.apple.com/ru/app/крон-интернет-магазин/id1611541742"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-initial bg-blue-500 text-white px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-md sm:rounded-lg flex items-center justify-center hover:bg-blue-600 transition-all duration-300 text-sm sm:text-base shadow-md hover:shadow-lg"
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 mr-2"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M17.5072 12.5378C17.4472 9.68781 19.5572 8.29781 19.6572 8.22781C18.3572 6.39781 16.3272 6.16781 15.6272 6.14781C13.9272 5.96781 12.2972 7.10781 11.4372 7.10781C10.5772 7.10781 9.23723 6.15781 7.79723 6.18781C5.95723 6.21781 4.25723 7.20781 3.31723 8.78781C1.39723 11.9978 2.78723 16.7278 4.62723 19.5378C5.53723 20.9178 6.59723 22.4578 7.97723 22.3978C9.31723 22.3378 9.80723 21.5178 11.4272 21.5178C13.0472 21.5178 13.5072 22.3978 14.8872 22.3578C16.3272 22.3378 17.2772 20.9778 18.1772 19.5878C19.2272 18.0178 19.6572 16.4878 19.6772 16.4178C19.6372 16.4078 17.5772 15.5978 17.5072 12.5378Z" />
              <path d="M15.1975 4.58781C15.9275 3.68781 16.4075 2.42781 16.2675 1.15781C15.1675 1.19781 13.8275 1.89781 13.0675 2.78781C12.3875 3.57781 11.7975 4.87781 11.9675 6.10781C13.1975 6.18781 14.4675 5.48781 15.1975 4.58781Z" />
            </svg>
            <span className="text-xs sm:text-sm md:text-base font-medium">
              App Store
            </span>
          </Link>
          <Link
            href="https://www.rustore.ru/catalog/app/ru.tovarikron.android"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-initial bg-blue-500 text-white px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-md sm:rounded-lg flex items-center justify-center hover:bg-blue-600 transition-all duration-300 text-sm sm:text-base shadow-md hover:shadow-lg"
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 mr-2"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            <span className="text-xs sm:text-sm md:text-base font-medium">
              RuStore
            </span>
          </Link>
        </div>
      </div>
    </div>
  </section>
));

MobileAppSection.displayName = 'MobileAppSection';

// Компонент загрузки
const LoadingSection = memo(() => (
  <div className="animate-pulse space-y-6 sm:space-y-8">
    {/* Hero skeleton */}
    <div className="aspect-square max-w-[480px] bg-gray-200 rounded-xl"></div>

    {/* Cards skeleton */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="bg-gray-200 aspect-[4/3] rounded-lg"></div>
      ))}
    </div>

    {/* Products skeleton */}
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="bg-gray-200 aspect-square rounded-lg"></div>
      ))}
    </div>
  </div>
));

LoadingSection.displayName = 'LoadingSection';

// Компонент ошибки
const ErrorSection = memo(
  ({ message, onRetry }: { message: string; onRetry: () => void }) => (
    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center my-8">
      <h2 className="text-lg font-medium text-red-800 mb-2">
        Произошла ошибка при загрузке данных
      </h2>
      <p className="text-red-600 mb-4 text-sm sm:text-base">{message}</p>
      <button
        onClick={onRetry}
        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base"
      >
        Обновить страницу
      </button>
    </div>
  )
);

ErrorSection.displayName = 'ErrorSection';

// ==============================
// ГЛАВНЫЙ КОМПОНЕНТ
// ==============================

export default function Home() {
  // Add client-side only state
  const [isClient, setIsClient] = useState(false);

  // Use effect to mark when we're on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Состояния компонента
  const [sortOrder, setSortOrder] = useState<ProductSortOrder>('NEWEST_FIRST');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [hideOutOfStock, setHideOutOfStock] = useState(true);

  // Получение текущего региона
  const { data: regionData, error: regionError } = useQuery(
    GET_CURRENT_REGION,
    {
      skip: !isClient, // Skip on server-side
      fetchPolicy: 'cache-and-network',
      onError: (error) => {
        console.error('Ошибка при получении региона:', error);
      },
    }
  );

  // Запрос товаров
  const {
    data: productsData,
    loading: productsLoading,
    error: productsError,
    fetchMore,
  } = useQuery(GET_PRODUCTS, {
    variables: {
      first: 48,
      sortOrder,
      categoryId: selectedCategory || undefined,
    },
    skip: !isClient || !regionData?.currentRegion, // Skip on server-side and when no region
    fetchPolicy: 'cache-and-network',
    onError: (error) => {
      console.error('Ошибка при получении товаров:', error);
    },
  });

  // Запрос категорий
  const {
    data: categoriesData,
    loading: categoriesLoading,
    error: categoriesError,
  } = useQuery(GET_CATEGORIES, {
    skip: !isClient, // Skip on server-side
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
    skip: !isClient || !regionData?.currentRegion, // Skip on server-side and when no region
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

  // Мемоизированные данные
  const user = useMemo(() => userData?.viewer, [userData]);

  const products = useMemo(() => {
    try {
      const allProducts =
        productsData?.products?.edges?.map(
          (edge: { node: Product }) => edge.node
        ) || [];

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

  // Запрос текущего региона
  useEffect(() => {
    if (regionData?.currentRegion) {
      // Update any UI elements that depend on the region
      // but don't use setCurrentRegion since we're using regionData directly
      console.log('Region updated:', regionData.currentRegion);
    }
  }, [regionData]);

  useEffect(() => {
    if (regionError) {
      console.error('Error fetching region:', regionError);
    }
  }, [regionError]);

  // Обработчик перезагрузки
  const handleRetry = useCallback(() => {
    window.location.reload();
  }, []);

  // Рендер содержимого
  const renderContent = () => {
    if (isDataLoading && !productsData) {
      return <LoadingSection />;
    }

    if (hasError) {
      return (
        <ErrorSection
          message={errorMessage || 'Неизвестная ошибка'}
          onRetry={handleRetry}
        />
      );
    }

    return (
      <>
        {/* Hero секция с преимуществами */}
        <section className="mb-6 sm:mb-8 md:mb-10 lg:mb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 benefits-grid">
            {HERO_BENEFITS.map((benefit, index) => (
              <BenefitCard key={index} benefit={benefit} />
            ))}
          </div>
        </section>

        {/* Каталог товаров */}
        <CatalogSection />

        {/* Лучшие предложения */}
        <BestDealsSection products={bestDeals} />

        {/* О компании */}
        <CompanySection />

        {/* Мобильное приложение */}
        <MobileAppSection />
      </>
    );
  };

  // Initial loading state
  if (!isClient) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="aspect-square max-w-[480px] bg-gray-200 rounded-xl mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-200 aspect-square rounded-lg" />
            <div className="bg-gray-200 aspect-square rounded-lg" />
            <div className="bg-gray-200 aspect-square rounded-lg" />
            <div className="bg-gray-200 aspect-square rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return <div className="min-h-screen bg-gray-50">{renderContent()}</div>;
}
