import {
  ApolloError,
  ApolloQueryResult,
  DocumentNode,
  OperationVariables,
  QueryResult,
  TypedDocumentNode,
  useApolloClient,
  useQuery,
} from "@apollo/client";
import { DefinitionNode, Kind, OperationDefinitionNode } from "graphql";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

interface QueryCacheEntry<TData> {
  data: TData;
  error: ApolloError | undefined;
  timestamp: number;
  expiresAt: number;
  loading: boolean;
}

type QueryEntry = {
  query: string;
  variables?: Record<string, any>;
};

// In-memory cache for queries
const queryCache = new Map<string, QueryCacheEntry<any>>();
// Track in-flight requests to prevent duplicates
const inFlightQueries = new Map<string, Promise<any>>();

export interface OptimizedQueryOptions<
  TData,
  TVariables extends OperationVariables,
> {
  /** Apollo query options */
  variables?: TVariables;
  /**
   * Cache time in milliseconds
   * @default 5 minutes (300000ms)
   */
  cacheTime?: number;
  /**
   * Skip the query
   * @default false
   */
  skip?: boolean;
  /**
   * Fetch policy, overrides the default
   * @default "cache-first"
   */
  fetchPolicy?:
    | "cache-first"
    | "network-only"
    | "cache-and-network"
    | "no-cache"
    | "standby";
  /**
   * Number of retry attempts for failed queries
   * @default 1
   */
  retryCount?: number;
  /**
   * Retry delay in milliseconds
   * @default 1000
   */
  retryDelay?: number;
  /**
   * Whether to show errors in console
   * @default true
   */
  logErrors?: boolean;
  /**
   * Custom on error handler
   */
  onError?: (error: ApolloError) => void;
  /**
   * Custom on data loaded handler
   */
  onCompleted?: (data: TData) => void;
  /**
   * Preserve the data when loading new data (prevents flickering)
   * @default true
   */
  preserveData?: boolean;
  /**
   * Update cache callback when you need to modify the data before caching
   * Useful for transformations or data normalization
   */
  updateCache?: (data: TData) => TData;
}

/**
 * Generate a cache key from a query and variables
 */
function generateCacheKey(queryEntry: QueryEntry): string {
  const { query, variables } = queryEntry;
  return `${query}:${variables ? JSON.stringify(variables) : ""}`;
}

/**
 * Extract the operation name from a GraphQL document
 */
function getQueryName(query: DocumentNode): string {
  const operationDef = query.definitions.find(
    (def): def is OperationDefinitionNode =>
      def.kind === Kind.OPERATION_DEFINITION,
  );

  return operationDef?.name?.value || "query";
}

// Create proper return types for refetch and fetchMore functions
type EnhancedRefetchFunction<TData, TVariables> = (
  variables?: Partial<TVariables>,
) => Promise<ApolloQueryResult<TData>>;

type EnhancedFetchMoreFunction<TData> = () => Promise<ApolloQueryResult<any>>;

// Update the QueryResult mock with the missing properties
const createQueryResultMock = <TData, TVariables extends OperationVariables>(
  options: Partial<QueryResult<TData, TVariables>> = {},
): QueryResult<TData, TVariables> => {
  return {
    loading: true,
    data: undefined,
    error: undefined,
    networkStatus: 1,
    refetch: (() =>
      Promise.resolve({ data: undefined } as ApolloQueryResult<TData>)) as any,
    fetchMore: (() => Promise.resolve({ data: undefined })) as any,
    startPolling: () => {},
    stopPolling: () => {},
    subscribeToMore: () => () => {},
    updateQuery: () => {},
    reobserve: () =>
      Promise.resolve({ data: undefined } as ApolloQueryResult<TData>),
    client: null as any,
    called: false,
    variables: {} as TVariables,
    observable: null as any,
    ...options,
  };
};

/**
 * A hook for optimized GraphQL queries with advanced caching and deduplication
 *
 * @param query The GraphQL query document
 * @param options Query options including caching configuration
 * @returns Query result with the same interface as useQuery
 */
export function useOptimizedQuery<
  TData = any,
  TVariables extends OperationVariables = OperationVariables,
