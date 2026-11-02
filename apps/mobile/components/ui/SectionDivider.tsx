import { View } from 'react-native';
import { spacing, useThemeColors } from '@/theme';

// 섹션 사이를 나누는 옅은 띠 (위아래 선·여백 없이 띠만)
export default function SectionDivider({ inset = false }: { inset?: boolean }) {
  const colors = useThemeColors();
  return (
    <View
      accessible={false}
      style={{ height: spacing.band, backgroundColor: colors.band, marginHorizontal: inset ? -spacing.gutter : 0 }}
    />
  );
}
