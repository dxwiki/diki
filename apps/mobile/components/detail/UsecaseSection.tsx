import { StyleSheet, View } from 'react-native';
import Text from '@/components/ui/Text';
import { useThemeColors } from '@/theme';
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
              style={[styles.industry, { borderColor: colors.border }]}
            >
              <Text variant="caption">{industry}</Text>
            </View>
          ))}
        </View>
      ) : null}
      {description ? <RichText text={description} /> : null}
      {example ? (
        <View style={[styles.example, { backgroundColor: colors['background-secondary'], borderLeftColor: colors.primary }]}>
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
    gap: 6,
  },
  industry: {
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 3,
    paddingHorizontal: 10,
  },
  example: {
    borderLeftWidth: 4,
    borderRadius: 6,
    padding: 12,
    gap: 6,
  },
  exampleLabel: {
    fontWeight: '700',
  },
});
