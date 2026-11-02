import { StyleSheet, View } from 'react-native';
import type { TermData } from '@diki/core';
import TermListItem from '@/components/terms/TermListItem';
import { termKey } from '@/components/terms/termPath';
import { hairline, spacing, useThemeColors } from '@/theme';
import SectionBlock from './SectionBlock';

interface RecommendationsSectionProps {
  terms: TermData[];
  onPressTerm: (term: TermData)=> void;
}

export default function RecommendationsSection({ terms, onPressTerm }: RecommendationsSectionProps) {
  const colors = useThemeColors();
  return (
    <SectionBlock title="추천 포스트">
      <View style={[styles.list, { borderTopColor: colors.line }]}>
        {terms.map((term, index) => (
          <TermListItem
            key={termKey(term, index)}
            term={term}
            onPress={onPressTerm}
          />
        ))}
      </View>
    </SectionBlock>
  );
}

const styles = StyleSheet.create({
  list: {
    borderTopWidth: hairline,
    marginHorizontal: -spacing.gutter,
  },
});
