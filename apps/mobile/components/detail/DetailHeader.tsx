import { Pressable, StyleSheet, View } from 'react-native';
import type { DetailTag, Title } from '@diki/core';
import LabelPill from '@/components/ui/LabelPill';
import Text from '@/components/ui/Text';
import { font, radius, spacing, useThemeColors } from '@/theme';

interface DetailHeaderProps {
  title: Title;
  shortDescription: string;
  tags: DetailTag[];
  onPressTag: (slug: string)=> void;
}

export default function DetailHeader({ title, shortDescription, tags, onPressTag }: DetailHeaderProps) {
  const colors = useThemeColors();
  const ko = title.ko ?? '';
  const en = title.en ?? '';
  const etc = (title.etc ?? []).filter((name) => name.trim() !== '');
  return (
    <View style={styles.header}>
      <View style={styles.titles}>
        <Text
          variant="title"
          accessibilityRole="header"
          style={styles.title}
        >
          {ko || en}
        </Text>
        {en && en !== ko ? <Text style={[styles.en, { color: colors.gray1 }]}>{en}</Text> : null}
        {etc.length > 0 ? <Text variant="caption">{etc.join(', ')}</Text> : null}
      </View>
      {shortDescription ? (
        <View style={styles.row}>
          <LabelPill label="요약" />
          <Text style={[styles.rowText, { color: colors['text-secondary'] }]}>{shortDescription}</Text>
        </View>
      ) : null}
      {tags.length > 0 ? (
        <View style={styles.row}>
          <LabelPill label="태그" />
          <View style={styles.tags}>
            {tags.map((tag, index) => (
              <Pressable
                key={`${ tag.name }-${ index }`}
                accessibilityRole={tag.slug ? 'link' : 'text'}
                accessibilityLabel={`태그 ${ tag.name }`}
                disabled={!tag.slug}
                onPress={() => {
                  if (tag.slug) onPressTag(tag.slug);
                }}
                style={({ pressed }) => [
                  styles.tag,
                  { backgroundColor: tag.slug ? colors['primary-opacity'] : colors['extreme-light'] },
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.tagText, { color: tag.slug ? colors.accent : colors['text-secondary'] }]}>{tag.name}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.md,
  },
  titles: {
    gap: spacing.sm,
  },
  title: {
    fontSize: font.title1,
  },
  en: {
    fontSize: font.headline,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  rowText: {
    flex: 1,
    fontSize: font.callout,
    lineHeight: 24,
  },
  tags: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tag: {
    borderRadius: radius.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  tagText: {
    fontSize: font.subhead,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.6,
  },
});
