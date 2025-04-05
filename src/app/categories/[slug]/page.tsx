"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@apollo/client";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  GET_PRODUCTS,
  GET_CATEGORIES,
  GET_CATEGORY_BY_SLUG,
} from "@/lib/queries";
import { ProductSortOrder, Category, Product } from "@/types/api";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { ProductCard } from "@/components/ProductCard";
import { ProductSorter } from "@/components/ProductSorter";

interface CategoryPageProps {
  params: {
    slug: string;
  };
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const router = useRouter();
  const [sortOrder, setSortOrder] = useState<ProductSortOrder>("NEWEST_FIRST");
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Создаем ref для элемента-наблюдателя
  const observerTarget = useRef<HTMLDivElement>(null);

  // Извлекаем slug из params
  const slug = params.slug;

  // Получаем информацию о категории по slug
  const {
    data: categoryData,
    loading: categoryLoading,
    error: categoryError,
  } = useQuery(GET_CATEGORY_BY_SLUG, {
    variables: { slug },
    skip: !slug,
  });

  // Получаем товары из этой категории с пагинацией
  const {
    data: productsData,
    loading: productsLoading,
    error: productsError,
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
  const products =
    productsData?.products?.edges?.map(
      (edge: { node: Product; cursor: string }) => edge.node
    ) || [];
  const hasMoreProducts =
    productsData?.products?.pageInfo?.hasNextPage || false;
  const endCursor = productsData?.products?.pageInfo?.endCursor || null;
  const isDataLoading = categoryLoading || productsLoading;
  const hasError = categoryError || productsError;

  // Вычисляем примерное общее количество товаров (на основе текущих данных)
  // Обычно сервер возвращает общее количество, но если нет, можно примерно оценить
  const totalProductsCount =
    productsData?.products?.totalCount || products.length;

  const handleLoadMore = useCallback(() => {
    if (hasMoreProducts && !productsLoading && !isLoadingMore) {
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
    hasMoreProducts,
    productsLoading,
    isLoadingMore,
    fetchMore,
    endCursor,
    categoryData,
    sortOrder,
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

  const handleSortChange = (newSortOrder: ProductSortOrder) => {
    setSortOrder(newSortOrder);
  };

  // Рендер состояния загрузки
  if (isDataLoading && !products.length) {
    return (
      <div className="container mx-auto px-4 py-10 flex justify-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-4">
                <div className="h-40 bg-gray-200 rounded-md mb-3"></div>
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Рендер ошибки категории
  if (categoryError) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h2 className="text-lg font-medium text-red-800">
            Ошибка загрузки категории
          </h2>
          <p className="mt-2 text-red-700">{categoryError.message}</p>
          <button
            onClick={() => router.push("/categories")}
            className="mt-4 inline-flex items-center text-red-600 hover:text-red-800"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
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
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h2 className="text-lg font-medium text-red-800">
            Ошибка загрузки товаров
          </h2>
          <p className="mt-2 text-red-700">{productsError.message}</p>
          <button
            onClick={() => router.push("/categories")}
            className="mt-4 inline-flex items-center text-red-600 hover:text-red-800"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Вернуться к списку категорий
          </button>
        </div>
      </div>
    );
  }

  // Если категория не найдена
  if (!category) {
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
            {category.parent && (
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
                <span className="text-gray-500">{category.title}</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
        {category.title}
      </h1>

      {/* Отображаем подкатегории, если они есть */}
      {category.children && category.children.length > 0 && (
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
              )
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

        <ProductSorter value={sortOrder} onChange={handleSortChange} />
      </div>

      {products.length === 0 ? (
        <div className="bg-gray-50 p-8 rounded-lg text-center">
          <p className="text-gray-600">В данной категории нет товаров.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product: Product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Индикатор загрузки дополнительных товаров */}
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
