import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View, type ScrollViewInstance } from 'react-native';
import * as Haptics from 'expo-haptics';
import type { InterviewContent } from '@diki/core';
import Button from '@/components/ui/Button';
import Text from '@/components/ui/Text';
import { useProgress } from '@/lib/progress';
import { font, hairline, radius, spacing, tint, useThemeColors } from '@/theme';

type Assessment = 'met' | 'missing';

const MIN_ANSWER_LENGTH = 10;

interface InterviewRunnerProps {
  progressKey: string;
  eyebrow: string;
  title: string;
  roleLabel: string;
  content: InterviewContent;
  reference: { short: string; relevance: string; example: string };
  next: { title: string; onPress: ()=> void } | null;
  onMap: ()=> void;
  onOpenTerm: ()=> void;
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  const colors = useThemeColors();
  if (!items.length) return null;
  return (
    <View style={styles.listBlock}>
      <Text style={styles.subTitle}>{title}</Text>
      {items.map((item) => (
        <Text
          key={item}
          style={[styles.bullet, { color: colors.gray1 }]}
        >
          {`· ${ item }`}
        </Text>
      ))}
    </View>
  );
}

// 웹 InterviewStepClient 와 같은 흐름: 질문 → 답변 → 평가 기준 공개 → 항목별 자가 점검 → 완료 기록
export default function InterviewRunner({ progressKey, eyebrow, title, roleLabel, content, reference, next, onMap, onOpenTerm }: InterviewRunnerProps) {
  const colors = useThemeColors();
  const { ready, state, recordAttempt, saveDraft } = useProgress();
  const scrollRef = useRef<ScrollViewInstance>(null);
  const [answer, setAnswer] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [assessment, setAssessment] = useState<Record<number, Assessment>>({});
  const [finished, setFinished] = useState(false);
  const loadedDraft = useRef(false);

  useEffect(() => {
    if (!ready || loadedDraft.current) return;
    loadedDraft.current = true;
    setAnswer(state.drafts[progressKey] ?? '');
  }, [ready, state.drafts, progressKey]);

  // 작성 중인 답변은 0.8초 뒤 기기에 저장한다
  useEffect(() => {
    if (!loadedDraft.current) return;
    const timer = setTimeout(() => saveDraft(progressKey, answer), 800);
    return () => clearTimeout(timer);
  }, [answer, progressKey, saveDraft]);

  const canReveal = answer.trim().length >= MIN_ANSWER_LENGTH;
  const allAssessed = content.items.every((_, i) => assessment[i]);
  const missing = content.items.filter((_, i) => assessment[i] === 'missing');

  const reveal = () => {
    setRevealed(true);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 150);
  };

  const finish = () => {
    setFinished(true);
    recordAttempt('interview', progressKey, { completed: true, review: missing.length > 0 });
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 150);
  };

  const practiceAgain = () => {
    setFinished(false);
    setRevealed(false);
    setAssessment({});
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  return (
    <ScrollView
      ref={scrollRef}
      style={{ backgroundColor: colors.background }}
      contentInsetAdjustmentBehavior="automatic"
      automaticallyAdjustKeyboardInsets
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      contentContainerStyle={styles.content}
    >
      <View style={styles.head}>
        <Text variant="caption">{eyebrow}</Text>
        <Text style={styles.title}>{title}</Text>
      </View>

      <View style={[styles.question, { backgroundColor: colors['extreme-light'] }]}>
        <Text style={[styles.tag, { color: colors.primary }]}>{'면접 질문'}</Text>
        <Text style={styles.questionText}>{content.question}</Text>
      </View>

      <View style={styles.section}>
        <Text
          accessibilityRole="header"
          style={styles.sectionTitle}
        >
          {'내 답변'}
        </Text>
        <Text variant="caption">{'면접관에게 말하듯 적어 보세요. 작성 중인 답변은 이 기기에 자동 저장돼요.'}</Text>
        <TextInput
          value={answer}
          onChangeText={setAnswer}
          editable={!revealed || finished}
          multiline
          textAlignVertical="top"
          placeholder="핵심 정의부터 시작해 사례와 근거를 덧붙여 보세요."
          placeholderTextColor={colors.gray2}
          selectionColor={colors.primary}
          accessibilityLabel="내 답변"
          style={[styles.input, { color: colors.text, backgroundColor: colors['extreme-light'] }]}
        />
        <View style={styles.counter}>
          <Text variant="caption">{canReveal ? '' : `${ MIN_ANSWER_LENGTH }자 이상 작성하면 평가 기준을 볼 수 있어요`}</Text>
          <Text variant="caption">{`${ answer.trim().length }자`}</Text>
        </View>
        {!revealed ? (
          <Button
            label="답변 제출하고 평가 기준 보기"
            disabled={!canReveal}
            onPress={reveal}
          />
        ) : null}
      </View>

      {revealed ? (
        <View style={styles.section}>
          <Text
            accessibilityRole="header"
            style={styles.sectionTitle}
          >
            {'평가 기준 확인 · 자기 점검'}
          </Text>
          <Text variant="caption">{'내 답변이 각 항목을 충족했는지 스스로 점검해요. AI 채점이나 합격 가능성 평가가 아니에요.'}</Text>
          <View style={{ borderTopWidth: hairline, borderTopColor: colors.line }}>
            {content.items.map((item, i) => (
              <View
                key={item.label}
                style={[styles.item, { borderBottomColor: colors.line }]}
              >
                <Text style={styles.itemTitle}>{`${ i + 1 }. ${ item.label }`}</Text>
                <Text style={[styles.itemDetail, { color: colors.gray1 }]}>{item.detail}</Text>
                <View
                  accessibilityRole="radiogroup"
                  style={styles.choices}
                >
                  {(['met', 'missing'] as Assessment[]).map((value) => {
                    const selected = assessment[i] === value;
                    const tone = value === 'met' ? colors['level-2'] : colors['level-4'];
                    return (
                      <Pressable
                        key={value}
                        accessibilityRole="radio"
                        accessibilityState={{ checked: selected, disabled: finished }}
                        accessibilityLabel={`${ item.label } ${ value === 'met' ? '충족' : '보완 필요' }`}
                        disabled={finished}
                        onPress={() => {
                          if (!selected) void Haptics.selectionAsync();
                          setAssessment((prev) => ({ ...prev, [i]: value }));
                        }}
                        style={[styles.choice, { backgroundColor: selected ? tone : colors['extreme-light'] }]}
                      >
                        <Text style={[styles.choiceText, { color: selected ? colors.background : colors.gray1 }]}>{value === 'met' ? '충족' : '보완 필요'}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>

          <View style={[styles.reference, { backgroundColor: colors['extreme-light'] }]}>
            {content.sampleAnswer ? (
              <>
                <Text style={styles.subTitle}>{'답변 예시'}</Text>
                <Text style={[styles.body, { color: colors['text-secondary'] }]}>{content.sampleAnswer}</Text>
              </>
            ) : (
              <>
                <Text style={styles.subTitle}>{'용어사전 기반 참고 자료'}</Text>
                <Text variant="caption">{'정의'}</Text>
                <Text style={[styles.body, { color: colors['text-secondary'] }]}>{reference.short}</Text>
                {reference.relevance ? (
                  <>
                    <Text variant="caption">{`${ roleLabel }에게 중요한 이유`}</Text>
                    <Text style={[styles.body, { color: colors['text-secondary'] }]}>{reference.relevance}</Text>
                  </>
                ) : null}
                {reference.example ? (
                  <>
                    <Text variant="caption">{'활용 사례'}</Text>
                    <Text style={[styles.body, { color: colors['text-secondary'] }]}>{reference.example}</Text>
                  </>
                ) : null}
                <Pressable
                  accessibilityRole="link"
                  onPress={onOpenTerm}
                >
                  <Text style={[styles.link, { color: colors.primary }]}>{'용어사전에서 자세히 보기'}</Text>
                </Pressable>
              </>
            )}
          </View>

          <ListBlock
            title="흔한 누락"
            items={content.commonMisses}
          />
          <ListBlock
            title="꼬리 질문 대비"
            items={content.followUps}
          />

          {!finished ? (
            <Button
              label={allAssessed ? '점검 완료' : '모든 항목을 점검해 주세요'}
              disabled={!allAssessed}
              onPress={finish}
            />
          ) : (
            <View style={styles.result}>
              <View style={[styles.resultBox, { backgroundColor: tint(missing.length ? colors['level-4'] : colors['level-2']) }]}>
                <Text style={[styles.resultTitle, { color: missing.length ? colors['level-4'] : colors['level-2'] }]}>
                  {missing.length ? `연습 완료 · ${ missing.length }개 항목은 복습 목록에 담았어요` : '연습 완료 · 모든 항목을 충족했어요'}
                </Text>
                {missing.length ? <Text variant="caption">{`보완할 항목: ${ missing.map((item) => item.label).join(', ') }`}</Text> : null}
              </View>
              {next ? (
                <Button
                  label={`다음 질문 · ${ next.title }`}
                  onPress={next.onPress}
                />
              ) : null}
              <Button
                label="답변 보완하기"
                variant="secondary"
                onPress={practiceAgain}
              />
              <Button
                label="코스 지도로"
                variant="secondary"
                onPress={onMap}
              />
            </View>
          )}
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.gutter,
    paddingBottom: spacing.section * 1.5,
    gap: spacing.lg,
  },
  head: {
    gap: spacing.sm,
  },
  title: {
    fontSize: font.title1,
    fontWeight: '700',
  },
  question: {
    borderRadius: radius.md,
    borderCurve: 'continuous',
    padding: spacing.gutter,
    gap: spacing.sm,
  },
  tag: {
    fontSize: font.footnote,
    fontWeight: '700',
  },
  questionText: {
    fontSize: font.title3,
    lineHeight: 27,
    fontWeight: '600',
  },
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: font.title3,
    fontWeight: '700',
  },
  input: {
    minHeight: 180,
    borderRadius: radius.md,
    borderCurve: 'continuous',
    padding: spacing.md + 2,
    fontSize: font.body,
    lineHeight: 22,
  },
  counter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  item: {
    paddingVertical: spacing.md + 2,
    borderBottomWidth: hairline,
    gap: spacing.sm,
  },
  itemTitle: {
    fontSize: font.body,
    fontWeight: '700',
  },
  itemDetail: {
    fontSize: font.subhead,
    lineHeight: 20,
  },
  choices: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  choice: {
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  choiceText: {
    fontSize: font.footnote,
    fontWeight: '600',
  },
  reference: {
    borderRadius: radius.md,
    borderCurve: 'continuous',
    padding: spacing.gutter,
    gap: spacing.sm,
  },
  subTitle: {
    fontSize: font.body,
    fontWeight: '700',
  },
  body: {
    fontSize: font.subhead,
    lineHeight: 21,
  },
  link: {
    fontSize: font.footnote,
    marginTop: spacing.xs,
  },
  listBlock: {
    gap: spacing.xs,
  },
  bullet: {
    fontSize: font.subhead,
    lineHeight: 21,
  },
  result: {
    gap: spacing.sm,
  },
  resultBox: {
    borderRadius: radius.md,
    borderCurve: 'continuous',
    padding: spacing.gutter,
    gap: spacing.xs,
  },
  resultTitle: {
    fontSize: font.body,
    fontWeight: '700',
  },
});
