import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import type { StageSummary } from '@diki/core';
import Text from '@/components/ui/Text';
import { useThemeColors } from '@/theme';
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
        const fg = selected ? colors.background : locked ? colors.gray2 : colors.text;
        return (
          <Pressable
            key={stage.id}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={`${ i + 1 }단계 ${ stage.label }${ completed[i] ? ' 완료' : locked ? ' 잠김' : '' }`}
            onPress={() => onSelect(stage.id)}
            style={({ pressed }) => [
              styles.pill,
              selected
                ? { backgroundColor: colors.primary, borderColor: colors.primary }
                : { backgroundColor: colors.background, borderColor: colors.border },
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.inner}>
              {locked ? <Icon name="lock" color={fg} size={12} /> : null}
              {completed[i] ? <Icon name="check" color={fg} size={12} /> : null}
              <Text style={[styles.label, { color: fg }]}>{stage.label}</Text>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 8,
    paddingVertical: 2,
  },
  pill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.7,
  },
});
