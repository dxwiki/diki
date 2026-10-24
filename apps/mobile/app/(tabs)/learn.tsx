import { useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { computePhaseStates, getUnlockedStages, isCourseComplete } from '@diki/core';
import PhaseList from '@/components/learn/PhaseList';
import ProgressBar from '@/components/learn/ProgressBar';
import StageSelector from '@/components/learn/StageSelector';
import Button from '@/components/ui/Button';
import Screen from '@/components/ui/Screen';
import Text from '@/components/ui/Text';
import { learnStepPath, useLearnCourse } from '@/lib/course';
import { useProgress } from '@/lib/progress';
import { useThemeColors } from '@/theme';

export default function LearnScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { stages } = useLearnCourse();
  const { ready, state } = useProgress();
  const [chosen, setChosen] = useState<string | null>(null);

  const unlocked = useMemo(() => getUnlockedStages(stages, state.learn), [stages, state.learn]);
  const completed = useMemo(() => stages.map((s) => isCourseComplete(s.phases, s.id, state.learn)), [stages, state.learn]);

  // 직접 고르지 않았으면 열려 있는 마지막 단계를 보여준다
  const stageIndex = Math.max(0, chosen ? stages.findIndex((s) => s.id === chosen) : unlocked.lastIndexOf(true));
  const stage = stages[stageIndex];
  const phases = useMemo(
    () => (stage ? computePhaseStates(stage.phases, stage.id, state.learn, unlocked[stageIndex]) : []),
    [stage, state.learn, unlocked, stageIndex],
  );

  if (!ready || !stage) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const steps = phases.flatMap((p) => p.steps.map((s) => ({ phaseId: p.id, step: s })));
  const doneCount = steps.filter(({ step }) => step.status === 'completed').length;
  const next = steps.find(({ step }) => step.status === 'available');
  const open = (phaseId: string, stepId: string) => router.push(learnStepPath(stage.id, phaseId, stepId) as Href);

  return (
    <Screen>
      <Text variant="caption">{'입문부터 마스터까지, 한 Step에 한 개념씩 쌓아가요.'}</Text>
      <StageSelector
        stages={stages}
        unlocked={unlocked}
        completed={completed}
        selectedId={stage.id}
        onSelect={setChosen}
      />

      <View style={[styles.summary, { backgroundColor: colors['background-secondary'] }]}>
        <Text style={styles.stageTitle}>{`${ stageIndex + 1 }단계 · ${ stage.label }`}</Text>
        <Text style={{ color: colors['text-secondary'] }}>{stage.description}</Text>
        <View style={styles.progressRow}>
          <View style={styles.progressBar}>
            <ProgressBar value={steps.length ? doneCount / steps.length : 0} />
          </View>
          <Text variant="caption">{`${ doneCount }/${ steps.length } Step`}</Text>
        </View>
        {!unlocked[stageIndex] ? (
          <Text
            variant="caption"
            style={styles.notice}
          >
            {`${ stages[stageIndex - 1]?.label } 단계를 모두 완료하면 열려요.`}
          </Text>
        ) : next ? (
          <Button
            label={doneCount === 0 ? '학습 시작하기' : `이어서 학습 · ${ next.step.title }`}
            onPress={() => open(next.phaseId, next.step.id)}
          />
        ) : (
          <Text
            variant="caption"
            style={styles.notice}
          >
            {'이 단계를 모두 완료했어요. 원하는 Step을 다시 풀어볼 수 있어요.'}
          </Text>
        )}
      </View>

      <PhaseList
        phases={phases}
        onOpenStep={open}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summary: {
    borderRadius: 16,
    padding: 18,
    gap: 10,
    marginBottom: 8,
  },
  stageTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 2,
  },
  progressBar: {
    flex: 1,
  },
  notice: {
    marginTop: 2,
  },
});
