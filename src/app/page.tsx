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
    detail: 'Доставим в любую точку региона',
    icon: TruckIcon,
    color: 'blue',
    href: '/delivery',
  },
  {
    title: 'Скидка 10%',
    description: 'На строительные материалы',
    detail: 'Акция действует до конца месяца',
    icon: TagIcon,
    color: 'green',
    href: '/special-offers',
  },
  {
    title: 'Гарантия качества',
    description: 'Более 1000+ товаров',
    detail: 'Сертифицированная продукция',
    icon: ShieldCheckIcon,
    color: 'amber',
    href: '/about',
  },
];

const COMPANY_INFO = {
  title: 'О компании Крон',
  description:
    'Ведущий поставщик товаров для строительства, ремонта и обустройства дома с собственным производством и прямыми поставками из 7 стран.',
  advantages: [
    'Прямые поставки от производителей',
    'Собственное производство в России',
    'Широкий ассортимент товаров',
    'Быстрая доставка по всей России',
    'Профессиональная консультация',
    'Гарантия качества на все товары',
  ],
  metrics: [
    {
      value: '50+',
      label: 'Сотрудников',
      icon: UsersIcon,
    },
    {
      value: '7',
      label: 'Стран-партнёров',
      icon: GlobeAsiaAustraliaIcon,
    },
    {
      value: '24/7',
      label: 'Поддержка',
      icon: ChatBubbleLeftRightIcon,
    },
    {
      value: '3',
      label: 'Собственных бренда',
      icon: TagIcon,
    },
  ],
};

const APP_INFO = {
  title: 'Мобильное приложение',
  description:
    'Скачайте наше приложение для удобных покупок. Получайте эксклюзивные предложения и отслеживайте заказы.',
  benefits: [
    'Уведомления о скидках',
    'Отслеживание заказов',
    'Быстрое оформление',
    'Эксклюзивные предложения',
  ],
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
        text: 'text-blue-100',
        button: 'bg-blue-600/30 hover:bg-blue-600/50',
      },
      green: {
        bg: 'from-green-500 to-green-600',
        text: 'text-green-100',
        button: 'bg-green-600/30 hover:bg-green-600/50',
      },
      amber: {
        bg: 'from-amber-500 to-amber-600',
        text: 'text-amber-100',
        button: 'bg-amber-600/30 hover:bg-amber-600/50',
      },
    };

    const colors = colorClasses[benefit.color as keyof typeof colorClasses];
    const IconComponent = benefit.icon;

    return (
      <div
        className={`bg-gradient-to-br ${colors.bg} rounded-lg sm:rounded-xl p-1 sm:p-2 md:p-4 lg:p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 benefit-card-compact`}
      >
        {/* Иконка - центрируем на мобильных */}
        <div className="flex justify-center mb-1 sm:mb-2">
          <div className="flex-shrink-0">
            <IconComponent className="h-3 w-3 sm:h-4 sm:w-4 md:h-6 md:w-6 lg:h-8 lg:w-8" />
          </div>
        </div>

        {/* Заголовок и описание - центрируем на мобильных */}
        <div className="text-center sm:text-left">
          <h3 className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl font-bold mb-0.5 sm:mb-1 leading-tight">
            {benefit.title}
          </h3>
          <p className="text-xs sm:text-sm md:text-base font-medium mb-1 sm:mb-2 leading-tight">
            {benefit.description}
          </p>
        </div>

        {/* Детали - скрываем на очень маленьких экранах */}
        <p
          className={`hidden sm:block text-xs md:text-sm ${colors.text} mb-2 md:mb-3 lg:mb-4 text-center sm:text-left details`}
        >
          {benefit.detail}
        </p>

        {/* Кнопка - скрываем на мобильных, показываем на планшетах и больше */}
        <Link
          href={benefit.href}
          className={`hidden sm:inline-block text-white ${colors.button} px-2 md:px-3 lg:px-4 py-1 md:py-1.5 lg:py-2 rounded-md lg:rounded-lg text-xs md:text-sm font-medium transition-colors w-full text-center button`}
        >
          Подробнее
        </Link>
      </div>
    );
  }
);

