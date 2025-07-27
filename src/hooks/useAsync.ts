import { useState, useEffect, useCallback } from 'react';
import notificationService from '../utils/notifications';

interface UseAsyncOptions<T> {
  immediate?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  showSuccessMessage?: boolean;
  showErrorMessage?: boolean;
  successMessage?: string;
  errorMessage?: string;
}

interface UseAsyncReturn<T, P extends any[]> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  execute: (...args: P) => Promise<T | null>;
  reset: () => void;
}

/**
 * Custom hook for handling async operations with loading states and error handling
 */
export function useAsync<T, P extends any[] = []>(
  asyncFunction: (...args: P) => Promise<T>,
  options: UseAsyncOptions<T> = {}
): UseAsyncReturn<T, P> {
  const {
    immediate = false,
    onSuccess,
    onError,
    showSuccessMessage = false,
    showErrorMessage = true,
    successMessage,
    errorMessage,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (...args: P): Promise<T | null> => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await asyncFunction(...args);
        setData(result);
        
        if (onSuccess) {
          onSuccess(result);
        }
        
        if (showSuccessMessage) {
          notificationService.success(
            successMessage || 'عملیات با موفقیت انجام شد'
          );
        }
        
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('خطای نامشخص');
        setError(error);
        
        if (onError) {
          onError(error);
        }
        
        if (showErrorMessage) {
          notificationService.error(
            errorMessage || 'خطا در انجام عملیات',
            error.message
          );
        }
        
        return null;
      } finally {
        setLoading(false);
      }
    },
    [asyncFunction, onSuccess, onError, showSuccessMessage, showErrorMessage, successMessage, errorMessage]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (immediate) {
      execute(...([] as unknown as P));
    }
  }, [immediate, execute]);

  return { data, loading, error, execute, reset };
}
