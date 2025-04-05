"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
import { ProductSortOrder, Category, Product } from "@/types/api";
import Link from "next/link";
import {
  ShoppingCartIcon,
  UserIcon,
  FireIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";
import { ProductSorter } from "@/components/ProductSorter";

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

  // Подготовка данных для использования в компоненте
  const user = userData?.viewer;
  const products =
    productsData?.products.edges.map((edge: any) => edge.node) || [];
  const categories = categoriesData?.rootCategories || [];
  const bestDeals = bestDealsData?.bestDealProducts || [];
  const hasMoreProducts = productsData?.products.pageInfo.hasNextPage || false;
  const endCursor = productsData?.products.pageInfo.endCursor || null;
  const isDataLoading =
    productsLoading || categoriesLoading || bestDealsLoading;
  const hasError = productsError || categoriesError || bestDealsError;
  const errorMessage =
    productsError?.message ||
    categoriesError?.message ||
    bestDealsError?.message;

  // Получаем общее количество товаров
  const totalProductsCount =
    productsData?.products?.totalCount || products.length;

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
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    if (window.innerWidth < 768) {
      setShowMobileFilters(false);
    }
  };

  const toggleMobileFilters = () => {
    setShowMobileFilters(!showMobileFilters);
  };

  const handleSortChange = (newSortOrder: ProductSortOrder) => {
    setSortOrder(newSortOrder);
  };

  // Рендер состояния загрузки региона
  if (!currentRegion) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Ожидание выбора региона...</p>
        </div>
      </div>
    );
  }

  // Рендер состояния загрузки данных
  if (isDataLoading && (!products.length || !categories.length)) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка товаров...</p>
        </div>
      </div>
    );
  }

  // Рендер состояния ошибки
  if (hasError) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-xl font-semibold text-red-600 mb-2">
          Ошибка загрузки данных
        </h2>
        <p className="text-gray-600">{errorMessage}</p>
      </div>
    );
  }

  // Основной рендер компонента
  return (
    <main className="container mx-auto px-4 py-6 md:py-8">
      {/* Заголовок и навигация */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Каталог товаров KRON
          </h1>
          <p className="text-gray-600">Найдено товаров: {products.length}</p>
        </div>

        <div className="mt-4 md:mt-0 flex items-center gap-2 md:gap-4 self-end md:self-auto">
          <Link
            href="/cart"
            className="relative text-gray-700 hover:text-blue-600 transition-colors p-2"
          >
            <ShoppingCartIcon className="h-6 w-6" />
          </Link>

          {isAuth ? (
            <Link
              href="/profile"
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors p-2"
            >
              <UserIcon className="h-6 w-6" />
              <span className="hidden md:inline">
                {user?.firstName || "Профиль"}
              </span>
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-gray-700 hover:text-blue-600 transition-colors p-2 flex items-center gap-1"
              >
                <UserIcon className="h-6 w-6" />
                <span className="hidden md:inline">Войти</span>
              </Link>
              <Link
                href="/register"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 hidden md:block"
              >
                Регистрация
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Раздел лучших предложений */}
      {bestDeals.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <FireIcon className="h-6 w-6 text-red-500" />
            <h2 className="text-2xl font-bold text-gray-900">
              Лучшие предложения
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {bestDeals.map((product: Product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}

      {/* Мобильные фильтры */}
      <div className="md:hidden mb-4">
        <button
          onClick={toggleMobileFilters}
          className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-md flex items-center justify-center gap-2"
        >
          <AdjustmentsHorizontalIcon className="h-5 w-5" />
          {showMobileFilters ? "Скрыть фильтры" : "Показать фильтры"}
        </button>
      </div>

      {/* Основной контент */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Боковая панель с фильтрами */}
        <div
          className={`md:col-span-1 ${
            showMobileFilters ? "block" : "hidden md:block"
          }`}
        >
          <div className="sticky top-4">
            <ProductFilters
              categories={categories}
              selectedCategory={selectedCategory}
              sortOrder={sortOrder}
              onCategoryChange={handleCategoryChange}
              onSortChange={handleSortChange}
            />
          </div>
        </div>

        {/* Список товаров */}
        <div className="md:col-span-3">
          {products.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <p className="text-xl text-gray-600">Товары не найдены</p>
              <p className="text-gray-500 mt-2">
                Попробуйте изменить параметры поиска
              </p>
            </div>
          ) : (
            <>
              {/* Информация о количестве товаров */}
              <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <p className="text-gray-600">
                  Всего товаров:{" "}
                  <span className="font-medium">{totalProductsCount}</span>
                  {products.length < totalProductsCount &&
                    ` (загружено ${products.length})`}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product: Product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </>
          )}

          {/* Индикатор загрузки и триггер для подгрузки */}
          {(hasMoreProducts || isLoadingMore) && (
            <div
              ref={observerTarget}
              className="w-full h-16 mt-8 flex justify-center items-center"
            >
              {isLoadingMore ? (
                <div className="flex items-center justify-center">
                  <span className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full mr-2"></span>
                  <span className="text-gray-600">Загрузка...</span>
                </div>
              ) : (
                <div className="text-gray-500 text-sm">
                  Прокрутите вниз, чтобы загрузить еще
                </div>
              )}
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
    </main>
  );
}
