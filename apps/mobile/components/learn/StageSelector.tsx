import { ScrollView, StyleSheet, View } from 'react-native';
import PressableScale from '@/components/ui/PressableScale';
import type { StageSummary } from '@diki/core';
import Text from '@/components/ui/Text';
import { font, radius, spacing, useThemeColors } from '@/theme';
import Icon from './Icon';

interface StageSelectorProps {
  stages: StageSummary[];
  unlocked: boolean[];
  completed: boolean[];
  selectedId: string;
  onSelect: (id: string)=> void;
}

export default function StageSelector({ stages, unlocked, completed, selectedId, onSelect }: StageSelectorProps) {
  const colors = useThemeColors();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {stages.map((stage, i) => {
        const selected = stage.id === selectedId;
        const locked = !unlocked[i];
        const fg = selected ? colors.background : locked ? colors.gray2 : colors['text-secondary'];
        return (
          <PressableScale
            key={stage.id}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={`${ i + 1 }단계 ${ stage.label }${ completed[i] ? ' 완료' : locked ? ' 잠김' : '' }`}
            onPress={() => onSelect(stage.id)}
            style={[styles.pill, { backgroundColor: selected ? colors.primary : colors['extreme-light'] }]}
          >
            <View style={styles.inner}>
              {locked ? <Icon name="lock" color={fg} size={12} /> : null}
              {completed[i] ? <Icon name="check" color={fg} size={12} /> : null}
              <Text style={[styles.label, { color: fg }]}>{stage.label}</Text>
            </View>
          </PressableScale>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: spacing.sm,
    paddingHorizontal: spacing.gutter,
  },
  pill: {
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  label: {
    fontSize: font.body,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.7,
  },
});
