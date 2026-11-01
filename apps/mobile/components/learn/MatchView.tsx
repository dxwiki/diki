import { Pressable, StyleSheet, View } from 'react-native';
import type { LessonMatch } from '@diki/core';
import Text from '@/components/ui/Text';
import { font, spacing, useThemeColors } from '@/theme';
import QuestionHeader from './QuestionHeader';

interface MatchViewProps {
  question: LessonMatch;
  assigned: Record<number, number>;
  activeLeft: number | null;
  activeRight: number | null;
  checked: boolean;
  onLeft: (index: number)=> void;
  onRight: (pairIndex: number)=> void;
}

export default function MatchView({ question, assigned, activeLeft, activeRight, checked, onLeft, onRight }: MatchViewProps) {
  const colors = useThemeColors();
  const rightOwner = Object.fromEntries(Object.entries(assigned).map(([left, right]) => [right, Number(left)]));

  return (
    <View style={styles.wrap}>
      <QuestionHeader
        tag={question.tag}
        prompt={question.prompt}
        hint="용어를 누른 뒤 맞는 설명을 눌러 연결하세요."
      />
      <View style={styles.rows}>
        {question.pairs.map((pair, i) => {
          const pairIndex = question.rightOrder[i];
          const owner = rightOwner[pairIndex];
          const linked = assigned[i] !== undefined;
          const ok = assigned[i] === i;
          const leftBorder = checked
            ? ok ? colors['level-2'] : colors['level-5']
            : activeLeft === i ? colors.primary : 'transparent';
          return (
            <View
              key={pair.left}
              style={styles.row}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: activeLeft === i, disabled: checked }}
                accessibilityLabel={`용어 ${ i + 1 } ${ pair.left }${ linked ? ', 연결됨' : '' }`}
                disabled={checked}
                onPress={() => onLeft(i)}
                style={[styles.cell, styles.left, { backgroundColor: colors['extreme-light'], borderColor: leftBorder }]}
              >
                <View style={[styles.num, { backgroundColor: linked || activeLeft === i ? colors.primary : colors.gray4 }]}>
                  <Text style={[styles.numText, { color: linked || activeLeft === i ? colors.background : colors.gray1 }]}>{String(i + 1)}</Text>
                </View>
                <Text style={[styles.leftText, { color: checked ? (ok ? colors['level-2'] : colors['level-5']) : colors.text }]}>{pair.left}</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: activeRight === pairIndex, disabled: checked }}
                accessibilityLabel={`설명: ${ question.pairs[pairIndex].right }${ owner !== undefined ? `, ${ owner + 1 }번 용어와 연결됨` : '' }`}
                disabled={checked}
                onPress={() => onRight(pairIndex)}
                style={[styles.cell, styles.right, {
                  backgroundColor: colors['extreme-light'],
                  borderColor: activeRight === pairIndex ? colors.primary : 'transparent',
                }]}
              >
                <View style={[styles.num, { backgroundColor: owner !== undefined ? colors.primary : colors.background }]}>
                  <Text style={[styles.numText, { color: colors.background }]}>{owner !== undefined ? String(owner + 1) : ''}</Text>
                </View>
                <Text style={[styles.rightText, { color: colors['text-secondary'] }]}>{question.pairs[pairIndex].right}</Text>
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
    gap: spacing.gutter,
  },
  rows: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  cell: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    borderRadius: 14,
    borderWidth: 2,
    padding: spacing.md,
  },
  left: {
    flex: 2,
  },
  right: {
    flex: 3,
  },
  num: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numText: {
    fontSize: font.caption,
    fontWeight: '700',
  },
  leftText: {
    flex: 1,
    fontSize: font.body,
    fontWeight: '700',
  },
  rightText: {
    flex: 1,
    fontSize: font.footnote,
    lineHeight: 19,
  },
});
