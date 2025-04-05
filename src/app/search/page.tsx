"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery } from "@apollo/client";
import { GET_PRODUCTS, GET_CATEGORIES } from "@/lib/queries";
import { ProductCard } from "@/components/ProductCard";
import { useSearchParams, useRouter } from "next/navigation";
import { ProductSortOrder, Category, Product } from "@/types/api";
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import Image from "next/image";
import { ProductSorter } from "@/components/ProductSorter";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const searchQuery = searchParams.get("q") || "";
  const initialCategoryId = searchParams.get("category") || "";
  const initialSort =
    (searchParams.get("sort") as ProductSortOrder) || "RELEVANCE";

  const [sortOrder, setSortOrder] = useState<ProductSortOrder>(initialSort);
  const [selectedCategory, setSelectedCategory] =
    useState<string>(initialCategoryId);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [searchInputValue, setSearchInputValue] = useState(searchQuery);

  // Создаем ref для элемента-наблюдателя
  const observerTarget = useRef<HTMLDivElement>(null);

  // Запрос категорий
  const { data: categoriesData, loading: categoriesLoading } =
    useQuery(GET_CATEGORIES);

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
      categoryId: selectedCategory || undefined,
    },
    skip: !searchQuery,
  });

  // Подготовка данных для использования в компоненте
  const categories = categoriesData?.rootCategories || [];
  const products =
    productsData?.products?.edges?.map((edge: any) => edge.node) || [];
  const hasMoreProducts =
    productsData?.products?.pageInfo?.hasNextPage || false;
  const endCursor = productsData?.products?.pageInfo?.endCursor || null;
  const isDataLoading =
    (productsLoading && !products.length) ||
    (categoriesLoading && !categories.length);

  // Получаем общее количество товаров
  const totalProductsCount =
    productsData?.products?.totalCount || products.length;

  // Обновляем URL при изменении фильтров
  useEffect(() => {
    if (searchQuery) {
      const params = new URLSearchParams();
      params.set("q", searchQuery);
      if (selectedCategory) params.set("category", selectedCategory);
      if (sortOrder !== "RELEVANCE") params.set("sort", sortOrder);

      const newUrl = `/search?${params.toString()}`;
      window.history.replaceState({}, "", newUrl);
    }
  }, [selectedCategory, sortOrder, searchQuery]);

  const handleSortChange = (newSortOrder: ProductSortOrder) => {
    setSortOrder(newSortOrder);
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    if (window.innerWidth < 768) {
      setShowMobileFilters(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInputValue.trim()) {
      router.push(
        `/search?q=${encodeURIComponent(searchInputValue)}${
          selectedCategory ? `&category=${selectedCategory}` : ""
        }${sortOrder !== "RELEVANCE" ? `&sort=${sortOrder}` : ""}`
      );
    }
  };

  const toggleMobileFilters = () => {
    setShowMobileFilters(!showMobileFilters);
  };

  // Функция загрузки дополнительных товаров
  const handleLoadMore = useCallback(() => {
    if (hasMoreProducts && !productsLoading && !isLoadingMore) {
      setIsLoadingMore(true);
      fetchMore({
        variables: {
          after: endCursor,
          first: 16,
          sortOrder,
          searchQuery,
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
    hasMoreProducts,
    productsLoading,
    isLoadingMore,
    fetchMore,
    endCursor,
    sortOrder,
    searchQuery,
    selectedCategory,
  ]);

  // Настраиваем Intersection Observer для автоматической подгрузки товаров
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

  // Общий загрузчик для начальной загрузки страницы
  if (isDataLoading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Поиск товаров...</p>
        </div>
      </div>
    );
  }

  if (productsError) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-xl font-semibold text-red-600 mb-2">
          Ошибка при поиске
        </h2>
        <p className="text-gray-600">{productsError.message}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Заголовок и поисковая строка */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {searchQuery
            ? `Результаты поиска: "${searchQuery}"`
            : "Поиск товаров"}
        </h1>

        <form onSubmit={handleSearch} className="relative w-full max-w-2xl">
          <input
            type="text"
            placeholder="Поиск товаров..."
            value={searchInputValue}
            onChange={(e) => setSearchInputValue(e.target.value)}
            className="w-full py-3 px-4 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600"
            aria-label="Поиск"
          >
            <MagnifyingGlassIcon className="h-5 w-5" />
          </button>
        </form>
      </div>

      {!searchQuery ? (
        <div className="bg-blue-50 text-blue-700 p-6 rounded-lg shadow-sm">
          <p className="text-lg">
            Введите поисковый запрос, чтобы найти товары
          </p>
          <p className="text-sm mt-2 text-blue-600">
            Вы можете искать по названию, описанию или категории товара
          </p>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-yellow-50 text-yellow-700 p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium mb-2">
            По вашему запросу ничего не найдено
          </h2>
          <p className="mb-4">Попробуйте:</p>
          <ul className="list-disc list-inside text-sm space-y-1">
            <li>Использовать более общие слова для поиска</li>
            <li>Проверить правильность написания</li>
            <li>Изменить выбранную категорию</li>
          </ul>
          <Link
            href="/"
            className="mt-4 inline-block text-blue-600 hover:text-blue-800"
          >
            Вернуться на главную
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Кнопка мобильных фильтров */}
          <div className="md:hidden mb-4">
            <button
              onClick={toggleMobileFilters}
              className="w-full bg-white border border-gray-200 text-gray-700 py-3 px-4 rounded-lg flex items-center justify-center gap-2 shadow-sm hover:bg-gray-50"
            >
              <AdjustmentsHorizontalIcon className="h-5 w-5" />
              {showMobileFilters ? "Скрыть фильтры" : "Показать фильтры"}
            </button>
          </div>

          {/* Фильтры */}
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

                {/* Фильтр по категориям */}
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-medium text-gray-700 mb-3">Категория</h3>
                  <div className="space-y-2">
                    <div
                      className={`flex items-center p-2 rounded-md cursor-pointer transition-all ${
                        !selectedCategory
                          ? "bg-blue-50 text-blue-700"
                          : "hover:bg-gray-50"
                      }`}
                      onClick={() => handleCategoryChange("")}
                    >
                      <span>Все категории</span>
                    </div>

                    {categories.map((category: Category) => (
                      <div
                        key={category.id}
                        className={`flex items-center p-2 rounded-md cursor-pointer transition-all ${
                          selectedCategory === category.id
                            ? "bg-blue-50 text-blue-700"
                            : "hover:bg-gray-50"
                        }`}
                        onClick={() => handleCategoryChange(category.id)}
                      >
                        {category.iconUrl && (
                          <div className="w-6 h-6 mr-2 flex-shrink-0">
                            <Image
                              src={category.iconUrl}
                              alt={category.title}
                              width={24}
                              height={24}
                              className="object-contain"
                            />
                          </div>
                        )}
                        <span>{category.title}</span>
                      </div>
                    ))}
                  </div>
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
              </div>

              {/* Кнопка сброса фильтров */}
              {(selectedCategory || sortOrder !== "RELEVANCE") && (
                <button
                  onClick={() => {
                    setSelectedCategory("");
                    setSortOrder("RELEVANCE");
                  }}
                  className="flex items-center justify-center w-full py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  <XMarkIcon className="h-4 w-4 mr-2" />
                  Сбросить фильтры
                </button>
              )}
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
                  <ProductSorter
                    value={sortOrder}
                    onChange={handleSortChange}
                  />
                </div>
              </div>
            </div>

            {/* Сетка товаров */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

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
      )}
    </div>
  );
}
