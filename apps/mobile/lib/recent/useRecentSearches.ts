import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const RECENT_SEARCHES_STORAGE_KEY = 'diki.recentSearches.v1';
const MAX_RECENT_SEARCHES = 10;

const parse = (raw: string | null): string[] => {
  try {
    const value: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string').slice(0, MAX_RECENT_SEARCHES) : [];
  } catch {
    return [];
  }
};

// 최근 검색어는 이 기기에만 최대 10개, 최신순으로 저장한다
export function useRecentSearches() {
  const [items, setItems] = useState<string[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(RECENT_SEARCHES_STORAGE_KEY).then((raw) => setItems(parse(raw))).catch(() => undefined);
  }, []);

  const update = useCallback((fn: (prev: string[])=> string[]) => {
    setItems((prev) => {
      const next = fn(prev);
      AsyncStorage.setItem(RECENT_SEARCHES_STORAGE_KEY, JSON.stringify(next)).catch(() => undefined);
      return next;
    });
  }, []);

  const add = useCallback((query: string) => {
    const value = query.trim();
    if (!value) return;
    update((prev) => [value, ...prev.filter((v) => v !== value)].slice(0, MAX_RECENT_SEARCHES));
  }, [update]);

  const remove = useCallback((query: string) => update((prev) => prev.filter((v) => v !== query)), [update]);
  const clear = useCallback(() => update(() => []), [update]);

  return { items, add, remove, clear };
}
