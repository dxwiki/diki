import { StyleSheet, Text } from 'react-native';
import Icon from '@/components/ui/Icon';
import PressableScale from '@/components/ui/PressableScale';
import { font, radius, spacing, useThemeColors } from '@/theme';

// 필터 줄 맨 앞의 초기화 버튼, 태그와 같은 모양에 면 색만 조금 짙다
export default function ResetChip({ onPress, disabled = false }: { onPress: ()=> void; disabled?: boolean }) {
  const colors = useThemeColors();
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel="정렬·필터 초기화"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[styles.base, { backgroundColor: colors.gray4 }, disabled && styles.dim]}
    >
      <Icon
        name="replay"
        color={colors['text-secondary']}
        size={12}
      />
      <Text style={[styles.label, { color: colors['text-secondary'] }]}>{'초기화'}</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  dim: {
    opacity: 0.5,
  },
  label: {
    fontSize: font.subhead,
  },
});
