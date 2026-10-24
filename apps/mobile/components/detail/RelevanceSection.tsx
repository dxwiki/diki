import { StyleSheet, View } from 'react-native';
import type { DetailRelevanceItem, RelevanceRole } from '@diki/core';
import Text from '@/components/ui/Text';
import { useThemeColors } from '@/theme';
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
      {items.map((item) => {
        const label = ROLE_LABELS[item.role];
        const score = Math.min(Math.max(Math.round(item.score), 0), MAX_SCORE);
        return (
          <View
            key={item.role}
            style={[styles.card, { borderColor: colors['extreme-light'], backgroundColor: colors['background-secondary'] }]}
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
    </SectionBlock>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    gap: 8,
  },
  head: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  score: {
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
