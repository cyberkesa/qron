"use client";

import { useQuery } from "@apollo/client";
import Link from "next/link";
import Image from "next/image";
import { GET_CATEGORIES } from "@/lib/queries";
import { Category } from "@/types/api";

export default function CategoriesPage() {
  const { data, loading, error } = useQuery(GET_CATEGORIES);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="h-10 bg-gray-200 rounded w-56 mb-8 animate-pulse"></div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="p-6 bg-gray-100 rounded-lg animate-pulse"
            >
              <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4"></div>
              <div className="h-7 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
              <div className="h-5 bg-gray-200 rounded w-full mt-4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-xl font-semibold text-red-600 mb-2">
          Ошибка загрузки категорий
        </h2>
        <p className="text-gray-600">{error.message}</p>
      </div>
    );
  }

  const categories = data?.rootCategories || [];

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Категории товаров
      </h1>

      {categories.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-xl text-gray-600">Категории не найдены</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category: Category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              {category.iconUrl && (
                <div className="mb-4 flex justify-center">
                  <Image
                    src={category.iconUrl}
                    alt={category.title}
                    width={80}
                    height={80}
                    className="object-contain"
                  />
                </div>
              )}
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {category.title}
              </h2>
              <p className="text-gray-600">
                Перейти к товарам категории
                <span className="ml-2 text-blue-600">&rarr;</span>
              </p>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
