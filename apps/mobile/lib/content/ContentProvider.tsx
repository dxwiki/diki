import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';
import {
  pickInitialContent,
  shouldCheckVersion,
  syncContent,
  type InitialContent,
  type VersionCheckTrigger,
} from '@diki/core';
import { CONTENT_BASE_URL } from '@/lib/config';
import { bundledContent } from './bundled';
import { readStoredContent, saveContent } from './storage';

const FETCH_TIMEOUT_MS = 20_000;

export type ContentState = InitialContent;

const initialState: ContentState = { ...bundledContent, source: 'bundled' };

const ContentContext = createContext<ContentState>(initialState);

// 프로세스당 1회 launch 확인을 보장한다
let launchCheckDone = false;

const fetchJson = async (url: string): Promise<unknown> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, { cache: 'no-store', signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${ response.status }`);
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
};

export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<ContentState>(initialState);
  const contentRef = useRef<ContentState>(initialState);
  const readyRef = useRef(false);
  const inFlightRef = useRef(false);
  const lastCheckedAtRef = useRef<number | null>(null);

  useEffect(() => {
    const apply = (next: ContentState) => {
      contentRef.current = next;
      setContent(next);
    };

    const check = async (trigger: VersionCheckTrigger) => {
      if (!readyRef.current || inFlightRef.current) return;
      const now = Date.now();
      if (!shouldCheckVersion(trigger, lastCheckedAtRef.current, now)) return;
      inFlightRef.current = true;
      lastCheckedAtRef.current = now;
      try {
        const result = await syncContent({
          baseUrl: CONTENT_BASE_URL,
          current: contentRef.current.version,
          fetchJson,
          saveContent,
        });
        if (result.status === 'updated') {
          apply({ terms: result.terms, version: result.version, source: 'downloaded' });
        }
      } finally {
        inFlightRef.current = false;
      }
    };

    const init = async () => {
      const stored = await readStoredContent();
      const picked = pickInitialContent(bundledContent, stored);
      if (picked.source === 'downloaded') apply(picked);
      readyRef.current = true;
      if (!launchCheckDone) {
        launchCheckDone = true;
        await check('launch');
      }
    };

    void init();

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void check('foreground');
    });

    return () => subscription.remove();
  }, []);

  return <ContentContext.Provider value={content}>{children}</ContentContext.Provider>;
}

export const useContent = (): ContentState => useContext(ContentContext);
