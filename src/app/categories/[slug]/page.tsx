"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useQuery } from "@apollo/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GET_PRODUCTS, GET_CATEGORY_BY_SLUG } from "@/lib/queries";
import {
  ProductSortOrder,
  Product,
  ProductStockAvailabilityStatus,
} from "@/types/api";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductSorter } from "@/components/product-list/ProductSorter";
import { StockFilter } from "@/components/product-list/StockFilter";

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const router = useRouter();
  const [sortOrder, setSortOrder] = useState<ProductSortOrder>("NEWEST_FIRST");
  const [hideOutOfStock, setHideOutOfStock] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Ref для бесконечной прокрутки
  const observerTarget = useRef<HTMLDivElement>(null);

  // Извлекаем slug из params с помощью React.use()
  const { slug } = React.use(params);

  // Получаем данные о категории по slug
  const {
    data: categoryData,
    error: categoryError,
    loading: categoryLoading,
  } = useQuery(GET_CATEGORY_BY_SLUG, {
    variables: {
      slug: decodeURIComponent(slug),
    },
  });

  // Получаем товары из этой категории с пагинацией
  const {
    data: productsData,
    error: productsError,
    loading: productsLoading,
    fetchMore,
  } = useQuery(GET_PRODUCTS, {
    variables: {
      first: 16, // Загружаем по 16 товаров за раз
      categoryId: categoryData?.categoryBySlug?.id,
      sortOrder: sortOrder,
    },
    skip: !categoryData?.categoryBySlug?.id,
  });

  // Подготовка данных из результатов запросов
  const category = categoryData?.categoryBySlug || null;
  let products =
    productsData?.products?.edges?.map(
      (edge: { node: Product; cursor: string }) => edge.node,
    ) || [];

  // Фильтрация товаров, которых нет в наличии, если включен соответствующий фильтр
  if (hideOutOfStock) {
    products = products.filter(
      (product: Product) =>
        product.stockAvailabilityStatus !==
        ProductStockAvailabilityStatus.OUT_OF_STOCK,
    );
  }

  const hasMoreProducts =
    productsData?.products?.pageInfo?.hasNextPage || false;
  const endCursor = productsData?.products?.pageInfo?.endCursor || null;

  // Вычисляем примерное общее количество товаров (на основе текущих данных)
  // Обычно сервер возвращает общее количество, но если нет, можно примерно оценить
  const totalProductsCount =
    productsData?.products?.totalCount || products.length;

  // Определяем общее состояние загрузки
  const isLoading = categoryLoading || productsLoading;

  // Функция загрузки дополнительных товаров
  const handleLoadMore = useCallback(() => {
    if (hasMoreProducts && !isLoadingMore && fetchMore) {
      setIsLoadingMore(true);
      fetchMore({
        variables: {
          after: endCursor,
          first: 16,
          categoryId: categoryData?.categoryBySlug?.id,
          sortOrder,
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
    isLoadingMore,
    endCursor,
    categoryData?.categoryBySlug?.id,
    sortOrder,
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
      { threshold: 0.1 },
    );

    observer.observe(currentObserverTarget);

    return () => {
      if (currentObserverTarget) {
        observer.unobserve(currentObserverTarget);
      }
    };
  }, [handleLoadMore, hasMoreProducts]);

  // Обработчик изменения сортировки
  const handleSortChange = (newSortOrder: ProductSortOrder) => {
    setSortOrder(newSortOrder);
  };

  // Обработчик изменения фильтра наличия
  const handleStockFilterChange = (newHideOutOfStock: boolean) => {
    setHideOutOfStock(newHideOutOfStock);
  };

  // Рендер скелетона при загрузке
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="mb-6">
          <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        </div>

        <div className="h-8 bg-gray-200 rounded w-2/3 mb-8 animate-pulse"></div>

        <div className="flex justify-between mb-6">
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="flex gap-4">
            <div className="h-10 bg-gray-200 rounded w-40 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="h-72 bg-gray-200 rounded-lg animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  // Рендер ошибки категории
  if (categoryError) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="bg-red-50 p-4 rounded-md">
          <h2 className="text-xl font-semibold text-red-800">
            Ошибка загрузки категории
          </h2>
          <p className="mt-2 text-red-700">{categoryError.message}</p>
          <button
            onClick={() => router.push("/categories")}
            className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Вернуться к списку категорий
          </button>
        </div>
      </div>
    );
  }

  // Рендер ошибки продуктов
  if (productsError) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="bg-red-50 p-4 rounded-md">
          <h2 className="text-xl font-semibold text-red-800">
            Ошибка загрузки товаров
          </h2>
          <p className="mt-2 text-red-700">{productsError.message}</p>
          <button
            onClick={() => router.push("/categories")}
            className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Вернуться к списку категорий
          </button>
        </div>
      </div>
    );
  }

  // Если категория не найдена и загрузка завершена
  if (!category && !isLoading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <h2 className="text-lg font-medium text-yellow-800">
            Категория не найдена
          </h2>
          <p className="mt-2 text-yellow-700">
            Запрашиваемая категория не существует или была удалена.
          </p>
          <Link
            href="/categories"
            className="mt-4 inline-block text-blue-600 hover:text-blue-800"
          >
            Вернуться к списку категорий
          </Link>
        </div>
      </div>
    );
  }

  // Основной рендер страницы категории
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-6">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3 text-sm">
            <li className="inline-flex items-center">
              <Link href="/" className="text-gray-600 hover:text-blue-600">
                Главная
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </span>
                <Link
                  href="/categories"
                  className="text-gray-600 hover:text-blue-600"
                >
                  Категории
                </Link>
              </div>
            </li>
            {/* Показываем родительскую категорию, если она есть */}
            {category?.parent && (
              <li>
                <div className="flex items-center">
                  <span className="mx-2 text-gray-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </span>
                  <Link
                    href={`/categories/${category.parent.slug}`}
                    className="text-gray-600 hover:text-blue-600"
                  >
                    {category.parent.title}
                  </Link>
                </div>
              </li>
            )}
            <li aria-current="page">
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </span>
                <span className="text-gray-500">{category?.title}</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
        {category?.title}
      </h1>

      {/* Отображаем подкатегории, если они есть */}
      {category?.children && category.children.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Подкатегории
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {category.children.map(
              (subcategory: { id: string; title: string; slug: string }) => (
                <Link
                  key={subcategory.id}
                  href={`/categories/${subcategory.slug}`}
                  className="block p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-blue-600"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M2 6a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1H8a3 3 0 00-3 3v1.5a1.5 1.5 0 01-3 0V6z"
                          clipRule="evenodd"
                        />
                        <path d="M6 12a2 2 0 012-2h8a2 2 0 012 2v2a2 2 0 01-2 2H2h2a2 2 0 002-2v-2z" />
                      </svg>
                    </div>
                    <h3 className="text-sm font-medium text-gray-900">
                      {subcategory.title}
                    </h3>
                  </div>
                </Link>
              ),
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6">
        <p className="text-gray-600 mb-4 md:mb-0">
          Всего товаров:{" "}
          <span className="font-medium">{totalProductsCount}</span>
          {products.length < totalProductsCount &&
            ` (загружено ${products.length})`}
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <ProductSorter value={sortOrder} onChange={handleSortChange} />
          <StockFilter
            value={hideOutOfStock}
            onChange={handleStockFilterChange}
          />
        </div>
      </div>

      {products.length === 0 ? (
        <div className="bg-gray-50 p-8 rounded-lg text-center">
          <p className="text-gray-600">В данной категории нет товаров.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product: Product, index: number) => (
              <ProductCard key={`${product.id}-${index}`} product={product} />
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
        </>
      )}
    </div>
  );
}
