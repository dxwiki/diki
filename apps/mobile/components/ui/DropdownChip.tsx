import { StyleSheet, Text } from 'react-native';
import Icon from '@/components/ui/Icon';
import PressableScale from '@/components/ui/PressableScale';
import { font, radius, spacing, useThemeColors } from '@/theme';

interface DropdownChipProps {
  label: string;
  active?: boolean;
  onPress: ()=> void;
  accessibilityLabel?: string;
}

// 누르면 시트가 열리는 태그형 버튼, 적용 중이면 primary 로 표시
export default function DropdownChip({ label, active = false, onPress, accessibilityLabel }: DropdownChipProps) {
  const colors = useThemeColors();
  const tone = active ? colors.accent : colors['text-secondary'];
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={accessibilityLabel ?? label}
      onPress={onPress}
      style={[styles.base, { backgroundColor: active ? colors['primary-opacity'] : colors['extreme-light'] }]}
    >
      <Text
        numberOfLines={1}
        style={[styles.label, { color: tone }, active && styles.activeLabel]}
      >
        {label}
      </Text>
      <Icon
        name="chevronDown"
        color={tone}
        size={11}
      />
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
    paddingLeft: spacing.md,
    paddingRight: spacing.sm,
  },
  label: {
    fontSize: font.subhead,
    maxWidth: 180,
  },
  activeLabel: {
    fontWeight: '600',
  },
});
