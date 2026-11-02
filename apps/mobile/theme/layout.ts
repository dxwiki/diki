import { StyleSheet } from 'react-native';

// 행 간격 < 묶음 간격 < 섹션 간격 순서로 위계를 만든다
export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  gutter: 16,
  lg: 24,
  section: 32,
  band: 12,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  pill: 999,
} as const;

export const hairline = StyleSheet.hairlineWidth;

// 단색 hex 에 투명도를 붙여 옅은 면 색을 만든다
export const tint = (hex: string, alpha = '1f'): string => (/^#[0-9a-f]{6}$/i.test(hex) ? `${ hex }${ alpha }` : hex);

// iOS 는 그림자가 옅은 플랫폼이라 두 단계만 쓴다
export const elevation = {
  raised: '0 1px 3px rgba(0, 0, 0, 0.12)',
  sheet: '0 -2px 12px rgba(0, 0, 0, 0.08)',
} as const;

export const scrim = 'rgba(0, 0, 0, 0.35)';
