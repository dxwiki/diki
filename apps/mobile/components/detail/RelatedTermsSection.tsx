import { Pressable, StyleSheet, View } from 'react-native';
import type { DetailRelatedTerm } from '@diki/core';
import Text from '@/components/ui/Text';
import { useThemeColors } from '@/theme';
import RichText from './RichText';
import SectionBlock from './SectionBlock';

interface RelatedTermsSectionProps {
  items: DetailRelatedTerm[];
  onPressTerm: (slug: string) => void;
}

export default function RelatedTermsSection({ items, onPressTerm }: RelatedTermsSectionProps) {
  const colors = useThemeColors();
  return (
    <SectionBlock title={'관련 용어'}>
      {items.map((item, index) => (
        <View
          key={`${ item.term }-${ index }`}
          style={[styles.item, { borderColor: colors['extreme-light'], backgroundColor: colors['background-secondary'] }]}
        >
          {item.slug ? (
            <Pressable
              accessibilityRole={'link'}
              accessibilityLabel={`${ item.term } 상세 보기`}
              onPress={() => {
                if (item.slug) onPressTerm(item.slug);
              }}
              style={({ pressed }) => pressed && styles.pressed}
            >
              <Text style={[styles.term, { color: colors.accent }]}>{item.term}</Text>
            </Pressable>
          ) : (
            <Text style={styles.term}>{item.term}</Text>
          )}
          <RichText text={item.description} />
        </View>
      ))}
    </SectionBlock>
  );
}

const styles = StyleSheet.create({
  item: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    gap: 6,
  },
  term: {
    fontSize: 16,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.6,
  },
});
