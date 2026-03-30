'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

// Simple cache for API responses
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 30000; // 30 seconds

export function useApiCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  dependencies: any[] = []
): {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refresh: () => void;
} {
  const [data, setData] = useState<T | null>(() => {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
    return null;
  });
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<Error | null>(null);
  const isMounted = useRef(true);

  const fetchData = useCallback(async (force = false) => {
    // Check cache first
    if (!force) {
      const cached = cache.get(key);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        setData(cached.data);
        setLoading(false);
        return;
      }
    }

    setLoading(true);
    try {
      const result = await fetchFn();
      if (isMounted.current) {
        setData(result);
        cache.set(key, { data: result, timestamp: Date.now() });
        setError(null);
      }
    } catch (e) {
      if (isMounted.current) {
        setError(e as Error);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [key, fetchFn]);

  const refresh = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  useEffect(() => {
    isMounted.current = true;
    fetchData();
    return () => {
      isMounted.current = false;
    };
  }, [fetchData, ...dependencies]);

  return { data, loading, error, refresh };
}

// Clear cache for a specific key
export function clearCache(key: string) {
  cache.delete(key);
}

// Clear all cache
export function clearAllCache() {
  cache.clear();
}
