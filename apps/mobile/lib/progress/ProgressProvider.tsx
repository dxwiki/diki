import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { applyAttempt, EMPTY_PROGRESS, parseProgress, type CourseMode, type ProgressState } from '@diki/core';

export const PROGRESS_STORAGE_KEY = 'diki.courseProgress.v1';

export interface ProgressContextValue {
  ready: boolean;
  state: ProgressState;
  recordAttempt: (mode: CourseMode, key: string, result: { completed: boolean; review: boolean })=> void;
  saveDraft: (key: string, text: string)=> void;
  resetProgress: ()=> void;
}

const ProgressContext = createContext<ProgressContextValue>({
  ready: false,
  state: EMPTY_PROGRESS,
  recordAttempt: () => undefined,
  saveDraft: () => undefined,
  resetProgress: () => undefined,
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

  const enqueue = useCallback((update: (s: ProgressState)=> ProgressState) => {
    if (!readyRef.current) {
      pendingRef.current = [...pendingRef.current, update];
      return;
    }
    commit(update(stateRef.current));
  }, [commit]);

  // 빈 답변은 초안에서 지운다
  const saveDraft = useCallback<ProgressContextValue['saveDraft']>((key, text) => {
    enqueue((s) => {
      const drafts = { ...s.drafts };
      if (text.trim()) drafts[key] = text;
      else delete drafts[key];
      return { ...s, drafts };
    });
  }, [enqueue]);

  const resetProgress = useCallback(() => {
    enqueue(() => EMPTY_PROGRESS);
  }, [enqueue]);

  const value = useMemo(
    () => ({ ready, state, recordAttempt, saveDraft, resetProgress }),
    [ready, state, recordAttempt, saveDraft, resetProgress],
  );
  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export const useProgress = (): ProgressContextValue => useContext(ProgressContext);
