import {Product} from '@/types/api';
import {useCallback, useEffect, useState} from 'react';

const VIEW_HISTORY_KEY = 'kron_view_history';
const MAX_HISTORY_ITEMS = 20;

interface ViewHistoryItem {
  product: Product;
  timestamp: number;
}

export function useViewHistory() {
  const [history, setHistory] = useState<ViewHistoryItem[]>([]);

  useEffect(() => {
    // Загружаем историю при инициализации
    const savedHistory = localStorage.getItem(VIEW_HISTORY_KEY);
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Error loading view history:', error);
        localStorage.removeItem(VIEW_HISTORY_KEY);
      }
    }
  }, []);

  // Мемоизируем функцию addToHistory с помощью useCallback
  const addToHistory = useCallback((product: Product) => {
    if (!product || !product.id) return;

    setHistory(prevHistory => {
      // Проверяем, есть ли уже такой товар в истории
      const exists = prevHistory.some(item => item.product.id === product.id);

      // Если товар уже есть в истории, возвращаем историю без изменений
      if (exists) return prevHistory;

      // Удаляем дубликаты
      const filteredHistory =
          prevHistory.filter(item => item.product.id !== product.id);

      // Добавляем новый товар в начало
      const newHistory =
          [{product, timestamp: Date.now()}, ...filteredHistory].slice(
              0, MAX_HISTORY_ITEMS);

      // Сохраняем в localStorage
      localStorage.setItem(VIEW_HISTORY_KEY, JSON.stringify(newHistory));

      return newHistory;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(VIEW_HISTORY_KEY);
  }, []);

  const getRecentProducts = useCallback((count: number = 5) => {
    return history.slice(0, count).map(item => item.product);
  }, [history]);

  const getSimilarProducts =
      useCallback((currentProduct: Product, count: number = 5) => {
        if (!currentProduct || !currentProduct.category) {
          return [];
        }

        // Находим товары из той же категории
        const sameCategoryProducts = history.filter(
            item => item.product.category?.id === currentProduct.category?.id &&
                item.product.id !== currentProduct.id);

        // Сортируем по времени просмотра
        return sameCategoryProducts.sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, count)
            .map(item => item.product);
      }, [history]);

  return {
    history,
    addToHistory,
    clearHistory,
    getRecentProducts,
    getSimilarProducts
  };
}