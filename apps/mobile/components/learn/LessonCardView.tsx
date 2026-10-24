import { StyleSheet, View } from 'react-native';
import type { LessonCard } from '@diki/core';
import ArticleWebView from '@/components/detail/ArticleWebView';
import Text from '@/components/ui/Text';
import { useThemeColors } from '@/theme';

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
    gap: 14,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
  },
  body: {
    fontSize: 19,
    lineHeight: 30,
    fontWeight: '600',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
});
