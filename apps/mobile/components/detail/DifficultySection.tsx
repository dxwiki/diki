import { StyleSheet, View } from 'react-native';
import { difficultyLabel } from '@/components/terms/termPath';
import Text from '@/components/ui/Text';
import { useThemeColors, type ColorName } from '@/theme';
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
      <View style={[styles.badge, { borderColor: levelColor }]}>
        <Text style={[styles.badgeText, { color: levelColor }]}>{difficultyLabel(level) ?? `${ level }`}</Text>
      </View>
      <View style={styles.description}>
        {description ? <RichText text={description} /> : <Text variant={'caption'}>{'난이도에 대한 설명을 입력하세요.'}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  badge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 2,
    paddingHorizontal: 10,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  description: {
    flex: 1,
  },
});
