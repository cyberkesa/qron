/**
 * Утилиты для оптимизации поиска
 */

import { Category, Product, ProductStockAvailabilityStatus } from '@/types/api';

// Расширенный словарь синонимов для улучшения поиска
const synonyms: Record<string, string[]> = {
  лопата: ['совок', 'копалка', 'штык', 'заступ'],
  молоток: ['кувалда', 'киянка', 'молот'],
  отвертка: ['шуруповерт', 'винтоверт'],
  пила: ['ножовка', 'циркулярка', 'электропила'],
  дрель: ['перфоратор', 'бормашина', 'дрель-шуруповерт'],
  краска: ['эмаль', 'лак', 'грунт', 'грунтовка'],
  гвозди: ['саморезы', 'шурупы', 'болты', 'винты'],
  провод: ['кабель', 'шнур', 'проводка', 'электропровод'],
  лампа: ['светильник', 'люстра', 'бра', 'лампочка'],
  шланг: ['рукав', 'трубка гибкая', 'поливочный шланг'],
  труба: ['трубка', 'трубопровод'],
  ключ: ['ключи', 'гаечный ключ', 'разводной ключ'],
  плитка: ['кафель', 'керамогранит', 'плитка керамическая'],
  цемент: ['бетон', 'раствор', 'смесь строительная'],
  песок: ['песок строительный', 'песок речной'],
  кирпич: ['блок', 'кирпич строительный'],
  пленка: [
    'полиэтилен',
    'полиэтиленовая пленка',
    'п/э',
    'пэ пленка',
    'укрывной материал',
  ],
  лестница: [
    'стремянка',
    'лестницы',
    'стремянки',
    'вышка',
    'подмости',
    'стеллаж',
  ],
};

// Стоп-слова, которые не влияют на релевантность
const stopWords = new Set([
  'и',
  'в',
  'на',
  'с',
  'по',
  'для',
  'от',
  'до',
  'из',
  'к',
  'о',
  'об',
  'при',
  'про',
  'под',
  'над',
  'за',
  'перед',
  'между',
  'через',
  'без',
  'со',
  'во',
  'ко',
  'ото',
  'изо',
  'что',
  'как',
  'где',
  'когда',
  'почему',
  'или',
  'но',
  'да',
  'нет',
  'это',
  'тот',
  'этот',
  'такой',
  'который',
]);

/**
 * Нормализует строку для поиска:
 * - Приводит к нижнему регистру
 * - Удаляет множественные пробелы
 * - Удаляет диакритические знаки и специальные символы
 * - Применяет транслитерацию
 */
export function normalizeSearchString(text: string): string {
  if (!text) return '';

  // Приводим к нижнему регистру и удаляем множественные пробелы
  let normalized = text.toLowerCase().trim().replace(/\s+/g, ' ');

  // Удаляем диакритические знаки (например, преобразуем "é" в "e")
  normalized = normalized.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // Транслитерация русских символов для поддержки разных раскладок
  const russianMap: Record<string, string> = {
    а: 'a',
    б: 'b',
    в: 'v',
    г: 'g',
    д: 'd',
    е: 'e',
    ё: 'yo',
    ж: 'zh',
    з: 'z',
    и: 'i',
    й: 'y',
    к: 'k',
    л: 'l',
    м: 'm',
    н: 'n',
    о: 'o',
    п: 'p',
    р: 'r',
    с: 's',
    т: 't',
    у: 'u',
    ф: 'f',
    х: 'h',
    ц: 'ts',
    ч: 'ch',
    ш: 'sh',
    щ: 'sch',
    ъ: '',
    ы: 'y',
    ь: '',
    э: 'e',
    ю: 'yu',
    я: 'ya',
  };

  // Применяем транслитерацию
  normalized = normalized
    .split('')
    .map((char) => russianMap[char] || char)
    .join('');

  // Удаляем специальные символы, оставляем только буквы, цифры и пробелы
  normalized = normalized
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return normalized;
}

/**
 * Получает синонимы для слова
 */
function getSynonyms(word: string): string[] {
  const normalizedWord = normalizeSearchString(word);

  // Ищем прямые синонимы
  if (synonyms[normalizedWord]) {
    return synonyms[normalizedWord];
  }

  // Ищем обратные синонимы (если слово является синонимом)
  for (const [key, values] of Object.entries(synonyms)) {
    if (
      values.some(
        (synonym) => normalizeSearchString(synonym) === normalizedWord
      )
    ) {
      return [
        key,
        ...values.filter((v) => normalizeSearchString(v) !== normalizedWord),
      ];
    }
  }

  return [];
}

/**
 * Разбивает запрос на значимые слова
 */
function extractKeywords(query: string): string[] {
  return normalizeSearchString(query)
    .split(' ')
    .filter((word) => word.length > 2 && !stopWords.has(word)); // Увеличиваем минимальную длину до 3
}

