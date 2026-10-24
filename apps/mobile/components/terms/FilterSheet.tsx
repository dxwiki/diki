import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { UPDATED_PERIODS, type UpdatedPeriod } from '@diki/core';
import Button from '@/components/ui/Button';
import Chip from '@/components/ui/Chip';
import Text from '@/components/ui/Text';
import { useThemeColors } from '@/theme';
import { DIFFICULTY_LABELS } from './termPath';
import { FULL_LEVEL_RANGE, type TermListingFilterState } from './useTermListing';

export const PERIOD_LABELS: Record<UpdatedPeriod, string> = {
  all: '전체',
  '7d': '최근 7일',
  '30d': '최근 30일',
  '90d': '최근 90일',
  '1y': '최근 1년',
};

const LEVELS = [1, 2, 3, 4, 5];

interface FilterSheetProps {
  visible: boolean;
  value: TermListingFilterState;
  onApply: (next: TermListingFilterState)=> void;
  onClose: ()=> void;
}

export default function FilterSheet({ visible, value, onApply, onClose }: FilterSheetProps) {
  const colors = useThemeColors();
  const [draft, setDraft] = useState<TermListingFilterState>(value);

  useEffect(() => {
    if (visible) setDraft(value);
  }, [visible, value]);

  const setMin = (min: number) => setDraft((prev) => ({ ...prev, level: { min, max: Math.max(min, prev.level.max) } }));
  const setMax = (max: number) => setDraft((prev) => ({ ...prev, level: { min: Math.min(max, prev.level.min), max } }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.wrap}>
        <Pressable
          style={[styles.backdrop, { backgroundColor: colors['background-opacity'] }]}
          accessibilityLabel="필터 닫기"
          onPress={onClose}
        />
        <View style={[styles.sheet, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <ScrollView contentContainerStyle={styles.content}>
            <Text variant="title">{'필터'}</Text>
            <Text>{'난이도 최소'}</Text>
            <View style={styles.row}>
              {LEVELS.map((level) => (
                <Chip
                  key={`min-${ level }`}
                  label={`${ level } ${ DIFFICULTY_LABELS[level - 1] }`}
                  selected={draft.level.min === level}
                  onPress={() => setMin(level)}
                />
              ))}
            </View>
            <Text>{'난이도 최대'}</Text>
            <View style={styles.row}>
              {LEVELS.map((level) => (
                <Chip
                  key={`max-${ level }`}
                  label={`${ level } ${ DIFFICULTY_LABELS[level - 1] }`}
                  selected={draft.level.max === level}
                  onPress={() => setMax(level)}
                />
              ))}
            </View>
            <Text>{'수정일'}</Text>
            <View style={styles.row}>
              {UPDATED_PERIODS.map((period) => (
                <Chip
                  key={period}
                  label={PERIOD_LABELS[period]}
                  selected={draft.period === period}
                  onPress={() => setDraft((prev) => ({ ...prev, period }))}
                />
              ))}
            </View>
            <View style={styles.actions}>
              <View style={styles.action}>
                <Button
                  label="초기화"
                  variant="outline"
                  onPress={() => setDraft({ level: FULL_LEVEL_RANGE, period: 'all' })}
                />
              </View>
              <View style={styles.action}>
                <Button
                  label="적용"
                  onPress={() => onApply(draft)}
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  sheet: {
    borderTopWidth: 1,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
  },
  content: {
    padding: 20,
    paddingBottom: 36,
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  action: {
    flex: 1,
  },
});
