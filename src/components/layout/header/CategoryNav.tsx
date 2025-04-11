"use client";

import { useState, memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { Category } from "@/types/api";

// Компонент для категорий в навигации
const CategoryNav = memo(({ categories }: { categories: Category[] }) => {
  const [showCategories, setShowCategories] = useState(false);

  const toggleCategories = () => {
    setShowCategories((prev) => !prev);
  };

  const handleMouseEnter = () => {
    setShowCategories(true);
  };

  const handleMouseLeave = () => {
    setShowCategories(false);
  };

  return (
    <div className="hidden md:block bg-gray-50 border-t border-gray-200 relative z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-4 py-2">
          <div
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button
              className={`flex items-center gap-1 text-gray-700 hover:text-blue-600 py-2 px-3 rounded-md ${
                showCategories ? "bg-blue-50 text-blue-600" : ""
              }`}
              onClick={toggleCategories}
            >
              <span className="font-medium">Категории</span>
              <ChevronDownIcon
                className={`h-4 w-4 transition-transform ${
                  showCategories ? "rotate-180" : ""
                }`}
              />
            </button>

            {showCategories && (
              <div className="absolute left-0 top-full mt-1 bg-white shadow-lg rounded-md border border-gray-200 w-64 z-60 animate-zoom-in">
                <div className="py-2 max-h-[70vh] overflow-y-auto">
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/categories/${category.slug}`}
                      className="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      {category.iconUrl && (
                        <Image
                          src={category.iconUrl}
                          alt={category.title}
                          width={16}
                          height={16}
                          className="mr-2"
                        />
                      )}
                      <span>{category.title}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Простое горизонтальное меню для основных разделов */}
          <div className="flex gap-6">
            <Link
              href="/catalog"
              className="text-gray-700 hover:text-blue-600 py-2"
            >
              Каталог
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
});

CategoryNav.displayName = "CategoryNav";

export default CategoryNav;
