"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useLazyQuery } from "@apollo/client";
import { GET_CATEGORIES, GET_PRODUCTS_BY_CATEGORY } from "@/lib/queries";
import { Product, Category, ProductSortOrder } from "@/types/api";
import Link from "next/link";
import { ProductCard } from "@/components/product/ProductCard";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { useCachedQuery } from "@/lib/hooks/useCachedQuery";
import { EmptyState } from "@/components/ui/EmptyState";

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
  const abortControllerRef = useRef<AbortController | null>(null);

  // Get categories with enhanced caching
  const {
    data: categoriesData,
    loading: categoriesLoading,
    error: categoriesError,
    refetch: refetchCategories,
  } = useCachedQuery(GET_CATEGORIES, {
    fetchPolicy: "cache-first",
    cacheTime: 60 * 60 * 1000, // 1 hour cache
    cacheKey: "featured_categories",
    deduplicate: true,
    logErrors: true,
  });

  // Lazy query for getting products by category with cache
  const [getProductsByCategory] = useLazyQuery(GET_PRODUCTS_BY_CATEGORY, {
    fetchPolicy: "cache-first",
  });

  // Create stable seed for consistent shuffling
  const stableSeed = useMemo(() => {
    const today = new Date().toISOString().split("T")[0]; // Use current date as seed
    return [...today].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  }, []);

  // Function to safely get product edges with type checking
  const getProductEdges = (data: any) => {
    if (!data?.products?.edges || !Array.isArray(data.products.edges)) {
      return [];
    }
    return data.products.edges;
  };

  // Function to shuffle array consistently with seed
  const seededShuffle = useCallback(
    (array: any[]) => {
      const result = [...array];
      let m = result.length;

      // Use stable seed for shuffling
      while (m) {
        const i = Math.floor(stableSeed % m--);
        [result[m], result[i]] = [result[i], result[m]];
      }

      return result;
    },
    [stableSeed],
  );

  // Function to fetch products for a category
  const fetchProductsForCategory = useCallback(
    async (category: Category, seenProductIds: Set<string>) => {
      try {
        const { data: productsData } = await getProductsByCategory({
          variables: {
            categoryId: category.id,
            first: 8, // Request more products to have buffer after filtering duplicates
            sortOrder: "NEWEST_FIRST" as ProductSortOrder,
          },
        });

        // Extract products from result and filter duplicates
        const productEdges = getProductEdges(productsData);
        const products = productEdges
          .map((edge: any) => edge.node)
          .filter((product: Product) => {
            // Skip duplicates and products without images
            if (seenProductIds.has(product.id) || !product.images?.length) {
              return false;
            }
            seenProductIds.add(product.id);
            return true;
          });

        // Limit to 4 products per category
        return products.slice(0, 4);
      } catch (err) {
        console.error(
          `Error loading products for category ${category.title}:`,
          err,
        );
        return [];
      }
    },
    [getProductsByCategory],
  );

  // Main data loading function
  const loadFeaturedCategories = useCallback(async () => {
    if (categoriesLoading || !categoriesData?.rootCategories) return;

    // Prevent duplicate loading
    if (dataFetchedRef.current) return;

    // Set up a new abort controller for this operation
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      // Indicate loading state
      dataFetchedRef.current = true;
      setIsLoading(true);
      setError(null);

      // Get all categories including children
      const allCategories: Category[] = [];

      categoriesData.rootCategories.forEach((rootCat: Category) => {
        allCategories.push(rootCat);
        if (rootCat.children && rootCat.children.length) {
          allCategories.push(...rootCat.children);
        }
      });

      // If no categories found, show error
      if (allCategories.length === 0) {
        setError("Категории не найдены");
        setIsLoading(false);
        return;
      }

      // Use stable shuffling instead of random
      const shuffled = seededShuffle(allCategories);
      const randomCategories = shuffled.slice(0, Math.min(5, shuffled.length));

      const categoriesWithProducts = [];
      const seenProductIds = new Set<string>();

      // Load products for each category in parallel
      const productPromises = randomCategories.map((category) =>
        fetchProductsForCategory(category, seenProductIds),
      );

      // Early return if aborted
      if (signal.aborted) return;

      const productsResults = await Promise.all(productPromises);

      // Combine categories with their products
      for (let i = 0; i < randomCategories.length; i++) {
        const products = productsResults[i];

        // Only include categories with products
        if (products.length > 0) {
          categoriesWithProducts.push({
            category: randomCategories[i],
            products,
          });

          // Stop once we have enough categories with products
          if (categoriesWithProducts.length >= 2) {
            break;
          }
        }
      }

      // If no categories with products found, show empty state
      if (categoriesWithProducts.length === 0) {
        setError("Не найдено товаров в выбранных категориях");
      } else {
        setFeaturedCategories(categoriesWithProducts);
      }

      setIsLoading(false);
    } catch (err) {
      if (!signal.aborted) {
        console.error("Error loading featured categories:", err);
        setError("Не удалось загрузить категории товаров");
        setIsLoading(false);
      }
      // Reset flag to allow retry
      dataFetchedRef.current = false;
    }
  }, [
    categoriesData,
    categoriesLoading,
    fetchProductsForCategory,
    seededShuffle,
  ]);

  // Load categories and products
  useEffect(() => {
    if (categoriesError) {
      setError("Ошибка при загрузке категорий товаров");
      setIsLoading(false);
    } else {
      loadFeaturedCategories();
    }

    // Cleanup on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      // If component unmounts during loading, reset flag
      if (isLoading) {
        dataFetchedRef.current = false;
      }
    };
  }, [
    categoriesData,
    categoriesLoading,
    categoriesError,
    loadFeaturedCategories,
    isLoading,
  ]);

  // Handle retry
  const handleRetry = () => {
    dataFetchedRef.current = false;
    setIsLoading(true);
    setError(null);

    // Refetch categories data
    refetchCategories();
  };

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
        <ErrorMessage message={error} onRetry={handleRetry} />
      </div>
    );
  }

  if (!featuredCategories.length) {
    return (
      <EmptyState
        title="Нет популярных категорий"
        description="В данный момент нет доступных популярных категорий"
        actionText="Обновить"
        onAction={handleRetry}
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
