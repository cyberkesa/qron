import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Хук для дебаунса значений с возможностью отмены
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Очищаем предыдущий таймер
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Устанавливаем новый таймер
    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Очистка при размонтировании
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Хук для дебаунса функций с возможностью отмены
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): [T, () => void] {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const callbackRef = useRef(callback);

  // Обновляем ref при изменении callback
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const debouncedCallback = useCallback(
    ((...args: Parameters<T>) => {
      // Очищаем предыдущий таймер
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Устанавливаем новый таймер
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    }) as T,
    [delay]
  );

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return [debouncedCallback, cancel];
}

/**
 * Хук для throttling функций
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastCallRef = useRef<number>(0);
  const callbackRef = useRef(callback);

  // Обновляем ref при изменении callback
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const throttledCallback = useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();

      if (now - lastCallRef.current >= delay) {
        lastCallRef.current = now;
        callbackRef.current(...args);
      }
    }) as T,
    [delay]
  );

  return throttledCallback;
}

/**
 * Хук для дебаунса с немедленным первым вызовом
 */
export function useDebounceImmediate<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const isFirstRun = useRef(true);

  useEffect(() => {
    // Первый вызов выполняется немедленно
    if (isFirstRun.current) {
      setDebouncedValue(value);
      isFirstRun.current = false;
      return;
    }

    // Очищаем предыдущий таймер
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Устанавливаем новый таймер
    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Очистка при размонтировании
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Хук для дебаунса с состоянием загрузки
 */
export function useDebounceWithLoading<T>(
  value: T,
  delay: number
): [T, boolean] {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Если значение изменилось, показываем загрузку
    if (value !== debouncedValue) {
      setIsLoading(true);
    }

    // Очищаем предыдущий таймер
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Устанавливаем новый таймер
    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
      setIsLoading(false);
    }, delay);

    // Очистка при размонтировании
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay, debouncedValue]);

  return [debouncedValue, isLoading];
}
