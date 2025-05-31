'use client';

import { useState, memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { Category } from '@/types/api';

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
    <div className="hidden md:block bg-gray-50/50 border-t border-gray-200/60 relative z-40">
      <div className="header-container">
        <div className="flex items-center gap-3 h-10">
          {/* Кнопка категорий */}
          <div
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button
              className={`
                flex items-center gap-2 text-gray-700 hover:text-blue-700 
                h-8 px-3 rounded-lg font-medium text-sm
                transition-all duration-200 active:scale-95
                ${showCategories ? 'bg-blue-50 text-blue-600 shadow-sm border border-blue-100' : 'hover:bg-gray-50 border border-transparent'}
              `}
              onClick={toggleCategories}
            >
              <span>Категории</span>
              <ChevronDownIcon
                className={`h-4 w-4 transition-transform duration-200 ${
                  showCategories ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Выпадающее меню категорий */}
            {showCategories && (
              <div className="absolute left-0 top-full mt-2 bg-white shadow-xl rounded-xl border border-gray-200 w-80 z-60 animate-zoom-in overflow-hidden">
                <div className="py-3 max-h-[70vh] overflow-y-auto custom-scrollbar">
                  {categories.map((category, index) => (
                    <Link
                      key={category.id}
                      href={`/categories/${category.slug}`}
                      className={`
                        flex items-center h-10 px-4 mx-2 text-gray-700 
                        hover:bg-blue-50 hover:text-blue-700 
                        transition-all duration-200 rounded-lg active:scale-95
                        ${index !== categories.length - 1 ? 'mb-1' : ''}
                      `}
                    >
                      {category.iconUrl && (
                        <Image
                          src={category.iconUrl}
                          alt={category.title}
                          width={18}
                          height={18}
                          className="mr-3 object-contain"
                        />
                      )}
                      <span className="font-medium text-sm">
                        {category.title}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Простое горизонтальное меню для основных разделов */}
          <div className="flex items-center gap-3">
            <Link
              href="/catalog"
              className="text-gray-700 hover:text-blue-700 font-medium text-sm transition-all duration-200 px-2 py-1.5 rounded-lg hover:bg-gray-50 active:scale-95"
            >
              Каталог
            </Link>
            <Link
              href="/best-deals"
              className="text-gray-700 hover:text-blue-700 font-medium text-sm transition-all duration-200 px-2 py-1.5 rounded-lg hover:bg-gray-50 active:scale-95"
            >
              Акции
            </Link>
            <Link
              href="/new"
              className="text-gray-700 hover:text-blue-700 font-medium text-sm transition-all duration-200 px-2 py-1.5 rounded-lg hover:bg-gray-50 active:scale-95"
            >
              Новинки
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
});

CategoryNav.displayName = 'CategoryNav';

export default CategoryNav;
