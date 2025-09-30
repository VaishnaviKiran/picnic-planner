// hooks/useLocalStorageSync.ts
import { useState, useEffect, useCallback } from 'react';

export function useLocalStorageSync<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const setStorageValue = useCallback((newValue: T | ((prev: T) => T)) => {
    const finalValue = typeof newValue === 'function' 
      ? (newValue as (prev: T) => T)(value)
      : newValue;
      
    setValue(finalValue);
    try {
      localStorage.setItem(key, JSON.stringify(finalValue));
      // Dispatch custom event for same-tab sync
      window.dispatchEvent(new CustomEvent(`localStorage-${key}`, { 
        detail: finalValue 
      }));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [key, value]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          setValue(JSON.parse(e.newValue));
        } catch {
          setValue(defaultValue);
        }
      }
    };

    const handleCustomEvent = (e: CustomEvent) => {
      setValue(e.detail);
    };

    // Listen for changes from other tabs
    window.addEventListener('storage', handleStorageChange);
    // Listen for changes from same tab
    window.addEventListener(`localStorage-${key}`, handleCustomEvent as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(`localStorage-${key}`, handleCustomEvent as EventListener);
    };
  }, [key, defaultValue]);

  return [value, setStorageValue] as const;
}