>(
  query: DocumentNode | TypedDocumentNode<TData, TVariables>,
  options: OptimizedQueryOptions<TData, TVariables> = {},
): QueryResult<TData, TVariables> {
  const {
    variables,
    cacheTime = 5 * 60 * 1000, // 5 minutes default
    skip = false,
    fetchPolicy = "cache-first",
    retryCount = 1,
    retryDelay = 1000,
    logErrors = true,
    onError,
    onCompleted,
    preserveData = true,
    updateCache,
  } = options;

  const client = useApolloClient();
  const router = useRouter();
  const [forceRender, setForceRender] = useState(0);
  const queryCalled = useRef(false);
  const retryAttempts = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Store the query operation name to use as part of the cache key
  const queryName = getQueryName(query);

  // Create a cache key for this specific query
  const cacheKey = generateCacheKey({
    query: queryName,
    variables,
  });

  // Get cached data if available
  const getCachedResult = useCallback(():
    | QueryCacheEntry<TData>
    | undefined => {
    const cached = queryCache.get(cacheKey);
    if (!cached) return undefined;

    // Check if cache has expired
    if (cached.expiresAt < Date.now()) {
      queryCache.delete(cacheKey);
      return undefined;
    }

    return cached as QueryCacheEntry<TData>;
  }, [cacheKey]);

  // Function to execute the query and handle caching
  const executeQuery = useCallback(async (): Promise<
    QueryResult<TData, TVariables>
  > => {
    // Check if this exact query is already in progress
    if (inFlightQueries.has(cacheKey)) {
      return inFlightQueries.get(cacheKey) as Promise<
        QueryResult<TData, TVariables>
      >;
    }

    // Execute the query
    const queryPromise = client
      .query<TData, TVariables>({
        query,
        variables,
        fetchPolicy: fetchPolicy as any,
      })
      .then((result) => {
        // Process and cache successful result
        const now = Date.now();

        // Apply any cache transformations
        const dataToCache = updateCache
          ? updateCache(result.data)
          : result.data;

        // Add to cache
        queryCache.set(cacheKey, {
          data: dataToCache,
          error: undefined,
          timestamp: now,
          expiresAt: now + cacheTime,
          loading: false,
        });

        // Remove from in-flight queries
        inFlightQueries.delete(cacheKey);

        // Reset retry counter on success
        retryAttempts.current = 0;

        // Call onCompleted callback if provided
        if (onCompleted) {
          onCompleted(result.data);
        }

        // Force a re-render to reflect the updated cache
        setForceRender((prev) => prev + 1);

        // Create a minimal result object that matches QueryResult
        return createQueryResultMock<TData, TVariables>({
          data: dataToCache,
          loading: false,
          error: undefined,
          networkStatus: 7, // ready
          refetch: (() => executeQuery()) as EnhancedRefetchFunction<
            TData,
            TVariables
          >,
          fetchMore: (() =>
            Promise.resolve({
              data: undefined,
              loading: false,
              networkStatus: 7,
            })) as EnhancedFetchMoreFunction<TData>,
          client,
          called: true,
          variables: variables as TVariables,
        });
      })
      .catch(async (error) => {
        // Handle errors
        if (logErrors) {
          console.error(`Error executing query ${queryName}:`, error);
        }

        // Remove from in-flight queries
        inFlightQueries.delete(cacheKey);

        // Call onError callback if provided
        if (onError) {
          onError(error);
        }

        // Retry logic
        if (retryAttempts.current < retryCount) {
          retryAttempts.current++;

          // Wait before retrying
          await new Promise((resolve) => {
            timeoutRef.current = setTimeout(resolve, retryDelay);
          });

          // Retry the query
          return executeQuery();
        }

        // Return error state after all retries are exhausted
        return createQueryResultMock<TData, TVariables>({
          data: undefined,
          loading: false,
          error,
          networkStatus: 8, // error
          refetch: (() => executeQuery()) as EnhancedRefetchFunction<
            TData,
            TVariables
          >,
          client,
          called: true,
          variables: variables as TVariables,
        });
      });

    // Store the in-flight query
    inFlightQueries.set(cacheKey, queryPromise);

    return queryPromise;
  }, [
    client,
    query,
    variables,
    cacheKey,
    cacheTime,
    fetchPolicy,
    queryName,
    onCompleted,
    onError,
    logErrors,
    retryCount,
    retryDelay,
    updateCache,
  ]);

  // The base query result to use while loading or from cache
  const [result, setResult] = useState<QueryResult<TData, TVariables>>(
    createQueryResultMock<TData, TVariables>({
      loading: true,
      client,
      variables: variables as TVariables,
      refetch: (() => executeQuery()) as EnhancedRefetchFunction<
        TData,
        TVariables
      >,
    }),
  );

  // Main effect to execute the query and handle caching
  useEffect(() => {
    // Clear any existing timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Skip execution if requested
    if (skip) {
      setResult((prev) => ({
        ...prev,
        loading: false,
        called: true,
        data: undefined,
      }));
      return;
    }

    // Try to get from cache first
    const cachedResult = getCachedResult();

    if (cachedResult) {
      // Use cached data
      setResult((prev) => ({
        ...prev,
        loading: false,
        data: cachedResult.data,
        error: cachedResult.error,
        called: true,
        networkStatus: 7,
      }));
      queryCalled.current = true;
      return;
    }

    // Mark as loading but preserve previous data if applicable
    setResult((prev) => ({
      ...prev,
      loading: true,
      called: true,
      data: preserveData ? prev.data : undefined,
    }));

    // Execute the query and update state when done
    executeQuery().then((newResult) => {
      setResult((prev) => ({ ...prev, ...newResult, called: true }));
      queryCalled.current = true;
    });

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [
    skip,
    variables,
    cacheKey,
    executeQuery,
    getCachedResult,
    preserveData,
    forceRender,
  ]);

  // Fetch regular query for SSR benefits
  const apolloResult = useQuery<TData, TVariables>(query, {
    ...options,
    skip: queryCalled.current || process.env.NODE_ENV !== "development",
  } as any);

  // If we have cache/optimized results, use those, otherwise use Apollo's
  // result
  const finalResult = queryCalled.current ? result : apolloResult;

  // Add extra utility functions to the result
  const enhancedResult: QueryResult<TData, TVariables> = {
    ...finalResult,
    // Enhanced refetch that clears cache
    refetch: async (newVariables?: Partial<TVariables>) => {
      // Clear from cache
      queryCache.delete(cacheKey);

      // Reset retry counter
      retryAttempts.current = 0;

      // Update variables if provided
      if (newVariables) {
        // This will trigger the useEffect which will execute the query
        return Promise.resolve({ data: undefined } as any);
      }

      // Refetch with existing variables
      return executeQuery();
    },
  };

  return enhancedResult;
}

/**
 * Clear the entire query cache or specific entries
 * @param specificQueries Optional array of queries to clear specifically
 */
export function clearQueryCache(specificQueries?: Array<QueryEntry>): void {
  if (!specificQueries) {
    // Clear all cache
    queryCache.clear();
    return;
  }

  // Clear specific queries
  specificQueries.forEach((query) => {
    const key = generateCacheKey(query);
    queryCache.delete(key);
  });
}

/**
 * Prefetch a query and store it in the cache
 * Useful for prefetching data before navigation
 */
export async function prefetchQuery<
  TData = any,
  TVariables extends OperationVariables = OperationVariables,
>(
  client: ReturnType<typeof useApolloClient>,
  query: DocumentNode | TypedDocumentNode<TData, TVariables>,
  options: { variables?: TVariables; cacheTime?: number } = {},
): Promise<TData | null> {
  const { variables, cacheTime = 5 * 60 * 1000 } = options;

  // Get query name for cache key
  const queryName = getQueryName(query);

  // Create cache key
  const cacheKey = generateCacheKey({
    query: queryName,
    variables,
  });

  try {
    const result = await client.query<TData, TVariables>({
      query,
      variables,
      fetchPolicy: "network-only",
    });

    // Cache the result
    const now = Date.now();
    queryCache.set(cacheKey, {
      data: result.data,
      error: undefined,
      timestamp: now,
      expiresAt: now + cacheTime,
      loading: false,
    });

    return result.data;
  } catch (error) {
    console.error(`Error prefetching query ${queryName}:`, error);
    return null;
  }
}

export default useOptimizedQuery;
