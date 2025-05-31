'use client';

import { useState } from 'react';
import { Product } from '@/types/api';
import {
  calculateProductRelevance,
  normalizeSearchString,
} from './SearchOptimization';

interface SearchDebuggerProps {
  products: Product[];
  searchQuery: string;
  className?: string;
}

export const SearchDebugger = ({
  products,
  searchQuery,
  className = '',
}: SearchDebuggerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!searchQuery || products.length === 0) {
    return null;
  }

  // Рассчитываем релевантность для каждого товара
  const productsWithScores = products
    .map((product) => ({
      product,
      score: calculateProductRelevance(product, searchQuery),
      normalizedName: normalizeSearchString(product.name),
      normalizedQuery: normalizeSearchString(searchQuery),
    }))
    .sort((a, b) => b.score - a.score);

  return (
    <div
      className={`bg-gray-50 border border-gray-200 rounded-lg ${className}`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
      >
        🔍 Отладка поиска ({productsWithScores.length} товаров)
        <span className="float-right">{isOpen ? '▼' : '▶'}</span>
      </button>

      {isOpen && (
        <div className="p-4 border-t border-gray-200 max-h-96 overflow-y-auto">
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <div className="text-sm">
              <strong>Запрос:</strong> &quot;{searchQuery}&quot;
              <br />
              <strong>Нормализованный:</strong> &quot;
              {normalizeSearchString(searchQuery)}&quot;
            </div>
          </div>

          <div className="space-y-3">
            {productsWithScores
              .slice(0, 10)
              .map(({ product, score, normalizedName }, index) => (
                <div
                  key={product.id}
                  className={`p-3 rounded-lg border ${
                    score > 0
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium text-sm">
                      #{index + 1} {product.name}
                    </div>
                    <div
                      className={`px-2 py-1 rounded text-xs font-bold ${
                        score > 50
                          ? 'bg-green-100 text-green-800'
                          : score > 20
                            ? 'bg-yellow-100 text-yellow-800'
                            : score > 0
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {score.toFixed(1)}
                    </div>
                  </div>

                  <div className="text-xs text-gray-600 space-y-1">
                    <div>
                      <strong>Нормализованное название:</strong> &quot;
                      {normalizedName}&quot;
                    </div>

                    {/* Анализ совпадений */}
                    <div className="mt-2">
                      <strong>Анализ совпадений:</strong>
                      <ul className="ml-4 mt-1 space-y-1">
                        {normalizedName.includes(
                          normalizeSearchString(searchQuery)
                        ) && (
                          <li className="text-green-600">
                            ✓ Содержит полный запрос
                          </li>
                        )}
                        {normalizedName.startsWith(
                          normalizeSearchString(searchQuery)
                        ) && (
                          <li className="text-green-600">
                            ✓ Начинается с запроса
                          </li>
                        )}
                        {new RegExp(
                          `\\b${normalizeSearchString(searchQuery)}\\b`
                        ).test(normalizedName) && (
                          <li className="text-green-600">
                            ✓ Содержит как отдельное слово
                          </li>
                        )}
                        {product.category &&
                          normalizeSearchString(
                            product.category.title
                          ).includes(normalizeSearchString(searchQuery)) && (
                            <li className="text-blue-600">
                              ✓ Совпадение в категории: {product.category.title}
                            </li>
                          )}
                        {score === 0 && (
                          <li className="text-red-600">
                            ✗ Нет релевантных совпадений
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* Дополнительная информация */}
                    <div className="mt-2 text-xs">
                      <strong>Категория:</strong>{' '}
                      {product.category?.title || 'Не указана'}
                      <br />
                      <strong>Статус:</strong> {product.stockAvailabilityStatus}
                      <br />
                      <strong>Цена:</strong> {product.price} ₽
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {productsWithScores.length > 10 && (
            <div className="mt-4 text-center text-sm text-gray-500">
              Показано 10 из {productsWithScores.length} товаров
            </div>
          )}
        </div>
      )}
    </div>
  );
};
