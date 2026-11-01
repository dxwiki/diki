import { Pressable, StyleSheet, View } from 'react-native';
import Icon from '@/components/ui/Icon';
import Text from '@/components/ui/Text';
import { font, hairline, spacing, useThemeColors } from '@/theme';

interface SettingRowProps {
  label: string;
  value?: string;
  onPress?: ()=> void;
  external?: boolean;
  destructive?: boolean;
  selected?: boolean;
  hint?: string;
}

export default function SettingRow({ label, value, onPress, external, destructive, selected, hint }: SettingRowProps) {
  const colors = useThemeColors();
  const isOption = selected !== undefined;
  const content = (
    <>
      <Text style={[styles.label, destructive && { color: colors['level-5'] }]}>{label}</Text>
      <View style={styles.trailing}>
        {value ? (
          <Text
            selectable={!onPress}
            numberOfLines={1}
            style={[styles.value, { color: colors.gray1 }]}
          >
            {value}
          </Text>
        ) : null}
        {isOption && selected ? (
          <Icon
            name="check"
            color={colors.primary}
            size={16}
          />
        ) : null}
        {onPress && !destructive && !isOption ? (
          <Icon
            name={external ? 'external' : 'chevronRight'}
            color={colors.gray3}
            size={13}
          />
        ) : null}
      </View>
    </>
  );
  const rowStyle = [styles.row, { borderBottomColor: colors.line }];
  if (!onPress) return <View style={rowStyle}>{content}</View>;
  return (
    <Pressable
      accessibilityRole={isOption ? 'radio' : external ? 'link' : 'button'}
      accessibilityState={isOption ? { checked: selected } : undefined}
      accessibilityHint={hint}
      onPress={onPress}
      style={({ pressed }) => [rowStyle, pressed && { backgroundColor: colors['extreme-light'] }]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.md,
    borderBottomWidth: hairline,
  },
  label: {
    fontSize: font.callout,
  },
  trailing: {
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  value: {
    flexShrink: 1,
    fontSize: font.body,
  },
});
