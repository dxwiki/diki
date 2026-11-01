import { StyleSheet, View } from 'react-native';
import { difficultyLabel } from '@/components/terms/termPath';
import LabelPill from '@/components/ui/LabelPill';
import Text from '@/components/ui/Text';
import { type ColorName, spacing, useThemeColors } from '@/theme';
import RichText from './RichText';

interface DifficultySectionProps {
  level: number;
  description: string;
}

export default function DifficultySection({ level, description }: DifficultySectionProps) {
  const colors = useThemeColors();
  const levelColor = colors[`level-${ Math.min(Math.max(Math.round(level), 1), 5) }` as ColorName] ?? colors.primary;
  return (
    <View style={styles.row}>
      <LabelPill
        label={difficultyLabel(level) ?? `${ level }`}
        color={levelColor}
      />
      <View style={styles.description}>
        {description ? <RichText text={description} /> : <Text variant="caption">{'난이도에 대한 설명을 입력하세요.'}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  description: {
    flex: 1,
  },
});
