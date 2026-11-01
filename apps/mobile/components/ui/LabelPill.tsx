import { StyleSheet, View } from 'react-native';
import Text from '@/components/ui/Text';
import { font, radius, spacing, tint, useThemeColors } from '@/theme';

// 상세 화면 줄머리 (웹의 요약·난이도·태그 라벨)
export default function LabelPill({ label, color }: { label: string; color?: string }) {
  const colors = useThemeColors();
  return (
    <View style={[styles.pill, { backgroundColor: color ? tint(color) : colors['extreme-light'] }]}>
      <Text style={[styles.text, { color: color ?? colors.gray0 }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    minWidth: 48,
    alignItems: 'center',
    borderRadius: radius.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  text: {
    fontSize: font.footnote,
    fontWeight: '600',
  },
});
