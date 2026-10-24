import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type { TermData } from '@diki/core';
import Text from '@/components/ui/Text';
import { useThemeColors } from '@/theme';
import { difficultyLabel } from './termPath';

interface TermListItemProps {
  term: TermData;
  onPress: (term: TermData) => void;
}

function TermListItem({ term, onPress }: TermListItemProps) {
  const colors = useThemeColors();
  const level = difficultyLabel(term.difficulty?.level);
  const title = term.title?.ko ?? term.title?.en ?? '';
  return (
    <Pressable
      accessibilityRole={'button'}
      accessibilityLabel={title}
      onPress={() => onPress(term)}
      style={({ pressed }) => [styles.item, { borderBottomColor: colors['extreme-light'] }, pressed && styles.pressed]}
    >
      <View style={styles.head}>
        <Text style={styles.title}>{title}</Text>
        {level ? <Text style={[styles.level, { color: colors.primary }]}>{level}</Text> : null}
      </View>
      {term.title?.en && term.title.en !== title ? <Text variant={'caption'}>{term.title.en}</Text> : null}
      {term.description?.short ? (
        <Text
          variant={'caption'}
          numberOfLines={2}
          style={{ color: colors['text-secondary'] }}
        >
          {term.description.short}
        </Text>
      ) : null}
    </Pressable>
  );
}

export default memo(TermListItem);

const styles = StyleSheet.create({
  item: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    gap: 4,
  },
  pressed: {
    opacity: 0.6,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
  },
  level: {
    fontSize: 13,
  },
});
