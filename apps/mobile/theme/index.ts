import { useColorScheme } from 'react-native';
import { DarkTheme, DefaultTheme, type Theme } from 'expo-router';
import colors from './colors.json';

export type ColorName = keyof typeof colors.light;
export type ThemeColors = Record<ColorName, string>;
export type ColorSchemeName = 'light' | 'dark';

export const themeColors: Record<ColorSchemeName, ThemeColors> = colors;

export const useColorSchemeName = (): ColorSchemeName => (useColorScheme() === 'dark' ? 'dark' : 'light');

export const useThemeColors = (): ThemeColors => themeColors[useColorSchemeName()];

export const getNavigationTheme = (scheme: ColorSchemeName): Theme => {
  const c = themeColors[scheme];
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: c.primary,
      background: c.background,
      card: c.background,
      text: c.text,
      border: c.border,
      notification: c.primary,
    },
  };
};
