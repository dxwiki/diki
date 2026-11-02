import { Pressable, StyleSheet, View } from 'react-native';
import Icon from '@/components/ui/Icon';
import Text from '@/components/ui/Text';
import { font, spacing, useThemeColors } from '@/theme';

interface RecentSearchesProps {
  items: string[];
  onSelect: (query: string)=> void;
  onRemove: (query: string)=> void;
  onClear: ()=> void;
}

// 검색창에 포커스했을 때 보이는 최근 검색어 (테두리 없음)
export default function RecentSearches({ items, onSelect, onRemove, onClear }: RecentSearchesProps) {
  const colors = useThemeColors();
  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text
          accessibilityRole="header"
          style={styles.title}
        >
          {'최근 검색'}
        </Text>
        {items.length ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="최근 검색 전체 삭제"
            hitSlop={8}
            onPress={onClear}
          >
            <Text style={[styles.clearAll, { color: colors.gray1 }]}>{'전체 삭제'}</Text>
          </Pressable>
        ) : null}
      </View>
      {items.length === 0 ? (
        <Text
          variant="caption"
          style={styles.empty}
        >
          {'최근 검색어가 없어요.'}
        </Text>
      ) : items.map((query) => (
        <View
          key={query}
          style={styles.row}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${ query } 검색`}
            onPress={() => onSelect(query)}
            style={({ pressed }) => [styles.query, pressed && styles.pressed]}
          >
            <Icon
              name="clock"
              color={colors.gray2}
              size={15}
            />
            <Text
              numberOfLines={1}
              style={[styles.queryText, { color: colors['text-secondary'] }]}
            >
              {query}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${ query } 삭제`}
            hitSlop={10}
            onPress={() => onRemove(query)}
            style={({ pressed }) => pressed && styles.pressed}
          >
            <Icon
              name="close"
              color={colors.gray2}
              size={12}
            />
          </Pressable>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.gutter,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.xs,
  },
  title: {
    fontSize: font.body,
    fontWeight: '700',
  },
  clearAll: {
    fontSize: font.footnote,
  },
  empty: {
    paddingVertical: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    minHeight: 44,
  },
  query: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  queryText: {
    flex: 1,
    fontSize: font.body,
  },
  pressed: {
    opacity: 0.6,
  },
});
