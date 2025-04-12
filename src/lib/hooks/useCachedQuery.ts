import {
  DocumentNode,
  OperationVariables,
  QueryHookOptions,
  QueryResult,
  TypedDocumentNode,
  useQuery,
  WatchQueryFetchPolicy,
} from '@apollo/client';
import { useEffect, useRef } from 'react';

// Cache structure to store query results
interface QueryCache {
  [key: string]: { data: any; timestamp: number };
}

// Global cache for queries
const queryCache: QueryCache = {};

// Set of currently in-flight queries to prevent duplicates
const inFlightQueries = new Set<string>();

/**
 * Options for the useCachedQuery hook
 */
export interface CachedQueryOptions<
  TData,
  TVariables extends OperationVariables,
> extends QueryHookOptions<TData, TVariables> {
  /**
   * Cache time in milliseconds. Data older than this will be refetched.
   * @default 5 minutes (300000ms)
   */
  cacheTime?: number;

  /**
   * Key to use for caching. If not provided, it will be generated from the
   * query name and variables. Use this for more fine-grained control over cache
   * invalidation.
   */
  cacheKey?: string;

  /**
   * Whether to log errors to the console
   * @default true
   */
  logErrors?: boolean;

  /**
   * Whether to deduplicate identical in-flight requests
   * @default true
   */
  deduplicate?: boolean;
}

/**
 * Extract operation name from a GraphQL document
 */
function getOperationName(query: DocumentNode): string {
  // Safe access of the operation name
  try {
    const definition = query.definitions.find(
      (def) => def.kind === 'OperationDefinition'
    );
    // @ts-ignore - We're safely handling property access
    return definition?.name?.value || 'query';
  } catch (e) {
    return 'query';
  }
}

/**
 * A hook that extends useQuery with improved caching and deduplication
 *
 * @param query The GraphQL query document
 * @param options Query options with additional caching parameters
 * @returns Query result with the same interface as useQuery
 */
export function useCachedQuery<
  TData = any,
  TVariables extends OperationVariables = OperationVariables,
>(
  query: DocumentNode | TypedDocumentNode<TData, TVariables>,
  options: CachedQueryOptions<TData, TVariables> = {}
): QueryResult<TData, TVariables> {
  const {
    cacheTime = 5 * 60 * 1000, // 5 minutes by default
    cacheKey: customCacheKey,
    logErrors = true,
    deduplicate = true,
    ...apolloOptions
  } = options;

  // Generate a cache key if not provided
  const operationName = getOperationName(query);

  // Use custom cache key or generate one from operation name and variables
  const cacheKey =
    customCacheKey ||
    `${operationName}:${JSON.stringify(apolloOptions.variables || {})}`;

  // Track if we should deduplicate this query
  const shouldDeduplicate = useRef(
    deduplicate && inFlightQueries.has(cacheKey)
  );

  // Standard Apollo useQuery with some modifications
  const result = useQuery<TData, TVariables>(query, {
    ...apolloOptions,
    // Skip the query if it's already in flight and deduplicate is enabled
    skip: shouldDeduplicate.current || apolloOptions.skip,
    // Prefer network if cache is expired
    fetchPolicy: getCacheFetchPolicy(
      cacheKey,
      cacheTime,
      apolloOptions.fetchPolicy as WatchQueryFetchPolicy
    ),
    onCompleted: (data) => {
      // Store in our cache
      queryCache[cacheKey] = { data, timestamp: Date.now() };

      // Remove from in-flight set
      if (deduplicate) {
        inFlightQueries.delete(cacheKey);
      }

      // Call the original onCompleted if provided
      if (apolloOptions.onCompleted) {
        apolloOptions.onCompleted(data);
      }
    },
    onError: (error) => {
      // Remove from in-flight set
      if (deduplicate) {
        inFlightQueries.delete(cacheKey);
      }

      // Log errors if enabled
      if (logErrors) {
        console.error(`Error executing query ${operationName}:`, error);
      }

      // Call the original onError if provided
      if (apolloOptions.onError) {
        apolloOptions.onError(error);
      }
    },
  });

  // Add query to in-flight set when it starts
  useEffect(() => {
    if (deduplicate && result.loading && !shouldDeduplicate.current) {
      inFlightQueries.add(cacheKey);
    }

    return () => {
      // Clean up in-flight query on unmount
      if (deduplicate) {
        inFlightQueries.delete(cacheKey);
      }
    };
  }, [cacheKey, deduplicate, result.loading]);

  // Return a result that might include cached data during loading
  return {
    ...result,
    // Override data to use cached value when loading if available
    data:
      result.loading && queryCache[cacheKey]?.data
        ? queryCache[cacheKey].data
        : result.data,
    // Enhanced refetch that clears cache
    refetch: async (variables) => {
      delete queryCache[cacheKey];
      return result.refetch(variables);
    },
  };
}

/**
 * Clear the in-memory query cache, either entirely or for specific keys
 *
 * @param cacheKeys Optional array of cache keys to clear
 */
export function clearQueryCache(cacheKeys?: string[]): void {
  if (!cacheKeys || cacheKeys.length === 0) {
    // Clear entire cache
    Object.keys(queryCache).forEach((key) => {
      delete queryCache[key];
    });
  } else {
    // Clear specific keys
    cacheKeys.forEach((key) => {
      delete queryCache[key];
    });
  }
}

/**
 * Determine the appropriate fetch policy based on cache status
 */
function getCacheFetchPolicy(
  cacheKey: string,
  cacheTime: number,
  originalPolicy: WatchQueryFetchPolicy | undefined
): WatchQueryFetchPolicy {
  // If a fetch policy is explicitly set, respect it
  if (originalPolicy && originalPolicy !== 'cache-first') {
    return originalPolicy;
  }

  // If we have a recent cache entry, use it
  const cachedData = queryCache[cacheKey];
  if (cachedData && Date.now() - cachedData.timestamp < cacheTime) {
    return 'cache-first';
  }

  // Otherwise prefer network
  return 'network-only';
}

export default useCachedQuery;
