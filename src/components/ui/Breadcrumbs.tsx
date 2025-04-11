"use client";

import React from "react";
import Link from "next/link";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { Category } from "@/types/api";

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
 * Компонент хлебных крошек, показывающий путь навигации
 */
export function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  if (!items || items.length === 0) return null;

  return (
    <nav
      className={`flex overflow-x-auto ${className}`}
      aria-label="Breadcrumb"
    >
      <ol className="inline-flex items-center space-x-1 md:space-x-3 text-sm whitespace-nowrap">
        {items.map((item, index) => (
          <li
            key={`${item.href}-${index}`}
            className={
              index > 0 ? "flex items-center" : "inline-flex items-center"
            }
          >
            {index > 0 && (
              <ChevronRightIcon className="h-4 w-4 text-gray-400 mx-1" />
            )}

            {item.isLast ? (
              <span className="text-gray-700 truncate max-w-[150px] md:max-w-xs font-medium">
                {item.title}
              </span>
            ) : (
              <Link
                href={item.href}
                className="text-gray-500 hover:text-blue-600 transition-colors"
              >
                {item.title}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/**
 * Вспомогательная функция для построения полного пути к категории
 * с учетом всей иерархии предков
 */
export function buildCategoryBreadcrumbs(
  category: Category | undefined,
  includeCategory = true,
): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: "Главная", href: "/" },
    { title: "Категории", href: "/categories" },
  ];

  if (!category) return breadcrumbs;

  // Если это NonRootLeafCategory
  if (category.__typename === "NonRootLeafCategory") {
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
    { title: "Главная", href: "/" },
    { title: "Категории", href: "/categories" },
  ];

  // Если у продукта есть категория
  if (product.category) {
    const category = product.category;

    // Проверяем наличие ancestors или parent
    if (
      category.__typename === "NonRootLeafCategory" &&
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
      category.__typename === "NonRootLeafCategory" &&
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
