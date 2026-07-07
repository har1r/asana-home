import { useState, useEffect } from 'react';

/**
 * Custom hook to debounce a value.
 * Useful for delaying database/network requests or complex recalculations
 * based on user typing inside input search bars.
 *
 * @param value - The input value to debounce.
 * @param delay - The delay time in milliseconds (default: 300ms).
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
