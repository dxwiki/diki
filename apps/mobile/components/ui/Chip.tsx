import { Pressable, StyleSheet, Text } from 'react-native';
import { useThemeColors } from '@/theme';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
}

export default function Chip({ label, selected = false, onPress, accessibilityLabel }: ChipProps) {
  const colors = useThemeColors();
  return (
    <Pressable
      accessibilityRole={'button'}
      accessibilityState={{ selected }}
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        selected
          ? { backgroundColor: colors.primary, borderColor: colors.primary }
          : { backgroundColor: colors.background, borderColor: colors.border },
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.label, { color: selected ? colors.background : colors.text }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  pressed: {
    opacity: 0.7,
  },
  label: {
    fontSize: 14,
  },
});
