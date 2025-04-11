/**
 * Утилиты для оптимизации поиска
 */

import { Category, Product, ProductStockAvailabilityStatus } from "@/types/api";

/**
 * Нормализует строку для поиска:
 * - Приводит к нижнему регистру
 * - Удаляет множественные пробелы
 * - Удаляет диакритические знаки и специальные символы
 */
export function normalizeSearchString(text: string): string {
  if (!text) return "";

  // Приводим к нижнему регистру и удаляем множественные пробелы
  let normalized = text.toLowerCase().trim().replace(/\s+/g, " ");

  // Удаляем диакритические знаки (например, преобразуем "é" в "e")
  normalized = normalized.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // Транслитерация русских символов (пример: "лопата" -> "lopata")
  // Это поможет найти результаты даже если пользователь случайно переключился
  // на другую раскладку
  const russianMap: Record<string, string> = {
    а: "a",
    б: "b",
    в: "v",
    г: "g",
    д: "d",
    е: "e",
    ё: "yo",
    ж: "zh",
    з: "z",
    и: "i",
    й: "y",
    к: "k",
    л: "l",
    м: "m",
    н: "n",
    о: "o",
    п: "p",
    р: "r",
    с: "s",
    т: "t",
    у: "u",
    ф: "f",
    х: "h",
    ц: "ts",
    ч: "ch",
    ш: "sh",
    щ: "sch",
    ъ: "",
    ы: "y",
    ь: "",
    э: "e",
    ю: "yu",
    я: "ya",
  };

  return normalized;
}

/**
 * Рассчитывает оценку релевантности для товара по поисковому запросу
 */
export function calculateProductRelevance(
  product: Product,
  searchQuery: string,
): number {
  if (!searchQuery || !product) return 0;

  const normalizedQuery = normalizeSearchString(searchQuery);

  if (!normalizedQuery) return 0;

  // Базовая оценка для каждого товара
  let score = 0;

  // Название продукта имеет наибольший вес
  const normalizedName = normalizeSearchString(product.name);

  // Проверяем точное соответствие названия (максимальный приоритет)
  if (normalizedName === normalizedQuery) {
    score += 100;
  }
  // Проверяем, начинается ли название с поискового запроса
  else if (normalizedName.startsWith(normalizedQuery)) {
    score += 80;
  }
  // Проверяем, содержит ли название поисковый запрос как отдельное слово
  else if (new RegExp(`\\b${normalizedQuery}\\b`).test(normalizedName)) {
    score += 60;
  }
  // Проверяем, содержит ли название поисковый запрос
  else if (normalizedName.includes(normalizedQuery)) {
    score += 40;
  }

  // Проверяем описание (если оно есть)
  if (product.description) {
    const normalizedDesc = normalizeSearchString(product.description);
    if (normalizedDesc.includes(normalizedQuery)) {
      score += 20;
    }
  }

  // Проверяем категорию (если она есть)
  if (product.category && product.category.title) {
    const normalizedCategory = normalizeSearchString(product.category.title);
    if (normalizedCategory.includes(normalizedQuery)) {
      score += 10;
    }
  }

  // Учитываем наличие товара (в наличии имеет приоритет)
  if (
    product.stockAvailabilityStatus === ProductStockAvailabilityStatus.IN_STOCK
  ) {
    score += 5;
  }

  return score;
}

/**
 * Сортирует результаты поиска по релевантности
 */
export function sortProductsByRelevance(
  products: Product[],
  searchQuery: string,
): Product[] {
  const normalizedQuery = normalizeSearchString(searchQuery);

  if (!normalizedQuery || !products.length) return products;

  // Рассчитываем релевантность для каждого товара и храним её локально
  const productsWithRelevance = products.map((product) => {
    const relevanceScore = calculateProductRelevance(product, normalizedQuery);
    return { product, relevanceScore };
  });

  // Сортируем по релевантности (от высокой к низкой)
  productsWithRelevance.sort((a, b) => b.relevanceScore - a.relevanceScore);

  // Возвращаем исходные объекты продуктов, но в отсортированном порядке
  return productsWithRelevance.map((item) => item.product);
}

/**
 * Фильтрует дубликаты товаров
 */
export function removeDuplicateProducts(products: Product[]): Product[] {
  const uniqueProductIds = new Set();
  const uniqueProducts: Product[] = [];

  for (const product of products) {
    if (!uniqueProductIds.has(product.id)) {
      uniqueProductIds.add(product.id);
      uniqueProducts.push(product);
    }
  }

  return uniqueProducts;
}

/**
 * Полностью обрабатывает результаты поиска:
 * - Удаляет дубликаты
 * - Сортирует по релевантности
 * - При необходимости фильтрует по наличию
 */
export function processSearchResults(
  products: Product[],
  searchQuery: string,
  hideOutOfStock = true,
): Product[] {
  // Удаляем дубликаты
  let processedProducts = removeDuplicateProducts(products);

  // Сортируем по релевантности
  processedProducts = sortProductsByRelevance(processedProducts, searchQuery);

  // Фильтруем отсутствующие товары, если нужно
  if (hideOutOfStock) {
    processedProducts = processedProducts.filter(
      (product) =>
        product.stockAvailabilityStatus !==
        ProductStockAvailabilityStatus.OUT_OF_STOCK,
    );
  }

  return processedProducts;
}
