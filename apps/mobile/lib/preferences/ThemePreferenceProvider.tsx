import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemePreference = 'system' | 'light' | 'dark';

export const THEME_STORAGE_KEY = 'diki.themePreference.v1';

const isPreference = (value: unknown): value is ThemePreference => value === 'system' || value === 'light' || value === 'dark';

// 앱 안의 useColorScheme 이 모두 따라오도록 시스템 수준에서 덮어쓴다
const apply = (preference: ThemePreference) => {
  Appearance.setColorScheme(preference === 'system' ? 'unspecified' : preference);
};

interface ThemePreferenceValue {
  preference: ThemePreference;
  setPreference: (next: ThemePreference)=> void;
}

const ThemePreferenceContext = createContext<ThemePreferenceValue>({ preference: 'system', setPreference: () => undefined });

export function ThemePreferenceProvider({ children }: { children: ReactNode }) {
  const [preference, setState] = useState<ThemePreference>('system');

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then((stored) => {
        if (!isPreference(stored)) return;
        setState(stored);
        apply(stored);
      })
      .catch(() => undefined);
  }, []);

  const setPreference = useCallback((next: ThemePreference) => {
    setState(next);
    apply(next);
    AsyncStorage.setItem(THEME_STORAGE_KEY, next).catch(() => undefined);
  }, []);

  const value = useMemo(() => ({ preference, setPreference }), [preference, setPreference]);
  return <ThemePreferenceContext.Provider value={value}>{children}</ThemePreferenceContext.Provider>;
}

export const useThemePreference = (): ThemePreferenceValue => useContext(ThemePreferenceContext);
