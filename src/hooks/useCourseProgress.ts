'use client';

import { useCallback, useEffect, useState } from 'react';
import { applyAttempt, EMPTY_PROGRESS, parseProgress, type CourseMode, type ProgressState } from '@diki/core';

export type { StepRecord, ProgressState } from '@diki/core';

// 서버 저장(TODO 4~5단계) 전까지 브라우저에만 임시 보관한다
const STORAGE_KEY = 'diki-course-progress-v1';
const EVENT_NAME = 'diki-progress-change';
const emptyState: ProgressState = EMPTY_PROGRESS;

function readState(): ProgressState {
  try {
    return parseProgress(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return emptyState;
  }
}

function writeState(state: ProgressState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new Event(EVENT_NAME));
  } catch {
    // 저장소를 쓸 수 없는 환경에서는 현재 화면에서만 유지한다
  }
}

export function useCourseProgress() {
  const [state, setState] = useState<ProgressState>(emptyState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => setState(readState());
    sync();
    setReady(true);
    window.addEventListener('storage', sync);
    window.addEventListener(EVENT_NAME, sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener(EVENT_NAME, sync);
    };
  }, []);

  const recordAttempt = useCallback((mode: CourseMode, key: string, result: { completed: boolean; review: boolean }) => {
    writeState(applyAttempt(readState(), mode, key, result, new Date().toISOString()));
  }, []);

  const saveDraft = useCallback((key: string, text: string) => {
    const current = readState();
    writeState({ ...current, drafts: { ...current.drafts, [key]: text } });
  }, []);

  return { ready, state, recordAttempt, saveDraft };
}
