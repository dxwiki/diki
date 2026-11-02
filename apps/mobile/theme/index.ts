import { useColorScheme } from 'react-native';
import { DarkTheme, DefaultTheme, type Theme } from 'expo-router';
import colors from './colors.json';

export type ColorName = keyof typeof colors.light;
export type ColorSchemeName = 'light' | 'dark';
export type ThemeColors = Record<ColorName, string> & { line: string; band: string; raised: string };

// 1px 구분선은 조금 짙게, 섹션 띠는 옅게 (웹 변수에서 고른다)
const withLines = (palette: Record<ColorName, string>, line: ColorName, band: string, raised: ColorName): ThemeColors => ({
  ...palette,
  line: palette[line],
  band,
  raised: palette[raised],
});

// 다크에서는 섹션 띠를 완전 검은색으로, 떠 있는 면(세그먼트 선택)은 한 단계 밝게 둔다
export const themeColors: Record<ColorSchemeName, ThemeColors> = {
  light: withLines(colors.light, 'border', colors.light['extreme-light'], 'background'),
  dark: withLines(colors.dark, 'gray3', '#000000', 'gray4'),
};

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

export { elevation, hairline, radius, scrim, spacing, tint } from './layout';
export { font } from './typography';
