import { Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import BottomSheet from '@/components/ui/BottomSheet';
import Icon from '@/components/ui/Icon';
import Text from '@/components/ui/Text';
import { font, hairline, spacing, useThemeColors } from '@/theme';
import { SORT_OPTIONS, type SortOption } from './useTermListing';

const ORDER: SortOption[] = ['createdDesc', 'createdAsc', 'levelDesc', 'levelAsc'];

interface SortSheetProps {
  visible: boolean;
  value: SortOption;
  hasQuery: boolean;
  onSelect: (next: SortOption)=> void;
  onClose: ()=> void;
}

// 누르는 즉시 적용하고 닫는다
export default function SortSheet({ visible, value, hasQuery, onSelect, onClose }: SortSheetProps) {
  const colors = useThemeColors();
  const options = hasQuery ? (['relevance', ...ORDER] as SortOption[]) : ORDER;
  return (
    <BottomSheet
      visible={visible}
      title="정렬"
      onClose={onClose}
    >
      {options.map((option) => {
        const selected = option === value;
        return (
          <Pressable
            key={option}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            onPress={() => {
              if (!selected) void Haptics.selectionAsync();
              onSelect(option);
              onClose();
            }}
            style={({ pressed }) => [styles.row, { borderBottomColor: colors.line }, pressed && { backgroundColor: colors['extreme-light'] }]}
          >
            <Text style={[styles.label, selected && { color: colors.primary, fontWeight: '600' }]}>{SORT_OPTIONS[option].label}</Text>
            {selected ? (
              <Icon
                name="check"
                color={colors.primary}
              />
            ) : null}
          </Pressable>
        );
      })}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.gutter,
    borderBottomWidth: hairline,
  },
  label: {
    fontSize: font.callout,
  },
});
