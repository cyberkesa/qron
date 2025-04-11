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
import { useInfiniteScroll } from "@/lib/hooks/useInfiniteScroll";
import {
  Breadcrumbs,
  buildCategoryBreadcrumbs,
} from "@/components/ui/Breadcrumbs";

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const router = useRouter();
  const [sortOrder, setSortOrder] = useState<ProductSortOrder>("NEWEST_FIRST");
  const [hideOutOfStock, setHideOutOfStock] = useState(true);

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
      first: 48, // Загружаем по 48 товаров за раз
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

  // Фильтруем товары, которые не в наличии, если включена соответствующая опция
  if (hideOutOfStock) {
    products = products.filter(
      (product: Product) =>
        product.stockAvailabilityStatus ===
          ProductStockAvailabilityStatus.IN_STOCK ||
        product.stockAvailabilityStatus ===
          ProductStockAvailabilityStatus.IN_STOCK_SOON,
    );
  }

  const hasMoreProducts =
    productsData?.products?.pageInfo?.hasNextPage || false;
  const endCursor = productsData?.products?.pageInfo?.endCursor || null;

  // Вычисляем примерное общее количество товаров (на основе текущих данных)
  // Обычно сервер возвращает общее количество, но если нет, можно примерно оценить
  const totalProductsCount = products.length;

  // Определяем общее состояние загрузки
  const isLoading = categoryLoading || productsLoading;

  const { observerTarget, isLoadingMore } = useInfiniteScroll({
    hasMore: productsData?.products?.pageInfo?.hasNextPage || false,
    isLoading: isLoading,
    onLoadMore: async () => {
      if (productsData?.products?.pageInfo?.endCursor) {
        await fetchMore({
          variables: {
            after: productsData.products.pageInfo.endCursor,
            categoryId: categoryData?.categoryBySlug?.id,
            sortOrder,
          },
        });
      }
    },
  });

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
          {Array.from({ length: 16 }).map((_, index) => (
            <div
              key={index}
              className="h-72 bg-gray-200 rounded-lg relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skeleton-loading"></div>
            </div>
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
        <Breadcrumbs items={buildCategoryBreadcrumbs(category)} />
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
              <ProductCard
                key={`category-${product.id}-${index}-${Math.random().toString(36).substring(2, 9)}`}
                product={product}
              />
            ))}
          </div>

          {/* Индикатор загрузки и триггер для подгрузки */}
          {isLoadingMore && (
            <div className="flex justify-center mt-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
          )}

          {/* Сообщение об окончании списка товаров */}
          {!hasMoreProducts && products.length >= 48 && (
            <div className="mt-8 text-center text-gray-500">
              Загружены все доступные товары ({products.length} из{" "}
              {totalProductsCount})
            </div>
          )}

          <div ref={observerTarget} className="h-1" />
        </>
      )}
    </div>
  );
}
