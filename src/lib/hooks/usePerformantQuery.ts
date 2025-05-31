import {
  DocumentNode,
  OperationVariables,
  QueryHookOptions,
  QueryResult,
  TypedDocumentNode,
  useQuery,
} from '@apollo/client';
import { useCallback, useEffect, useMemo, useRef } from 'react';

// Глобальный кэш для запросов с TTL
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

const queryCache = new Map<string, CacheEntry<any>>();
const inFlightQueries = new Set<string>();

// Очистка устаревших записей кэша
const cleanupCache = () => {
  const now = Date.now();
  for (const [key, entry] of queryCache.entries()) {
    if (now - entry.timestamp > entry.ttl) {
      queryCache.delete(key);
    }
  }
};

// Запускаем очистку кэша каждые 5 минут
if (typeof window !== 'undefined') {
  setInterval(cleanupCache, 5 * 60 * 1000);
}

export interface PerformantQueryOptions<
  TData,
  TVariables extends OperationVariables,
> extends QueryHookOptions<TData, TVariables> {
  /**
   * Время жизни кэша в миллисекундах
   * @default 5 минут
   */
  cacheTTL?: number;

  /**
   * Уникальный ключ для кэширования
   * Если не указан, генерируется автоматически
   */
  cacheKey?: string;

  /**
   * Включить дедупликацию одинаковых запросов
   * @default true
   */
  deduplicate?: boolean;

  /**
   * Включить агрессивное кэширование
   * @default false
   */
  aggressiveCache?: boolean;

  /**
   * Предзагрузить данные при монтировании компонента
   * @default false
   */
  preload?: boolean;
}

/**
 * Высокопроизводительный хук для GraphQL запросов
 * с улучшенным кэшированием и дедупликацией
 */
export function usePerformantQuery<
  TData = any,
  TVariables extends OperationVariables = OperationVariables,
>(
  query: DocumentNode | TypedDocumentNode<TData, TVariables>,
  options: PerformantQueryOptions<TData, TVariables> = {}
): QueryResult<TData, TVariables> {
  const {
    cacheTTL = 5 * 60 * 1000, // 5 минут по умолчанию
    cacheKey: customCacheKey,
    deduplicate = true,
    aggressiveCache = false,
    preload = false,
    ...apolloOptions
  } = options;

  // Генерируем ключ кэша
  const cacheKey = useMemo(() => {
    if (customCacheKey) return customCacheKey;

    const queryName =
      query.definitions[0]?.kind === 'OperationDefinition'
        ? query.definitions[0].name?.value || 'query'
        : 'query';

    return `${queryName}:${JSON.stringify(apolloOptions.variables || {})}`;
  }, [customCacheKey, query, apolloOptions.variables]);

  // Проверяем кэш
  const getCachedData = useCallback((): TData | null => {
    const cached = queryCache.get(cacheKey);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > cached.ttl) {
      queryCache.delete(cacheKey);
      return null;
    }

    return cached.data;
  }, [cacheKey]);

  // Определяем политику запроса на основе кэша
  const fetchPolicy = useMemo(() => {
    if (apolloOptions.fetchPolicy) return apolloOptions.fetchPolicy;

    const cachedData = getCachedData();
    if (cachedData && aggressiveCache) {
      return 'cache-only';
    }

    return cachedData ? 'cache-first' : 'cache-and-network';
  }, [apolloOptions.fetchPolicy, getCachedData, aggressiveCache]);

  // Основной запрос
  const result = useQuery<TData, TVariables>(query, {
    ...apolloOptions,
    fetchPolicy,
    skip: apolloOptions.skip || (deduplicate && inFlightQueries.has(cacheKey)),
    onCompleted: (data) => {
      // Сохраняем в кэш
      queryCache.set(cacheKey, {
        data,
        timestamp: Date.now(),
        ttl: cacheTTL,
      });

      // Убираем из списка выполняющихся запросов
      inFlightQueries.delete(cacheKey);

      // Вызываем оригинальный callback
      apolloOptions.onCompleted?.(data);
    },
    onError: (error) => {
      // Убираем из списка выполняющихся запросов
      inFlightQueries.delete(cacheKey);

      // Вызываем оригинальный callback
      apolloOptions.onError?.(error);
    },
  });

  // Добавляем в список выполняющихся запросов
  useEffect(() => {
    if (result.loading && deduplicate) {
      inFlightQueries.add(cacheKey);
    }

    return () => {
      if (deduplicate) {
        inFlightQueries.delete(cacheKey);
      }
    };
  }, [result.loading, deduplicate, cacheKey]);

  // Предзагрузка данных
  useEffect(() => {
    if (preload && !result.loading && !result.data && !apolloOptions.skip) {
      result.refetch();
    }
  }, [
    preload,
    result.loading,
    result.data,
    apolloOptions.skip,
    result.refetch,
    result,
  ]);

  // Возвращаем результат с кэшированными данными если доступны
  return useMemo(() => {
    const cachedData = getCachedData();

    if (result.loading && cachedData && !result.data) {
      return {
        ...result,
        data: cachedData,
        loading: false,
      };
    }

    return result;
  }, [result, getCachedData]);
}

/**
 * Предзагрузка запроса для улучшения производительности
 */
export function prefetchQuery<
  TData = any,
  TVariables extends OperationVariables = OperationVariables,
>(
  query: DocumentNode | TypedDocumentNode<TData, TVariables>,
  variables?: TVariables,
  cacheTTL: number = 5 * 60 * 1000
): void {
  const queryName =
    query.definitions[0]?.kind === 'OperationDefinition'
      ? query.definitions[0].name?.value || 'query'
      : 'query';

  const cacheKey = `${queryName}:${JSON.stringify(variables || {})}`;

  // Проверяем, есть ли уже данные в кэше
  const cached = queryCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return; // Данные уже есть и актуальны
  }

  // Здесь можно добавить логику предзагрузки через Apollo Client
  // Пока просто помечаем как запрошенный
  inFlightQueries.add(cacheKey);
}

/**
 * Очистка кэша для конкретного запроса или всего кэша
 */
export function clearQueryCache(cacheKey?: string): void {
  if (cacheKey) {
    queryCache.delete(cacheKey);
  } else {
    queryCache.clear();
  }
}

/**
 * Получение статистики кэша для отладки
 */
export function getCacheStats() {
  return {
    size: queryCache.size,
    inFlight: inFlightQueries.size,
    entries: Array.from(queryCache.keys()),
  };
}
