import { StyleSheet, View } from 'react-native';
import type { LessonCard } from '@diki/core';
import ArticleWebView from '@/components/detail/ArticleWebView';
import Text from '@/components/ui/Text';
import { font, spacing, useThemeColors } from '@/theme';

export default function LessonCardView({ card }: { card: LessonCard }) {
  const colors = useThemeColors();
  return (
    <View style={styles.card}>
      <Text style={[styles.label, { color: colors.primary }]}>{card.label}</Text>
      {card.markdown ? (
        <ArticleWebView content={card.body} />
      ) : (
        <Text style={styles.body}>{card.body}</Text>
      )}
      {card.tags && card.tags.length > 0 ? (
        <View style={styles.tags}>
          {card.tags.map((tag) => (
            <View
              key={tag}
              style={[styles.tag, { backgroundColor: colors['extreme-light'] }]}
            >
              <Text variant="caption">{tag}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
  label: {
    fontSize: font.subhead,
    fontWeight: '700',
  },
  body: {
    fontSize: font.title3,
    lineHeight: 30,
    fontWeight: '600',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tag: {
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
});
