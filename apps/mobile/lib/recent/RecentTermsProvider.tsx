import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addRecentTermId, parseRecentIds, resolveRecentTerms, type TermData } from '@diki/core';
import { useContent } from '@/lib/content';

export const RECENT_TERMS_STORAGE_KEY = 'diki.recentTerms.v1';

export interface RecentTermsState {
  ids: number[];
  recentTerms: TermData[];
  ready: boolean;
  addRecentTerm: (id: number) => void;
}

const RecentTermsContext = createContext<RecentTermsState>({
  ids: [],
  recentTerms: [],
  ready: false,
  addRecentTerm: () => undefined,
});

const persist = (ids: number[]) => {
  AsyncStorage.setItem(RECENT_TERMS_STORAGE_KEY, JSON.stringify(ids)).catch(() => undefined);
};

export function RecentTermsProvider({ children }: { children: ReactNode }) {
  const { terms } = useContent();
  const [ids, setIds] = useState<number[]>([]);
  const [ready, setReady] = useState(false);
  const idsRef = useRef<number[]>([]);
  const readyRef = useRef(false);
  // 저장값을 읽기 전에 추가된 id 는 읽은 뒤 순서대로 다시 적용한다
  const pendingRef = useRef<number[]>([]);

  const apply = useCallback((next: number[]) => {
    idsRef.current = next;
    setIds(next);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      let stored: number[] = [];
      try {
        stored = parseRecentIds(await AsyncStorage.getItem(RECENT_TERMS_STORAGE_KEY));
      } catch {
        stored = [];
      }
      if (cancelled) return;
      const pending = pendingRef.current;
      pendingRef.current = [];
      const merged = pending.reduce((list, id) => addRecentTermId(list, id), stored);
      readyRef.current = true;
      apply(merged);
      if (pending.length) persist(merged);
      setReady(true);
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [apply]);

  const addRecentTerm = useCallback((id: number) => {
    if (!readyRef.current) pendingRef.current = [...pendingRef.current, id];
    const next = addRecentTermId(idsRef.current, id);
    if (next.length === idsRef.current.length && next.every((item, index) => item === idsRef.current[index])) return;
    apply(next);
    if (readyRef.current) persist(next);
  }, [apply]);

  const recentTerms = useMemo(() => resolveRecentTerms(ids, terms), [ids, terms]);

  const value = useMemo(() => ({ ids, recentTerms, ready, addRecentTerm }), [ids, recentTerms, ready, addRecentTerm]);

  return <RecentTermsContext.Provider value={value}>{children}</RecentTermsContext.Provider>;
}

export const useRecentTerms = (): RecentTermsState => useContext(RecentTermsContext);
