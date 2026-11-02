import { StyleSheet, Text } from 'react-native';
import PressableScale from '@/components/ui/PressableScale';
import { font, radius, spacing, useThemeColors } from '@/theme';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress: ()=> void;
  accessibilityLabel?: string;
}

// 테두리 없이 면 색으로만 선택 상태를 구분한다
export default function Chip({ label, selected = false, onPress, accessibilityLabel }: ChipProps) {
  const colors = useThemeColors();
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={[styles.base, { backgroundColor: selected ? colors['primary-opacity'] : colors['extreme-light'] }]}
    >
      <Text style={[styles.label, { color: selected ? colors.accent : colors['text-secondary'] }, selected && styles.selectedLabel]}>
        {label}
      </Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  label: {
    fontSize: font.subhead,
  },
  selectedLabel: {
    fontWeight: '600',
  },
});
