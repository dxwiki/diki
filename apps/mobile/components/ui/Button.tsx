import { StyleSheet, Text } from 'react-native';
import PressableScale from '@/components/ui/PressableScale';
import { font, radius, spacing, useThemeColors } from '@/theme';

interface ButtonProps {
  label: string;
  onPress: ()=> void;
  variant?: 'primary' | 'secondary';
  accessibilityHint?: string;
  disabled?: boolean;
}

export default function Button({ label, onPress, variant = 'primary', accessibilityHint, disabled = false }: ButtonProps) {
  const colors = useThemeColors();
  const isPrimary = variant === 'primary';
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.base,
        { backgroundColor: isPrimary ? colors.primary : colors['extreme-light'] },
        disabled && styles.disabled,
      ]}
    >
      <Text style={[styles.label, { color: isPrimary ? colors.background : colors.text }]}>
        {label}
      </Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: radius.md,
    borderCurve: 'continuous',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.gutter,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.4,
  },
  label: {
    fontSize: font.callout,
    fontWeight: '600',
  },
});
