import { StyleSheet, View } from 'react-native';
import Text from '@/components/ui/Text';
import { font, spacing, useThemeColors } from '@/theme';

export default function QuestionHeader({ tag, prompt, hint }: { tag?: string; prompt: string; hint?: string }) {
  const colors = useThemeColors();
  return (
    <View style={styles.header}>
      {tag ? (
        <View style={[styles.tag, { backgroundColor: colors['extreme-light'] }]}>
          <Text style={[styles.tagText, { color: colors.primary }]}>{tag}</Text>
        </View>
      ) : null}
      <Text style={styles.prompt}>{prompt}</Text>
      {hint ? <Text variant="caption">{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.sm,
  },
  tag: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  tagText: {
    fontSize: font.caption,
    fontWeight: '600',
  },
  prompt: {
    fontSize: font.title3,
    lineHeight: 28,
    fontWeight: '700',
  },
});