/**
 * Вычисляет расстояние Левенштейна для нечеткого поиска
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1)
    .fill(null)
    .map(() => Array(str1.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }

  return matrix[str2.length][str1.length];
}

/**
 * Проверяет нечеткое совпадение (с учетом опечаток)
 * Ужесточаем критерии для более точного поиска
 */
function fuzzyMatch(
  text: string,
  query: string,
  threshold: number = 0.85
): number {
  // Не применяем нечеткий поиск для коротких слов
  if (query.length < 5 || text.length < 5) {
    return 0;
  }

  // Не применяем нечеткий поиск если разница в длине слишком большая
  if (Math.abs(text.length - query.length) > 1) {
    return 0;
  }

  // Проверяем, что слова имеют хотя бы 50% общих символов
  const queryChars = new Set(query.split(''));
  const textChars = new Set(text.split(''));
  const commonChars = [...queryChars].filter((char) => textChars.has(char));
  const commonRatio =
    commonChars.length / Math.max(queryChars.size, textChars.size);

  if (commonRatio < 0.5) {
    return 0;
  }

  const distance = levenshteinDistance(text, query);
  const maxLength = Math.max(text.length, query.length);
  const similarity = 1 - distance / maxLength;

  return similarity >= threshold ? similarity : 0;
}

/**
 * Проверяет семантическую близость между запросом и названием товара
 */
function checkSemanticRelevance(
  productName: string,
  searchQuery: string
): boolean {
  const normalizedName = normalizeSearchString(productName);
  const normalizedQuery = normalizeSearchString(searchQuery);

  // Список категорий товаров для проверки семантической близости
  const categories = {
    инструменты: [
      'дрель',
      'молоток',
      'отвертка',
      'пила',
      'ключ',
      'лопата',
      'ножницы',
      'кусачки',
      'плоскогубцы',
      'лестница',
      'стремянка',
    ],
    сантехника: ['труба', 'шланг', 'кран', 'смеситель', 'унитаз'],
    электрика: ['провод', 'кабель', 'лампа', 'светильник', 'розетка'],
    стройматериалы: [
      'цемент',
      'песок',
      'кирпич',
      'плитка',
      'краска',
      'пленка',
      'полиэтилен',
      'лестницы',
      'стремянки',
      'вышки',
    ],
    садовые_товары: [
      'лейка',
      'шланг поливочный',
      'грабли',
      'секатор',
      'ножницы садовые',
      'пленка укрывная',
    ],
    хозтовары: [
      'сумка',
      'ведро',
      'тряпка',
      'щетка',
      'веник',
      'пакеты',
      'мешки',
    ],
  };

  // Определяем категорию запроса
  let queryCategory = '';
  for (const [category, items] of Object.entries(categories)) {
    if (
      items.some((item) =>
        normalizedQuery.includes(normalizeSearchString(item))
      )
    ) {
      queryCategory = category;
      break;
    }
  }

  // Если категория определена, проверяем соответствие товара
  if (queryCategory) {
    const categoryItems = categories[queryCategory as keyof typeof categories];
    const hasMatch = categoryItems.some((item) =>
      normalizedName.includes(normalizeSearchString(item))
    );

    // Если товар не соответствует категории запроса, снижаем релевантность
    if (!hasMatch && queryCategory !== 'хозтовары') {
      return false;
    }
  }

  return true;
}

/**
 * Проверяет, является ли совпадение релевантным
 */
function isRelevantMatch(productName: string, searchQuery: string): boolean {
  const normalizedName = normalizeSearchString(productName);
  const normalizedQuery = normalizeSearchString(searchQuery);

  // Если запрос очень короткий, требуем точного совпадения
  if (normalizedQuery.length <= 3) {
    return normalizedName.includes(normalizedQuery);
  }

  // Проверяем семантическую близость
  if (!checkSemanticRelevance(productName, searchQuery)) {
    return false;
  }

  // Для длинных запросов проверяем, есть ли хотя бы какое-то совпадение
  const keywords = extractKeywords(searchQuery);

  // Проверяем, есть ли совпадения по ключевым словам
  const hasKeywordMatch = keywords.some((keyword) => {
    if (normalizedName.includes(keyword)) {
      return true;
    }

    // Проверяем синонимы
    if (keyword.length > 3) {
      const synonymList = getSynonyms(keyword);
      return synonymList.some((synonym) => {
        const normalizedSynonym = normalizeSearchString(synonym);
        return normalizedName.includes(normalizedSynonym);
      });
    }

    return false;
  });

  // Проверяем прямое включение запроса в название
  const hasDirectMatch = normalizedName.includes(normalizedQuery);

  return hasKeywordMatch || hasDirectMatch;
}

/**
 * Рассчитывает оценку релевантности для товара по поисковому запросу
 */
