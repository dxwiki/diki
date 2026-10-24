import { Pressable, StyleSheet, Text } from 'react-native';
import { useThemeColors } from '@/theme';

interface ButtonProps {
  label: string;
  onPress: ()=> void;
  variant?: 'primary' | 'outline';
  accessibilityHint?: string;
  disabled?: boolean;
}

export default function Button({ label, onPress, variant = 'primary', accessibilityHint, disabled = false }: ButtonProps) {
  const colors = useThemeColors();
  const isPrimary = variant === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        isPrimary
          ? { backgroundColor: colors.primary, borderColor: colors.primary }
          : { backgroundColor: 'transparent', borderColor: colors.border },
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Text style={[styles.label, { color: isPrimary ? colors.background : colors.text }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.4,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
});
