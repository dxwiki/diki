import { StyleSheet, View } from 'react-native';
import type { DetailTag, Title } from '@diki/core';
import Chip from '@/components/ui/Chip';
import Text from '@/components/ui/Text';
import { useThemeColors } from '@/theme';

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
      <Text
        variant="title"
        accessibilityRole="header"
        style={styles.title}
      >
        {ko || en}
      </Text>
      {en && en !== ko ? <Text style={[styles.en, { color: colors.gray1 }]}>{en}</Text> : null}
      {etc.length > 0 ? <Text variant="caption">{etc.join(', ')}</Text> : null}
      {shortDescription ? <Text style={{ color: colors['text-secondary'] }}>{shortDescription}</Text> : null}
      {tags.length > 0 ? (
        <View style={styles.tags}>
          {tags.map((tag, index) => (
            <Chip
              key={`${ tag.name }-${ index }`}
              label={`#${ tag.name }`}
              accessibilityLabel={`태그 ${ tag.name }`}
              onPress={() => {
                if (tag.slug) onPressTag(tag.slug);
              }}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 8,
  },
  title: {
    fontSize: 28,
  },
  en: {
    fontSize: 17,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
});