export function calculateProductRelevance(
  product: Product,
  searchQuery: string
): number {
  if (!searchQuery || !product) return 0;

  const normalizedQuery = normalizeSearchString(searchQuery);
  if (!normalizedQuery) return 0;

  // Проверяем релевантность перед расчетом
  if (!isRelevantMatch(product.name, searchQuery)) {
    return 0;
  }

  const keywords = extractKeywords(searchQuery);
  let score = 0;

  // Название продукта имеет наибольший вес
  const normalizedName = normalizeSearchString(product.name);

  // 1. Точные совпадения (максимальный приоритет)
  if (normalizedName === normalizedQuery) {
    score += 100;
  }
  // 2. Название начинается с поискового запроса
  else if (normalizedName.startsWith(normalizedQuery)) {
    score += 80;
  }
  // 3. Название содержит поисковый запрос как отдельное слово
  else if (new RegExp(`\\b${normalizedQuery}\\b`).test(normalizedName)) {
    score += 60;
  }
  // 4. Название содержит поисковый запрос
  else if (normalizedName.includes(normalizedQuery)) {
    score += 40;
  }

  // 5. Проверяем совпадения по ключевым словам
  keywords.forEach((keyword) => {
    if (normalizedName.includes(keyword)) {
      score += 15;
    }

    // Проверяем синонимы (только для слов длиннее 3 символов)
    if (keyword.length > 3) {
      const synonymList = getSynonyms(keyword);
      synonymList.forEach((synonym) => {
        const normalizedSynonym = normalizeSearchString(synonym);
        if (normalizedName.includes(normalizedSynonym)) {
          score += 12; // Увеличиваем вес синонимов
        }
      });
    }

    // Нечеткий поиск для обработки опечаток (только для длинных слов)
    if (keyword.length >= 5) {
      // Увеличиваем минимальную длину до 5 символов
      const nameWords = normalizedName.split(' ');
      nameWords.forEach((nameWord) => {
        if (nameWord.length >= 5) {
          // Увеличиваем минимальную длину до 5 символов
          const fuzzyScore = fuzzyMatch(nameWord, keyword, 0.95); // Еще больше повышаем порог
          if (fuzzyScore > 0) {
            score += fuzzyScore * 3; // Еще больше снижаем вес нечеткого поиска
          }
        }
      });
    }
  });

  // 6. Проверяем описание (если оно есть)
  if (product.description) {
    const normalizedDesc = normalizeSearchString(product.description);

    if (normalizedDesc.includes(normalizedQuery)) {
      score += 20;
    }

    keywords.forEach((keyword) => {
      if (normalizedDesc.includes(keyword)) {
        score += 5;
      }

      // Синонимы в описании
      if (keyword.length > 3) {
        const synonymList = getSynonyms(keyword);
        synonymList.forEach((synonym) => {
          const normalizedSynonym = normalizeSearchString(synonym);
          if (normalizedDesc.includes(normalizedSynonym)) {
            score += 3;
          }
        });
      }
    });
  }

  // 7. Проверяем категорию (если она есть)
  if (product.category && product.category.title) {
    const normalizedCategory = normalizeSearchString(product.category.title);

    if (normalizedCategory.includes(normalizedQuery)) {
      score += 15;
    }

    keywords.forEach((keyword) => {
      if (normalizedCategory.includes(keyword)) {
        score += 8;
      }
    });
  }

  // 8. Бонусы за характеристики товара

  // Товар в наличии имеет приоритет
  if (
    product.stockAvailabilityStatus === ProductStockAvailabilityStatus.IN_STOCK
  ) {
    score += 5;
  }

  // Товары с изображениями более релевантны
  if (product.images && product.images.length > 0) {
    score += 2;
  }

  return Math.round(score * 100) / 100; // Округляем до 2 знаков
}

/**
 * Сортирует результаты поиска по релевантности
 */
export function sortProductsByRelevance(
  products: Product[],
  searchQuery: string
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
 * - Фильтрует товары с нулевой релевантностью
 * - Сортирует по релевантности
 * - При необходимости фильтрует по наличию
 */
export function processSearchResults(
  products: Product[],
  searchQuery: string,
  hideOutOfStock = true
): Product[] {
  const normalizedQuery = normalizeSearchString(searchQuery);

  // Если нет поискового запроса, возвращаем все товары
  if (!normalizedQuery) {
    return hideOutOfStock
      ? products.filter(
          (product) =>
            product.stockAvailabilityStatus !==
            ProductStockAvailabilityStatus.OUT_OF_STOCK
        )
      : products;
  }

  // Удаляем дубликаты
  let processedProducts = removeDuplicateProducts(products);

  // Фильтруем товары с нулевой релевантностью (нерелевантные товары)
  processedProducts = processedProducts.filter((product) => {
    const relevanceScore = calculateProductRelevance(product, normalizedQuery);
    return relevanceScore > 0;
  });

  // Сортируем по релевантности
  processedProducts = sortProductsByRelevance(processedProducts, searchQuery);

  // Фильтруем отсутствующие товары, если нужно
  if (hideOutOfStock) {
    processedProducts = processedProducts.filter(
      (product) =>
        product.stockAvailabilityStatus !==
        ProductStockAvailabilityStatus.OUT_OF_STOCK
    );
  }

  return processedProducts;
}
