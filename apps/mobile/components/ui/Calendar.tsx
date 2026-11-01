import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import Icon from '@/components/ui/Icon';
import Text from '@/components/ui/Text';
import { font, radius, spacing, useThemeColors } from '@/theme';

export interface DayRange {
  start: string | null;
  end: string | null;
}

interface CalendarProps {
  value: DayRange;
  onChange: (next: DayRange)=> void;
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

const pad = (n: number) => String(n).padStart(2, '0');
export const toDay = (y: number, m: number, d: number) => `${ y }-${ pad(m + 1) }-${ pad(d) }`;

// 첫 탭은 시작일, 두 번째 탭은 완료일, 이미 범위가 있으면 새로 시작한다
const nextRange = ({ start, end }: DayRange, day: string): DayRange => {
  if (!start || end) return { start: day, end: null };
  if (day === start) return { start, end: null };
  return day < start ? { start: day, end: start } : { start, end: day };
};

export default function Calendar({ value, onChange }: CalendarProps) {
  const colors = useThemeColors();
  const today = new Date();
  const initial = value.start ? value.start.split('-').map(Number) : [today.getFullYear(), today.getMonth() + 1];
  const [month, setMonth] = useState({ y: initial[0], m: initial[1] - 1 });

  const first = new Date(month.y, month.m, 1).getDay();
  const days = new Date(month.y, month.m + 1, 0).getDate();
  const cells: (number | null)[] = [...Array<null>(first).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);
  const todayKey = toDay(today.getFullYear(), today.getMonth(), today.getDate());

  const shift = (delta: number) => setMonth(({ y, m }) => {
    const date = new Date(y, m + delta, 1);
    return { y: date.getFullYear(), m: date.getMonth() };
  });

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="이전 달"
          hitSlop={10}
          onPress={() => shift(-1)}
          style={styles.nav}
        >
          <Icon
            name="chevronLeft"
            color={colors.text}
          />
        </Pressable>
        <Text
          accessibilityRole="header"
          style={styles.month}
        >
          {`${ month.y }년 ${ month.m + 1 }월`}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="다음 달"
          hitSlop={10}
          onPress={() => shift(1)}
          style={styles.nav}
        >
          <Icon
            name="chevronRight"
            color={colors.text}
          />
        </Pressable>
      </View>
      <View style={styles.grid}>
        {WEEKDAYS.map((label, i) => (
          <Text
            key={label}
            style={[styles.weekday, { color: i === 0 ? colors['level-5'] : colors.gray2 }]}
          >
            {label}
          </Text>
        ))}
        {cells.map((d, i) => {
          if (d === null) return <View key={`e${ i }`} style={styles.cell} />;
          const key = toDay(month.y, month.m, d);
          const isEdge = key === value.start || key === value.end;
          const inRange = !!value.start && !!value.end && key > value.start && key < value.end;
          return (
            <View
              key={key}
              style={[
                styles.cell,
                (inRange || (isEdge && value.end)) && { backgroundColor: colors['primary-opacity'] },
                key === value.start && value.end && styles.rangeStart,
                key === value.end && styles.rangeEnd,
              ]}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${ month.m + 1 }월 ${ d }일`}
                accessibilityState={{ selected: isEdge || inRange }}
                onPress={() => {
                  void Haptics.selectionAsync();
                  onChange(nextRange(value, key));
                }}
                style={[styles.day, isEdge && { backgroundColor: colors.primary }]}
              >
                <Text
                  style={[
                    styles.dayText,
                    { color: isEdge ? colors.background : inRange ? colors.accent : colors.text },
                    key === todayKey && !isEdge && { color: colors.primary, fontWeight: '700' },
                  ]}
                >
                  {String(d)}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nav: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  month: {
    fontSize: font.callout,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: spacing.xs,
  },
  weekday: {
    width: `${ 100 / 7 }%`,
    textAlign: 'center',
    fontSize: font.caption,
    paddingBottom: spacing.xs,
  },
  cell: {
    width: `${ 100 / 7 }%`,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rangeStart: {
    borderTopLeftRadius: radius.pill,
    borderBottomLeftRadius: radius.pill,
  },
  rangeEnd: {
    borderTopRightRadius: radius.pill,
    borderBottomRightRadius: radius.pill,
  },
  day: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: font.body,
  },
});
