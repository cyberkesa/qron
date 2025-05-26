'use client';

import React, { useState, useCallback } from 'react';
import { useQuery } from '@apollo/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GET_PRODUCTS, GET_CATEGORY_BY_SLUG } from '@/lib/queries';
import {
  ProductSortOrder,
  Product,
  ProductStockAvailabilityStatus,
} from '@/types/api';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductSorter } from '@/components/product-list/ProductSorter';
import { StockFilter } from '@/components/product-list/StockFilter';
import { useInfiniteScroll } from '@/lib/hooks/useInfiniteScroll';
import {
  Breadcrumbs,
  buildCategoryBreadcrumbs,
} from '@/components/ui/Breadcrumbs';

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const router = useRouter();
  const [sortOrder, setSortOrder] = useState<ProductSortOrder>('NEWEST_FIRST');
  const [hideOutOfStock, setHideOutOfStock] = useState(true);

  const { slug } = React.use(params);

  const {
    data: categoryData,
    error: categoryError,
    loading: categoryLoading,
  } = useQuery(GET_CATEGORY_BY_SLUG, {
    variables: {
      slug: decodeURIComponent(slug),
    },
  });

  const {
    data: productsData,
    error: productsError,
    loading: productsLoading,
    fetchMore,
  } = useQuery(GET_PRODUCTS, {
    variables: {
      first: 100,
      categoryId: categoryData?.categoryBySlug?.id,
      sortOrder,
    },
    skip: !categoryData?.categoryBySlug?.id,
  });

  const category = categoryData?.categoryBySlug || null;
  let products =
    productsData?.products?.edges?.map(
      (edge: { node: Product; cursor: string }) => edge.node
    ) || [];

  if (hideOutOfStock) {
    products = products.filter(
      (product: Product) =>
        product.stockAvailabilityStatus ===
          ProductStockAvailabilityStatus.IN_STOCK ||
        product.stockAvailabilityStatus ===
          ProductStockAvailabilityStatus.IN_STOCK_SOON
    );
  }

  const hasMoreProducts =
    productsData?.products?.pageInfo?.hasNextPage || false;
  const totalProductsCount = products.length;
  const isLoading = categoryLoading || productsLoading;

  const handleSortChange = useCallback((newSortOrder: ProductSortOrder) => {
    setSortOrder(newSortOrder);
  }, []);

  const handleStockFilterChange = useCallback((newHideOutOfStock: boolean) => {
    setHideOutOfStock(newHideOutOfStock);
  }, []);

  const { observerTarget, isLoadingMore } = useInfiniteScroll({
    hasMore: hasMoreProducts,
    isLoading,
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

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-6">
        <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse mb-6"></div>
        <div className="h-8 bg-gray-200 rounded w-2/3 mb-8 animate-pulse"></div>
        <div className="flex justify-between mb-6 gap-4">
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="flex gap-4">
            <div className="h-10 bg-gray-200 rounded w-40 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
          {Array.from({ length: 12 }).map((_, index) => (
            <div
              key={index}
              className="h-48 sm:h-56 lg:h-64 bg-gray-200 rounded-lg animate-pulse"
            ></div>
          ))}
        </div>
      </main>
    );
  }

  if (categoryError) {
    return (
      <main className="container mx-auto px-4 py-6">
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <h2 className="text-xl font-semibold text-red-800">
            Ошибка загрузки категории
          </h2>
          <p className="mt-2 text-red-700">{categoryError.message}</p>
          <button
            onClick={() => router.push('/categories')}
            className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Вернуться к списку категорий
          </button>
        </div>
      </main>
    );
  }

  if (productsError) {
    return (
      <main className="container mx-auto px-4 py-6">
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <h2 className="text-xl font-semibold text-red-800">
            Ошибка загрузки товаров
          </h2>
          <p className="mt-2 text-red-700">{productsError.message}</p>
          <button
            onClick={() => router.push('/categories')}
            className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Вернуться к списку категорий
          </button>
        </div>
      </main>
    );
  }

  if (!category && !isLoading) {
    return (
      <main className="container mx-auto px-4 py-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
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
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-6">
      {/* Хлебные крошки */}
      <Breadcrumbs
        items={buildCategoryBreadcrumbs(category)}
        className="mb-6"
      />

      {/* Заголовок категории */}
      <header className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
          {category?.title}
        </h1>
        {category?.description && (
          <div
            className="text-gray-600 text-sm"
            dangerouslySetInnerHTML={{ __html: category.description }}
          />
        )}
      </header>

      {/* Подкатегории */}
      {category?.children && category.children.length > 0 && (
        <section className="mb-8 bg-white p-4 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <svg
              className="h-5 w-5 mr-2 text-blue-600"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
            </svg>
            Подкатегории
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {category.children.map(
              (subcategory: { id: string; title: string; slug: string }) => (
                <Link
                  key={subcategory.id}
                  href={`/categories/${subcategory.slug}`}
                  className="group block p-3 bg-gray-50 hover:bg-white rounded-lg hover:shadow-md transition-all border border-gray-100 hover:border-blue-200"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 group-hover:bg-blue-200 transition-colors">
                      <svg
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
                    <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                      {subcategory.title}
                    </h3>
                  </div>
                </Link>
              )
            )}
          </div>
        </section>
      )}

      {/* Панель управления */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-gray-200">
        <p className="text-gray-600 flex items-center text-sm">
          <svg
            className="h-4 w-4 mr-2 text-blue-600"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" />
            <path d="M5 3a2 2 0 00-2 2v6a2 2 0 002 2V5h8a2 2 0 00-2-2H5z" />
          </svg>
          Товаров:{' '}
          <span className="font-medium ml-1">{totalProductsCount}</span>
        </p>
        <div className="flex gap-3">
          <ProductSorter value={sortOrder} onChange={handleSortChange} />
          <StockFilter
            value={hideOutOfStock}
            onChange={handleStockFilterChange}
          />
        </div>
      </div>

      {/* Список товаров */}
      {products.length === 0 ? (
        <div className="bg-gray-50 p-8 rounded-lg text-center">
          <svg
            className="h-12 w-12 mx-auto text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-gray-600 mb-2">
            В данной категории пока нет товаров.
          </p>
          <p className="text-gray-500 text-sm">
            Пожалуйста, посмотрите другие категории или свяжитесь с нами для
            уточнения информации.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
            {products.map((product: Product, index: number) => (
              <ProductCard
                key={`category-${product.id}-${index}`}
                product={product}
              />
            ))}
          </div>

          {isLoadingMore && (
            <div className="flex justify-center mt-8">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
            </div>
          )}

          {!hasMoreProducts && products.length >= 100 && (
            <div className="mt-8 text-center text-gray-500 bg-gray-50 p-4 rounded-lg border border-gray-200">
              Загружены все доступные товары
              <span className="font-medium text-gray-700">
                {' '}
                ({products.length} из {totalProductsCount})
              </span>
            </div>
          )}

          <div ref={observerTarget} className="h-1" />
        </>
      )}
    </main>
  );
}
