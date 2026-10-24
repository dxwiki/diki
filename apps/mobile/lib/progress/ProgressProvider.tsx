import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { applyAttempt, EMPTY_PROGRESS, parseProgress, type CourseMode, type ProgressState } from '@diki/core';

export const PROGRESS_STORAGE_KEY = 'diki.courseProgress.v1';

export interface ProgressContextValue {
  ready: boolean;
  state: ProgressState;
  recordAttempt: (mode: CourseMode, key: string, result: { completed: boolean; review: boolean })=> void;
}

const ProgressContext = createContext<ProgressContextValue>({
  ready: false,
  state: EMPTY_PROGRESS,
  recordAttempt: () => undefined,
});

// 서버 진도 API(웹 TODO 4~5단계) 전까지 기기에만 저장한다
export function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProgressState>(EMPTY_PROGRESS);
  const [ready, setReady] = useState(false);
  const stateRef = useRef<ProgressState>(EMPTY_PROGRESS);
  const pendingRef = useRef<((s: ProgressState)=> ProgressState)[]>([]);
  const readyRef = useRef(false);

  const commit = useCallback((next: ProgressState) => {
    stateRef.current = next;
    setState(next);
    AsyncStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(next)).catch(() => undefined);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      let stored = EMPTY_PROGRESS;
      try {
        stored = parseProgress(await AsyncStorage.getItem(PROGRESS_STORAGE_KEY));
      } catch {
        stored = EMPTY_PROGRESS;
      }
      if (cancelled) return;
      const pending = pendingRef.current;
      pendingRef.current = [];
      const merged = pending.reduce((acc, update) => update(acc), stored);
      readyRef.current = true;
      if (pending.length) commit(merged);
      else {
        stateRef.current = merged;
        setState(merged);
      }
      setReady(true);
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [commit]);

  const recordAttempt = useCallback<ProgressContextValue['recordAttempt']>((mode, key, result) => {
    const update = (s: ProgressState) => applyAttempt(s, mode, key, result, new Date().toISOString());
    if (!readyRef.current) {
      pendingRef.current = [...pendingRef.current, update];
      return;
    }
    commit(update(stateRef.current));
  }, [commit]);

  const value = useMemo(() => ({ ready, state, recordAttempt }), [ready, state, recordAttempt]);
  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export const useProgress = (): ProgressContextValue => useContext(ProgressContext);
