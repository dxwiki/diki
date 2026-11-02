import { ScrollView, StyleSheet, View } from 'react-native';
import type { TermData } from '@diki/core';
import PressableScale from '@/components/ui/PressableScale';
import Text from '@/components/ui/Text';
import { font, radius, spacing, useThemeColors } from '@/theme';
import { termKey } from './termPath';

interface TermChipsProps {
  title: string;
  terms: TermData[];
  onPress: (term: TermData)=> void;
  emptyText?: string;
}

// 좌우 여백을 스스로 가져 가로 스크롤이 화면 끝까지 닿는다
export default function TermChips({ title, terms, onPress, emptyText }: TermChipsProps) {
  const colors = useThemeColors();
  if (terms.length === 0 && !emptyText) return null;
  return (
    <View style={styles.wrap}>
      <Text style={[styles.heading, { color: colors.gray1 }]}>{title}</Text>
      {terms.length === 0 ? (
        <Text
          variant="caption"
          style={styles.gutter}
        >
          {emptyText}
        </Text>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.row}
          keyboardShouldPersistTaps="handled"
        >
          {terms.map((term, index) => (
            <PressableScale
              key={termKey(term, index)}
              accessibilityRole="button"
              onPress={() => onPress(term)}
              style={[styles.chip, { backgroundColor: colors['extreme-light'] }]}
            >
              <Text
                numberOfLines={1}
                style={[styles.title, { color: colors['text-secondary'] }]}
              >
                {term.title?.ko ?? term.title?.en ?? ''}
              </Text>
            </PressableScale>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  heading: {
    fontSize: font.footnote,
    fontWeight: '600',
    paddingHorizontal: spacing.gutter,
  },
  gutter: {
    paddingHorizontal: spacing.gutter,
  },
  row: {
    gap: spacing.sm,
    paddingHorizontal: spacing.gutter,
  },
  chip: {
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    maxWidth: 200,
  },
  title: {
    fontSize: font.subhead,
  },
  pressed: {
    opacity: 0.7,
  },
});
