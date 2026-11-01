import { StyleSheet, View } from 'react-native';
import Text from '@/components/ui/Text';
import { radius, spacing, useThemeColors } from '@/theme';
import RichText from './RichText';
import SectionBlock from './SectionBlock';

interface UsecaseSectionProps {
  industries: string[];
  description: string;
  example: string;
}

export default function UsecaseSection({ industries, description, example }: UsecaseSectionProps) {
  const colors = useThemeColors();
  return (
    <SectionBlock title="사용 사례">
      {industries.length > 0 ? (
        <View style={styles.industries}>
          {industries.map((industry, index) => (
            <View
              key={`${ industry }-${ index }`}
              style={[styles.industry, { backgroundColor: colors['extreme-light'] }]}
            >
              <Text variant="caption">{industry}</Text>
            </View>
          ))}
        </View>
      ) : null}
      {description ? <RichText text={description} /> : null}
      {example ? (
        <View style={[styles.example, { borderLeftColor: colors.primary }]}>
          <Text style={styles.exampleLabel}>{'사례'}</Text>
          <RichText text={example} />
        </View>
      ) : null}
    </SectionBlock>
  );
}

const styles = StyleSheet.create({
  industries: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  industry: {
    borderRadius: radius.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  example: {
    borderLeftWidth: 3,
    paddingLeft: spacing.md,
    paddingVertical: spacing.xs,
    gap: spacing.sm,
  },
  exampleLabel: {
    fontWeight: '700',
  },
});
