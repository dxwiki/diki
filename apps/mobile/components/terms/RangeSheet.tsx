import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { NumberRange } from '@diki/core';
import BottomSheet from '@/components/ui/BottomSheet';
import RangeSlider from '@/components/ui/RangeSlider';
import Text from '@/components/ui/Text';
import { font, spacing } from '@/theme';
import { FULL_RANGE } from './useTermListing';

export interface RangeRow {
  key: string;
  label?: string;
  labels: string[];
}

interface RangeSheetProps {
  visible: boolean;
  title: string;
  rows: RangeRow[];
  value: Record<string, NumberRange>;
  onApply: (next: Record<string, NumberRange>)=> void;
  onClose: ()=> void;
}

// 슬라이더 값(0~4)과 필터 값(1~5)을 오가며, 적용을 눌러야 반영한다
export default function RangeSheet({ visible, title, rows, value, onApply, onClose }: RangeSheetProps) {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    if (visible) setDraft(value);
  }, [visible, value]);

  const reset = () => setDraft(Object.fromEntries(rows.map((row) => [row.key, FULL_RANGE])));

  return (
    <BottomSheet
      visible={visible}
      title={title}
      onClose={onClose}
      onReset={reset}
      onApply={() => onApply(draft)}
      scroll={false}
    >
      <View style={styles.body}>
        {rows.map((row) => {
          const range = draft[row.key] ?? FULL_RANGE;
          return (
            <View
              key={row.key}
              style={styles.row}
            >
              {row.label ? <Text style={styles.rowLabel}>{row.label}</Text> : null}
              <RangeSlider
                labels={row.labels}
                value={[range.min - 1, range.max - 1]}
                accessibilityLabel={`${ title } ${ row.label ?? '' }`.trim()}
                onChange={([lo, hi]) => setDraft((prev) => ({ ...prev, [row.key]: { min: lo + 1, max: hi + 1 } }))}
              />
            </View>
          );
        })}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.sm,
    gap: spacing.lg,
  },
  row: {
    gap: spacing.xs,
  },
  rowLabel: {
    fontSize: font.body,
    fontWeight: '700',
  },
});
