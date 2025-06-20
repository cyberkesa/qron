'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';
import { Category } from '@/types/api';

export interface BreadcrumbItem {
  title: string;
  href: string;
  isLast?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

/**
 * Улучшенный компонент хлебных крошек с mobile-first подходом
 * и pixel-perfect версткой
 */
export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items = [],
  className = '',
}) => {
  if (!items || items.length === 0) return null;

  return (
    <nav
      className={`breadcrumb-nav py-2 sm:py-3 w-full ${className}`}
      aria-label="Breadcrumb"
    >
      <ul className="flex flex-wrap items-center space-x-0.5 text-sm">
        {items.map((item, i) => (
          <li key={i} className="flex items-center">
            {i > 0 && (
              <ChevronRightIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gray-400 mx-1.5 sm:mx-2 flex-shrink-0" />
            )}
            {item.isLast ? (
              <span
                className="font-medium text-blue-700 truncate max-w-[120px] sm:max-w-[200px] lg:max-w-none"
                title={item.title}
              >
                {item.title}
              </span>
            ) : (
              <Link
                href={item.href}
                className="text-gray-500 hover:text-gray-900 transition-colors py-1 flex items-center"
                title={item.title}
              >
                {i === 0 && (
                  <HomeIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-0.5 sm:mr-1 flex-shrink-0 text-gray-500" />
                )}
                <span className="truncate max-w-[120px] sm:max-w-xs hover:underline">
                  {item.title}
                </span>
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
};

/**
 * Вспомогательная функция для построения полного пути к категории
 * с учетом всей иерархии предков
 */
export function buildCategoryBreadcrumbs(
  category: Category | undefined,
  includeCategory = true
): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Главная', href: '/' },
    { title: 'Категории', href: '/categories' },
  ];

  if (!category) return breadcrumbs;

  // Если это NonRootLeafCategory
  if (category.__typename === 'NonRootLeafCategory') {
    // Если есть массив предков, добавляем их
    if (category.ancestors && category.ancestors.length > 0) {
      // Добавляем предков в хлебные крошки
      for (const ancestor of category.ancestors) {
        breadcrumbs.push({
          title: ancestor.title,
          href: `/categories/${ancestor.slug}`,
        });
      }
    }
    // Иначе используем родителя, если он есть
    else if (category.parent) {
      breadcrumbs.push({
        title: category.parent.title,
        href: `/categories/${category.parent.slug}`,
      });
    }
  }

  // Добавляем текущую категорию
  if (includeCategory) {
    breadcrumbs.push({
      title: category.title,
      href: `/categories/${category.slug}`,
      isLast: true,
    });
  }

  return breadcrumbs;
}

/**
 * Создает хлебные крошки для страницы товара
 */
export function buildProductBreadcrumbs(product: any): BreadcrumbItem[] {
  if (!product) return [];

  // Базовые хлебные крошки, которые всегда есть
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Главная', href: '/' },
    { title: 'Категории', href: '/categories' },
  ];

  // Если у продукта есть категория
  if (product.category) {
    const category = product.category;

    // Проверяем наличие ancestors или parent
    if (
      category.__typename === 'NonRootLeafCategory' &&
      category.ancestors &&
      category.ancestors.length > 0
    ) {
      // Добавляем предков в цепочку
      for (const ancestor of category.ancestors) {
        breadcrumbs.push({
          title: ancestor.title,
          href: `/categories/${ancestor.slug}`,
        });
      }
    } else if (
      category.__typename === 'NonRootLeafCategory' &&
      category.parent
    ) {
      // Если нет предков, но есть родитель
      breadcrumbs.push({
        title: category.parent.title,
        href: `/categories/${category.parent.slug}`,
      });
    }

    // Добавляем текущую категорию
    breadcrumbs.push({
      title: category.title,
      href: `/categories/${category.slug}`,
    });
  }

  // Добавляем сам товар в цепочку хлебных крошек
  breadcrumbs.push({
    title: product.name,
    href: `/product/${product.slug}`,
    isLast: true,
  });

  return breadcrumbs;
}
