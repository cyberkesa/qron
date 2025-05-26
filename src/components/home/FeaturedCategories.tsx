'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { GET_CATEGORIES, GET_PRODUCTS_BY_CATEGORY } from '@/lib/queries';
import { Product, Category, ProductSortOrder } from '@/types/api';
import Link from 'next/link';
import { ProductCard } from '@/components/product/ProductCard';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { EmptyState } from '@/components/ui/EmptyState';

interface FeaturedCategoryProps {
  category: Category;
  products: Product[];
}

// Component for a single featured category with its products
const FeaturedCategory = ({ category, products }: FeaturedCategoryProps) => {
  if (!products.length) return null;

  return (
    <div className="mb-8 pt-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">
            {category.title}
          </h2>
        </div>
        <Link
          href={`/categories/${category.slug}`}
          className="flex items-center text-blue-600 hover:text-blue-800 transition-colors text-sm"
        >
          Все товары
          <ChevronRightIcon className="ml-1 w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {products.map((product) => (
          <ProductCard
            key={`featured-${category.id}-${product.id}`}
            product={product}
          />
        ))}
      </div>
    </div>
  );
};

export const FeaturedCategories = () => {
  const [featuredCategories, setFeaturedCategories] = useState<
    Array<{ category: Category; products: Product[] }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dataFetchedRef = useRef(false);

  // Получаем категории с кэшированием
  const {
    data: categoriesData,
    loading: categoriesLoading,
    error: categoriesError,
  } = useQuery(GET_CATEGORIES, {
    fetchPolicy: 'cache-first',
    nextFetchPolicy: 'cache-first',
  });

  // Получаем продукты для категорий одним запросом
  const { data: productsData, loading: productsLoading } = useQuery(
    GET_PRODUCTS_BY_CATEGORY,
    {
      variables: {
        first: 20, // Запрашиваем больше продуктов для всех категорий сразу
        sortOrder: 'NEWEST_FIRST' as ProductSortOrder,
      },
      skip: !categoriesData?.rootCategories?.length,
      fetchPolicy: 'cache-first',
      nextFetchPolicy: 'cache-first',
    }
  );

  // Обработка данных категорий и продуктов
  useEffect(() => {
    if (
      categoriesLoading ||
      productsLoading ||
      !categoriesData?.rootCategories ||
      !productsData?.products
    ) {
      return;
    }

    if (dataFetchedRef.current) return;

    try {
      const allProducts = productsData.products.edges.map(
        (edge: any) => edge.node
      );
      const seenProductIds = new Set<string>();
      const categoriesWithProducts = [];

      // Берем первые 2 категории с достаточным количеством продуктов
      for (const category of categoriesData.rootCategories) {
        const categoryProducts = allProducts
          .filter((product: Product) => {
            if (
              product.category?.id === category.id &&
              !seenProductIds.has(product.id)
            ) {
              seenProductIds.add(product.id);
              return true;
            }
            return false;
          })
          .slice(0, 4);

        if (categoryProducts.length > 0) {
          categoriesWithProducts.push({
            category,
            products: categoryProducts,
          });

          if (categoriesWithProducts.length >= 2) break;
        }
      }

      setFeaturedCategories(categoriesWithProducts);
      setIsLoading(false);
      dataFetchedRef.current = true;
    } catch (err) {
      console.error('Error processing featured categories:', err);
      setError('Не удалось загрузить популярные категории');
      setIsLoading(false);
    }
  }, [categoriesData, productsData, categoriesLoading, productsLoading]);

  // Обработка ошибок
  useEffect(() => {
    if (categoriesError) {
      setError('Ошибка при загрузке категорий');
      setIsLoading(false);
    }
  }, [categoriesError]);

  if (isLoading) {
    return (
      <div className="py-8">
        <LoadingSpinner
          size="lg"
          showText
          text="Загрузка популярных категорий..."
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-4">
        <ErrorMessage
          message={error}
          onRetry={() => {
            dataFetchedRef.current = false;
            setIsLoading(true);
            setError(null);
          }}
        />
      </div>
    );
  }

  if (!featuredCategories.length) {
    return (
      <EmptyState
        title="Нет популярных категорий"
        description="В данный момент нет доступных популярных категорий"
        actionText="Обновить"
        onAction={() => {
          dataFetchedRef.current = false;
          setIsLoading(true);
          setError(null);
        }}
      />
    );
  }

  return (
    <div className="mb-12">
      <div className="divide-y divide-gray-100">
        {featuredCategories.map((item) => (
          <FeaturedCategory
            key={`featured-category-${item.category.id}`}
            category={item.category}
            products={item.products}
          />
        ))}
      </div>
    </div>
  );
};
