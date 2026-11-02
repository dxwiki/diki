import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import BottomSheet from '@/components/ui/BottomSheet';
import Calendar from '@/components/ui/Calendar';
import Text from '@/components/ui/Text';
import { font, spacing, useThemeColors } from '@/theme';
import type { DateSelection } from './useTermListing';

const format = (day: string) => day.replace(/-/g, '.');

export const describeDates = ({ start, end }: DateSelection): string | null => {
  if (!start) return null;
  return end ? `${ format(start) } ~ ${ format(end) }` : format(start);
};

interface DateSheetProps {
  visible: boolean;
  value: DateSelection;
  onApply: (next: DateSelection)=> void;
  onClose: ()=> void;
}

export default function DateSheet({ visible, value, onApply, onClose }: DateSheetProps) {
  const colors = useThemeColors();
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    if (visible) setDraft(value);
  }, [visible, value]);

  const summary = describeDates(draft);

  return (
    <BottomSheet
      visible={visible}
      title="발행일"
      onClose={onClose}
      onReset={() => setDraft({ start: null, end: null })}
      onApply={() => onApply(draft)}
    >
      <View style={styles.body}>
        <Text
          accessibilityLiveRegion="polite"
          style={[styles.summary, { color: summary ? colors.accent : colors.gray1 }]}
        >
          {summary ? (draft.end ? summary : `${ summary } 하루`) : '시작일을 누르고, 기간이면 완료일을 눌러 주세요.'}
        </Text>
        <Calendar
          value={draft}
          onChange={setDraft}
        />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: spacing.gutter,
    gap: spacing.md,
  },
  summary: {
    fontSize: font.subhead,
    fontWeight: '600',
  },
});