BenefitCard.displayName = 'BenefitCard';

// Компонент каталога
const CatalogSection = memo(() => (
  <section className="mb-4 sm:mb-6 md:mb-8 lg:mb-12">
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 lg:p-8 border border-blue-100 shadow-sm">
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
          className="w-full lg:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-md sm:rounded-lg font-medium flex items-center justify-center transition-colors text-sm sm:text-base"
        >
          Перейти в каталог
          <ArrowRightIcon className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
        </Link>
      </div>
    </div>
  </section>
));

CatalogSection.displayName = 'CatalogSection';

// Компонент лучших предложений
const BestDealsSection = memo(({ products }: { products: Product[] }) => {
  if (!products.length) return null;

  return (
    <section className="mb-4 sm:mb-6 md:mb-8 lg:mb-12">
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 border border-amber-100 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-4 md:mb-6 space-y-2 sm:space-y-0">
          <div className="flex items-center">
            <FireIcon className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-orange-500 mr-2 sm:mr-3 flex-shrink-0" />
            <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900">
              Лучшие предложения
            </h2>
          </div>
          <Link
            href="/best-deals"
            className="flex items-center text-orange-600 hover:text-orange-700 transition-colors text-xs sm:text-sm font-medium"
          >
            Смотреть все
            <ChevronRightIcon className="ml-1 w-3 h-3 sm:w-4 sm:h-4" />
          </Link>
        </div>

        <div className="relative">
          <ProductCarousel products={products} />
        </div>

        <div className="mt-3 sm:mt-4 text-center">
          <span className="inline-flex items-center px-2 sm:px-3 py-1 sm:py-2 rounded-full text-xs sm:text-sm bg-orange-100 text-orange-800">
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
  <section className="mb-4 sm:mb-6 md:mb-8 lg:mb-12">
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 lg:p-8 xl:p-12 border border-blue-100 shadow-lg">
      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 lg:gap-12">
        {/* Резерв под иллюстрацию - только на больших экранах */}
        <div className="hidden lg:flex items-center justify-center">
          <div className="w-full h-48 lg:h-64 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl border-2 border-dashed border-blue-200 flex items-center justify-center">
            <div className="text-center text-blue-400">
              <BuildingStorefrontIcon className="h-12 w-12 lg:h-16 lg:w-16 mx-auto mb-2 opacity-50" />
              <p className="text-xs lg:text-sm font-medium">
                Место для изображения
              </p>
            </div>
          </div>
        </div>

        {/* Основной контент */}
        <div className="lg:col-span-2 space-y-3 sm:space-y-4 md:space-y-6 lg:space-y-8">
          {/* Заголовок и описание */}
          <div>
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4">
              {COMPANY_INFO.title}
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed">
              {COMPANY_INFO.description}
            </p>
          </div>

          {/* Преимущества */}
          <div>
            <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-2 sm:mb-3 md:mb-4">
              Наши преимущества
            </h3>
            <div className="grid gap-1.5 sm:gap-2 md:gap-3">
              {COMPANY_INFO.advantages.map((advantage, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-2 sm:space-x-3"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <CheckIcon className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-green-500" />
                  </div>
                  <span className="text-xs sm:text-sm md:text-base text-gray-700">
                    {advantage}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Метрики */}
          <div>
            <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 md:mb-6">
              Цифры и факты
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
              {COMPANY_INFO.metrics.map((metric, index) => {
                const IconComponent = metric.icon;
                return (
                  <div
                    key={index}
                    className="bg-white p-2 sm:p-3 md:p-4 lg:p-6 rounded-md sm:rounded-lg md:rounded-xl shadow-md border border-gray-100 text-center hover:shadow-lg transition-shadow"
                  >
                    <div className="flex justify-center mb-1 sm:mb-2 md:mb-3">
                      <div className="p-1 sm:p-2 md:p-3 bg-blue-100 rounded-full">
                        <IconComponent className="h-3 w-3 sm:h-4 sm:w-4 md:h-6 md:w-6 text-blue-600" />
                      </div>
                    </div>
                    <div className="text-sm sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold text-blue-600 mb-0.5 sm:mb-1">
                      {metric.value}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 font-medium">
                      {metric.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Кнопки */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4">
            <Link
              href="/contact"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white font-medium rounded-md sm:rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
            >
              <PhoneIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Связаться с нами
            </Link>
            <Link
              href="/about"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 bg-white text-blue-600 font-medium rounded-md sm:rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition-colors text-sm sm:text-base"
            >
              Подробнее о компании
              <ChevronRightIcon className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  </section>
));

CompanySection.displayName = 'CompanySection';

// Компонент мобильного приложения
const MobileAppSection = memo(() => (
  <section className="mb-4 sm:mb-6 md:mb-8 lg:mb-12">
    <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 lg:p-8 border border-blue-200 shadow-sm">
      <div className="text-center max-w-4xl mx-auto">
        <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4">
          {APP_INFO.title}
        </h2>
        <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-700 mb-4 sm:mb-6 md:mb-8">
          {APP_INFO.description}
        </p>

        {/* Преимущества приложения */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-1 sm:gap-2 md:gap-4 mb-4 sm:mb-6 md:mb-8 app-benefits-mobile">
          {APP_INFO.benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-white/50 backdrop-blur-sm p-1 sm:p-2 md:p-4 rounded-md sm:rounded-lg border border-blue-100 app-benefit-mobile"
            >
              <CheckIcon className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-green-500 mx-auto mb-1 sm:mb-2 icon" />
              <p className="text-xs sm:text-sm font-medium text-gray-700">
                {benefit}
              </p>
            </div>
          ))}
        </div>

        {/* Кнопки скачивания */}
        <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 md:mb-8">
          <Link
            href="https://apps.apple.com/ru/app/крон-интернет-магазин/id1611541742"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-initial bg-blue-600 text-white px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-md sm:rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors text-sm sm:text-base"
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
            className="flex-1 sm:flex-initial bg-blue-600 text-white px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-md sm:rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors text-sm sm:text-base"
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

        {/* QR код */}
        <div className="flex justify-center">
          <div className="bg-white p-2 sm:p-3 md:p-4 rounded-md sm:rounded-lg border border-gray-200 shadow-sm">
            <Image
              src="/images/qr-code.svg"
              alt="QR код для скачивания приложения"
              width={100}
              height={100}
              className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28"
            />
            <p className="text-xs sm:text-sm text-gray-600 mt-2 text-center font-medium">
              Сканируйте QR-код
            </p>
          </div>
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
    <div className="h-48 sm:h-64 bg-gray-200 rounded-xl"></div>

    {/* Cards skeleton */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="bg-gray-200 h-32 sm:h-40 rounded-lg"></div>
      ))}
    </div>

    {/* Products skeleton */}
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="bg-gray-200 h-48 sm:h-72 rounded-lg"></div>
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
  // Состояния компонента
  const [sortOrder, setSortOrder] = useState<ProductSortOrder>('NEWEST_FIRST');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [currentRegion, setCurrentRegion] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [hideOutOfStock, setHideOutOfStock] = useState(true);

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
    skip: !currentRegion,
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

  // Эффект для работы с регионом
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
        <section className="mb-4 sm:mb-6 md:mb-8 lg:mb-12">
          <div className="grid grid-cols-3 lg:grid-cols-3 gap-1 sm:gap-2 md:gap-4 lg:gap-6 benefits-grid">
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

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-6">{renderContent()}</main>
    </div>
  );
}
