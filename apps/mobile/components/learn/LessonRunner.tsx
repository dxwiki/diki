import { useCallback, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View, type ScrollViewInstance } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { LessonItem } from '@diki/core';
import Button from '@/components/ui/Button';
import Text from '@/components/ui/Text';
import { useProgress } from '@/lib/progress';
import { font, spacing, useThemeColors } from '@/theme';
import AnswerFeedback from './AnswerFeedback';
import ChoiceView from './ChoiceView';
import LessonCardView from './LessonCardView';
import LessonComplete from './LessonComplete';
import MatchView from './MatchView';
import ProgressBar from './ProgressBar';

interface LessonRunnerProps {
  progressKey: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  lesson: LessonItem[];
  next: { title: string; onPress: ()=> void } | null;
  onMap: ()=> void;
  onOpenTerm: ()=> void;
}

interface Answer {
  selected: string | null;
  assigned: Record<number, number>;
  correct: boolean;
}

export default function LessonRunner({ progressKey, eyebrow, title, subtitle, lesson, next, onMap, onOpenTerm }: LessonRunnerProps) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { recordAttempt } = useProgress();
  const scrollRef = useRef<ScrollViewInstance>(null);
  const recorded = useRef(false);

  const items = useMemo(() => new Map(lesson.map((item) => [item.id, item])), [lesson]);
  const questionIds = useMemo(() => lesson.filter((item) => item.kind !== 'card').map((item) => item.id), [lesson]);

  // 틀린 문제는 큐 끝에 다시 넣어 레슨 안에서 한 번 더 푼다
  const [queue, setQueue] = useState(() => lesson.map((item) => item.id));
  const [position, setPosition] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [assigned, setAssigned] = useState<Record<number, number>>({});
  const [activeLeft, setActiveLeft] = useState<number | null>(null);
  const [activeRight, setActiveRight] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, Answer>>({});
  const [mistakes, setMistakes] = useState<string[]>([]);
  const [finished, setFinished] = useState(false);

  const current = items.get(queue[position]);
  const answer = answers[position];
  const checked = !!answer;
  const isRetry = position >= lesson.length;
  const canCheck = current?.kind === 'choice' ? !!selected
    : current?.kind === 'match' ? Object.keys(assigned).length === current.pairs.length : false;

  const goTo = useCallback((target: number) => {
    const saved = answers[target];
    setSelected(saved?.selected ?? null);
    setAssigned(saved?.assigned ?? {});
    setActiveLeft(null);
    setActiveRight(null);
    setPosition(target);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [answers]);

  const check = () => {
    if (!current || current.kind === 'card' || !canCheck) return;
    const correct = current.kind === 'choice'
      ? selected === current.answer
      : current.pairs.every((_, i) => assigned[i] === i);
    void Haptics.notificationAsync(correct ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error);
    setAnswers((prev) => ({ ...prev, [position]: { selected, assigned, correct } }));
    if (!correct) {
      setMistakes((prev) => (prev.includes(current.id) ? prev : [...prev, current.id]));
      setQueue((prev) => [...prev, current.id]);
    }
  };

  const advance = () => {
    if (position + 1 < queue.length) {
      goTo(position + 1);
      return;
    }
    setFinished(true);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
    if (!recorded.current) {
      recorded.current = true;
      recordAttempt('learn', progressKey, { completed: true, review: mistakes.length > 0 });
    }
  };

  const link = (left: number, right: number) => {
    setAssigned((prev) => {
      const cleaned = Object.fromEntries(Object.entries(prev).filter(([l, r]) => Number(l) !== left && r !== right));
      return { ...cleaned, [left]: right };
    });
    setActiveLeft(null);
    setActiveRight(null);
  };

  const onLeft = (i: number) => {
    if (activeRight !== null) link(i, activeRight);
    else setActiveLeft(activeLeft === i ? null : i);
  };

  const onRight = (pairIndex: number) => {
    if (activeLeft !== null) link(activeLeft, pairIndex);
    else setActiveRight(activeRight === pairIndex ? null : pairIndex);
  };

  const restart = () => {
    setQueue(lesson.map((item) => item.id));
    setAnswers({});
    setMistakes([]);
    setSelected(null);
    setAssigned({});
    setActiveLeft(null);
    setActiveRight(null);
    setPosition(0);
    setFinished(false);
    recorded.current = false;
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  };

  const progress = finished ? 1 : queue.length ? position / queue.length : 0;
  const primaryLabel = !current || current.kind === 'card' || checked
    ? position + 1 < queue.length ? '계속' : '레슨 마치기'
    : '확인';

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        ref={scrollRef}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.content}
      >
        <View style={styles.head}>
          <Text variant="caption">{eyebrow}</Text>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{title}</Text>
            {subtitle && subtitle !== title ? <Text style={[styles.subtitle, { color: colors.gray1 }]}>{subtitle}</Text> : null}
          </View>
          <ProgressBar value={progress} />
        </View>

        {finished ? (
          <LessonComplete
            questionCount={questionIds.length}
            firstTryCorrect={questionIds.filter((id) => !mistakes.includes(id)).length}
            next={next}
            onMap={onMap}
            onRestart={restart}
            onOpenTerm={onOpenTerm}
          />
        ) : current ? (
          <View style={styles.item}>
            {current.kind === 'card' ? <LessonCardView card={current} /> : null}
            {current.kind === 'choice' ? (
              <ChoiceView
                question={isRetry ? { ...current, tag: '다시 풀기' } : current}
                selected={selected}
                checked={checked}
                onSelect={setSelected}
              />
            ) : null}
            {current.kind === 'match' ? (
              <MatchView
                question={isRetry ? { ...current, tag: '다시 풀기' } : current}
                assigned={assigned}
                activeLeft={activeLeft}
                activeRight={activeRight}
                checked={checked}
                onLeft={onLeft}
                onRight={onRight}
              />
            ) : null}
            {checked && current.kind !== 'card' ? (
              <AnswerFeedback
                correct={answer.correct}
                explanation={current.kind === 'choice' ? current.explanation : undefined}
              />
            ) : null}
          </View>
        ) : null}
      </ScrollView>

      {!finished ? (
        <View style={[styles.bar, { paddingBottom: insets.bottom + 12, borderTopColor: colors.line, backgroundColor: colors.background }]}>
          <View style={styles.barButton}>
            <Button
              label="이전"
              variant="secondary"
              disabled={position === 0}
              onPress={() => goTo(position - 1)}
            />
          </View>
          <View style={styles.barPrimary}>
            <Button
              label={primaryLabel}
              disabled={primaryLabel === '확인' && !canCheck}
              onPress={primaryLabel === '확인' ? check : advance}
            />
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.gutter,
    paddingBottom: spacing.section * 1.5,
    gap: spacing.lg,
  },
  head: {
    gap: spacing.sm,
  },
  titleRow: {
    gap: spacing.xxs,
  },
  title: {
    fontSize: font.title1,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: font.callout,
  },
  item: {
    gap: spacing.gutter,
  },
  bar: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  barButton: {
    flex: 1,
  },
  barPrimary: {
    flex: 2,
  },
});
