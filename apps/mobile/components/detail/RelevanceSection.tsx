import { StyleSheet, View } from 'react-native';
import type { DetailRelevanceItem, RelevanceRole } from '@diki/core';
import Text from '@/components/ui/Text';
import { font, hairline, spacing, useThemeColors } from '@/theme';
import RichText from './RichText';
import SectionBlock from './SectionBlock';

const ROLE_LABELS: Record<RelevanceRole, { title: string; subtitle: string }> = {
  analyst: { title: '데이터 분석가', subtitle: 'Data Analyst' },
  scientist: { title: '데이터 과학자', subtitle: 'Data Scientist' },
  engineer: { title: '데이터 엔지니어', subtitle: 'Data Engineer' },
};

const MAX_SCORE = 5;

interface RelevanceSectionProps {
  items: DetailRelevanceItem[];
}

export default function RelevanceSection({ items }: RelevanceSectionProps) {
  const colors = useThemeColors();
  return (
    <SectionBlock title="직무 연관도">
      <View>
        {items.map((item, index) => {
          const label = ROLE_LABELS[item.role];
          const score = Math.min(Math.max(Math.round(item.score), 0), MAX_SCORE);
          return (
            <View
              key={item.role}
              style={[styles.row, index > 0 && { borderTopWidth: hairline, borderTopColor: colors.line }]}
            >
              <View style={styles.head}>
                <View>
                  <Text style={styles.title}>{label.title}</Text>
                  <Text variant="caption">{label.subtitle}</Text>
                </View>
                <View
                  style={styles.score}
                  accessible
                  accessibilityLabel={`연관도 ${ score }점 (${ MAX_SCORE }점 만점)`}
                >
                  {Array.from({ length: MAX_SCORE }, (_, index) => (
                    <View
                      key={index}
                      style={[styles.dot, { backgroundColor: index < score ? colors.primary : colors.gray4 }]}
                    />
                  ))}
                </View>
              </View>
              <RichText text={item.description} />
            </View>
          );
        })}
      </View>
    </SectionBlock>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: spacing.md + 2,
    gap: spacing.sm,
  },
  head: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: font.callout,
    fontWeight: '700',
  },
  score: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
