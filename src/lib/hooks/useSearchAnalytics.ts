import { useState, useEffect, useCallback } from 'react';

interface SearchAnalytics {
  query: string;
  timestamp: number;
  resultsCount: number;
  clickedResult?: string;
  noResults: boolean;
}

interface PopularQuery {
  query: string;
  count: number;
  lastUsed: number;
}

export function useSearchAnalytics() {
  const [analytics, setAnalytics] = useState<SearchAnalytics[]>([]);
  const [popularQueries, setPopularQueries] = useState<PopularQuery[]>([]);

  // Загрузка данных из localStorage
  useEffect(() => {
    try {
      const savedAnalytics = localStorage.getItem('searchAnalytics');
      const savedPopular = localStorage.getItem('popularQueries');

      if (savedAnalytics) {
        setAnalytics(JSON.parse(savedAnalytics));
      }

      if (savedPopular) {
        setPopularQueries(JSON.parse(savedPopular));
      }
    } catch (error) {
      console.error('Error loading search analytics:', error);
    }
  }, []);

  // Сохранение данных в localStorage
  const saveToStorage = useCallback(
    (newAnalytics: SearchAnalytics[], newPopular: PopularQuery[]) => {
      try {
        localStorage.setItem(
          'searchAnalytics',
          JSON.stringify(newAnalytics.slice(-100))
        ); // Храним последние 100 запросов
        localStorage.setItem(
          'popularQueries',
          JSON.stringify(newPopular.slice(0, 50))
        ); // Топ 50 популярных
      } catch (error) {
        console.error('Error saving search analytics:', error);
      }
    },
    []
  );

  // Запись поискового запроса
  const trackSearch = useCallback(
    (query: string, resultsCount: number) => {
      const newAnalytic: SearchAnalytics = {
        query: query.toLowerCase().trim(),
        timestamp: Date.now(),
        resultsCount,
        noResults: resultsCount === 0,
      };

      setAnalytics((prev) => {
        const updated = [...prev, newAnalytic];

        // Обновляем популярные запросы
        setPopularQueries((prevPopular) => {
          const existing = prevPopular.find(
            (p) => p.query === newAnalytic.query
          );
          let updatedPopular: PopularQuery[];

          if (existing) {
            updatedPopular = prevPopular.map((p) =>
              p.query === newAnalytic.query
                ? { ...p, count: p.count + 1, lastUsed: Date.now() }
                : p
            );
          } else {
            updatedPopular = [
              ...prevPopular,
              {
                query: newAnalytic.query,
                count: 1,
                lastUsed: Date.now(),
              },
            ];
          }

          // Сортируем по популярности и времени
          updatedPopular.sort((a, b) => {
            if (a.count !== b.count) {
              return b.count - a.count; // По убыванию количества
            }
            return b.lastUsed - a.lastUsed; // По убыванию времени
          });

          saveToStorage(updated, updatedPopular);
          return updatedPopular;
        });

        return updated;
      });
    },
    [saveToStorage]
  );

  // Запись клика по результату
  const trackResultClick = useCallback(
    (query: string, resultId: string) => {
      setAnalytics((prev) => {
        const updated = prev.map((analytic) =>
          analytic.query === query.toLowerCase().trim() &&
          !analytic.clickedResult
            ? { ...analytic, clickedResult: resultId }
            : analytic
        );

        saveToStorage(updated, popularQueries);
        return updated;
      });
    },
    [popularQueries, saveToStorage]
  );

  // Получение статистики
  const getSearchStats = useCallback(() => {
    const totalSearches = analytics.length;
    const uniqueQueries = new Set(analytics.map((a) => a.query)).size;
    const noResultsCount = analytics.filter((a) => a.noResults).length;
    const noResultsRate =
      totalSearches > 0 ? (noResultsCount / totalSearches) * 100 : 0;

    const avgResultsCount =
      totalSearches > 0
        ? analytics.reduce((sum, a) => sum + a.resultsCount, 0) / totalSearches
        : 0;

    return {
      totalSearches,
      uniqueQueries,
      noResultsCount,
      noResultsRate: Math.round(noResultsRate * 100) / 100,
      avgResultsCount: Math.round(avgResultsCount * 100) / 100,
    };
  }, [analytics]);

  // Получение запросов без результатов для улучшения поиска
  const getNoResultsQueries = useCallback(() => {
    return analytics
      .filter((a) => a.noResults)
      .reduce(
        (acc, a) => {
          const existing = acc.find((item) => item.query === a.query);
          if (existing) {
            existing.count++;
          } else {
            acc.push({ query: a.query, count: 1 });
          }
          return acc;
        },
        [] as { query: string; count: number }[]
      )
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);
  }, [analytics]);

  // Получение рекомендаций для улучшения поиска
  const getSearchRecommendations = useCallback(() => {
    const noResultsQueries = getNoResultsQueries();
    const stats = getSearchStats();

    const recommendations: string[] = [];

    if (stats.noResultsRate > 20) {
      recommendations.push(
        'Высокий процент запросов без результатов. Рассмотрите расширение каталога или улучшение алгоритма поиска.'
      );
    }

    if (noResultsQueries.length > 5) {
      recommendations.push(
        `Часто ищут: ${noResultsQueries
          .slice(0, 3)
          .map((q) => q.query)
          .join(', ')}. Добавьте эти товары в каталог.`
      );
    }

    if (stats.avgResultsCount < 5) {
      recommendations.push(
        'Низкое среднее количество результатов. Улучшите алгоритм поиска или добавьте синонимы.'
      );
    }

    return recommendations;
  }, [getNoResultsQueries, getSearchStats]);

  // Очистка старых данных (старше 30 дней)
  const cleanOldData = useCallback(() => {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

    setAnalytics((prev) => {
      const filtered = prev.filter((a) => a.timestamp > thirtyDaysAgo);
      saveToStorage(filtered, popularQueries);
      return filtered;
    });
  }, [popularQueries, saveToStorage]);

  // Автоматическая очистка при загрузке
  useEffect(() => {
    cleanOldData();
  }, [cleanOldData]);

  return {
    trackSearch,
    trackResultClick,
    popularQueries: popularQueries.slice(0, 10), // Возвращаем топ 10
    getSearchStats,
    getNoResultsQueries,
    getSearchRecommendations,
    cleanOldData,
  };
}
