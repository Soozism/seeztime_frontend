import { useState, useEffect, useCallback, useRef } from 'react';
import { useAsync } from './useAsync';
import notificationService from '../utils/notifications';

interface UseApiOptions<T> {
  immediate?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  refreshInterval?: number;
  retryCount?: number;
  retryDelay?: number;
  cacheTime?: number;
  staleTime?: number;
  showErrorNotification?: boolean;
  errorMessage?: string;
}

interface UseApiReturn<T, P extends any[]> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  execute: (...args: P) => Promise<T | null>;
  refresh: () => Promise<T | null>;
  reset: () => void;
  isStale: boolean;
  lastFetched: Date | null;
}

// Simple cache implementation
const cache = new Map<string, { data: any; timestamp: number; staleTime: number }>();

/**
 * Advanced hook for API calls with caching, retry logic, and refresh intervals
 */
export function useApi<T, P extends any[] = []>(
  key: string,
  apiFunction: (...args: P) => Promise<T>,
  options: UseApiOptions<T> = {}
): UseApiReturn<T, P> {
  const {
    immediate = true,
    onSuccess,
    onError,
    refreshInterval,
    retryCount = 0,
    retryDelay = 1000,
    cacheTime = 5 * 60 * 1000, // 5 minutes
    staleTime = 0,
    showErrorNotification = true,
    errorMessage,
  } = options;

  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const [isStale, setIsStale] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const argsRef = useRef<P | null>(null);

  // Check cache
  const getCachedData = useCallback(() => {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < cacheTime) {
      return cached.data;
    }
    return null;
  }, [key, cacheTime]);

  // Set cache
  const setCachedData = useCallback((data: T) => {
    cache.set(key, {
      data,
      timestamp: Date.now(),
      staleTime,
    });
  }, [key, staleTime]);

  // Enhanced API function with retry logic
  const enhancedApiFunction = useCallback(
    async (...args: P): Promise<T> => {
      argsRef.current = args;
      
      // Check cache first
      const cachedData = getCachedData();
      if (cachedData && !isStale) {
        return cachedData;
      }

      let lastError: Error | null = null;
      let attempts = 0;

      while (attempts <= retryCount) {
        try {
          const result = await apiFunction(...args);
          setCachedData(result);
          setLastFetched(new Date());
          setIsStale(false);
          
          if (onSuccess) {
            onSuccess(result);
          }
          
          return result;
        } catch (error) {
          lastError = error instanceof Error ? error : new Error('خطای نامشخص');
          attempts++;
          
          if (attempts <= retryCount) {
            const delay = retryDelay * attempts;
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }

      if (onError && lastError) {
        onError(lastError);
      }

      if (showErrorNotification && lastError) {
        notificationService.error(
          errorMessage || 'خطا در دریافت اطلاعات',
          lastError.message
        );
      }

      if (lastError) {
        throw lastError;
      }

      throw new Error('خطای نامشخص در انجام درخواست');
    },
    [
      apiFunction,
      getCachedData,
      setCachedData,
      isStale,
      retryCount,
      retryDelay,
      onSuccess,
      onError,
      showErrorNotification,
      errorMessage,
    ]
  );

  const { data, loading, error, execute, reset } = useAsync(enhancedApiFunction, {
    immediate: false,
    showErrorMessage: false, // We handle errors manually
  });

  // Refresh function
  const refresh = useCallback(async (): Promise<T | null> => {
    setIsStale(true);
    if (argsRef.current) {
      return execute(...argsRef.current);
    }
    return execute(...([] as unknown as P));
  }, [execute]);

  // Check if data is stale
  useEffect(() => {
    if (lastFetched && staleTime > 0) {
      const checkStale = () => {
        const now = Date.now();
        const fetchTime = lastFetched.getTime();
        setIsStale(now - fetchTime > staleTime);
      };

      const interval = setInterval(checkStale, 1000);
      return () => clearInterval(interval);
    }
  }, [lastFetched, staleTime]);

  // Set up refresh interval
  useEffect(() => {
    if (refreshInterval && refreshInterval > 0 && !loading) {
      intervalRef.current = setInterval(() => {
        refresh();
      }, refreshInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [refreshInterval, loading, refresh]);

  // Initial fetch
  useEffect(() => {
    if (immediate) {
      const cachedData = getCachedData();
      if (cachedData) {
        setLastFetched(new Date());
      } else {
        execute(...([] as unknown as P));
      }
    }
  }, [immediate, execute, getCachedData]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    data: data || getCachedData(),
    loading,
    error,
    execute,
    refresh,
    reset,
    isStale,
    lastFetched,
  };
}

/**
 * Hook for paginated API calls
 */
export function usePaginatedApi<T>(
  key: string,
  apiFunction: (page: number, pageSize: number, ...args: any[]) => Promise<{ data: T[]; total: number }>,
  options: UseApiOptions<{ data: T[]; total: number }> & {
    initialPage?: number;
    initialPageSize?: number;
  } = {}
) {
  const { initialPage = 1, initialPageSize = 10, ...apiOptions } = options;
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const paginatedKey = `${key}-${page}-${pageSize}`;
  
  const api = useApi(
    paginatedKey,
    (p: number, ps: number, ...args: any[]) => apiFunction(p, ps, ...args),
    {
      ...apiOptions,
      immediate: false,
    }
  );

  const loadPage = useCallback(
    (newPage: number, newPageSize?: number, ...args: any[]) => {
      const ps = newPageSize || pageSize;
      setPage(newPage);
      if (newPageSize) {
        setPageSize(newPageSize);
      }
      return api.execute(newPage, ps, ...args);
    },
    [api, pageSize]
  );

  const nextPage = useCallback(() => {
    return loadPage(page + 1);
  }, [loadPage, page]);

  const prevPage = useCallback(() => {
    if (page > 1) {
      return loadPage(page - 1);
    }
    return Promise.resolve(null);
  }, [loadPage, page]);

  const changePageSize = useCallback((newPageSize: number) => {
    return loadPage(1, newPageSize);
  }, [loadPage]);

  // Initial load
  useEffect(() => {
    if (apiOptions.immediate !== false) {
      loadPage(page);
    }
  }, [apiOptions.immediate, loadPage, page]);

  return {
    ...api,
    page,
    pageSize,
    loadPage,
    nextPage,
    prevPage,
    changePageSize,
    totalPages: api.data ? Math.ceil(api.data.total / pageSize) : 0,
    hasNextPage: api.data ? page * pageSize < api.data.total : false,
    hasPrevPage: page > 1,
  };
}

/**
 * Clear cache for a specific key or all keys
 */
export function clearCache(key?: string) {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
}
