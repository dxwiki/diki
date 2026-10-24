import { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter, type Href } from 'expo-router';
import {
  buildLesson,
  computePhaseStates,
  getEarlierTerms,
  getNeighborSteps,
  getUnlockedStages,
  stepKey,
} from '@diki/core';
import LessonRunner from '@/components/learn/LessonRunner';
import Button from '@/components/ui/Button';
import Screen from '@/components/ui/Screen';
import Text from '@/components/ui/Text';
import { learnStepPath, useLearnCourse } from '@/lib/course';
import { useProgress } from '@/lib/progress';
import { useThemeColors } from '@/theme';

const first = (value?: string | string[]) => (Array.isArray(value) ? value[0] : value) ?? '';

export default function LearnStepScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const params = useLocalSearchParams<{ stage?: string; phase?: string; step?: string }>();
  const stageId = first(params.stage);
  const phaseId = first(params.phase);
  const stepId = first(params.step);
  const { stages, termMap } = useLearnCourse();
  const { ready, state } = useProgress();

  const stageIndex = stages.findIndex((s) => s.id === stageId);
  const stage = stages[stageIndex];
  const phaseIndex = stage?.phases.findIndex((p) => p.id === phaseId) ?? -1;
  const phase = stage?.phases[phaseIndex];
  const stepIndex = phase?.steps.findIndex((s) => s.id === stepId) ?? -1;
  const term = stepIndex >= 0 ? termMap.get(stepId) : undefined;

  const lesson = useMemo(
    () => (term ? buildLesson(term, getEarlierTerms(stages, stepId, termMap)) : []),
    [term, stages, stepId, termMap],
  );

  const status = useMemo(() => {
    if (!stage) return undefined;
    const unlocked = getUnlockedStages(stages, state.learn);
    const phases = computePhaseStates(stage.phases, stage.id, state.learn, unlocked[stageIndex]);
    return phases[phaseIndex]?.steps[stepIndex]?.status;
  }, [stage, stages, state.learn, stageIndex, phaseIndex, stepIndex]);

  // 단계의 마지막 Step이면 다음 단계 첫 Step으로 이어준다
  const next = useMemo(() => {
    if (!stage) return null;
    const inStage = getNeighborSteps(stage.phases, phaseId, stepId, `/learn/${ stage.id }`).next;
    if (inStage) return inStage;
    const nextStage = stages[stageIndex + 1];
    const firstPhase = nextStage?.phases.find((p) => p.steps.length > 0);
    return nextStage && firstPhase
      ? { href: learnStepPath(nextStage.id, firstPhase.id, firstPhase.steps[0].id), title: firstPhase.steps[0].title }
      : null;
  }, [stage, stages, stageIndex, phaseId, stepId]);

  if (!stage || !phase || !term) {
    return (
      <>
        <Stack.Screen options={{ title: '학습' }} />
        <Screen>
          <Text variant="title">{'Step을 찾을 수 없어요'}</Text>
          <Text>{'코스가 바뀌었거나 주소가 잘못됐어요.'}</Text>
          <Button
            label="코스 지도로"
            onPress={() => router.replace('/(tabs)/learn')}
          />
        </Screen>
      </>
    );
  }

  const title = term.title?.ko ?? stepId;
  const toMap = () => (router.canGoBack() ? router.back() : router.replace('/(tabs)/learn'));

  if (!ready) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title }} />
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (status !== 'available' && status !== 'completed') {
    return (
      <>
        <Stack.Screen options={{ title }} />
        <Screen>
          <Text variant="title">{'아직 열리지 않은 Step이에요'}</Text>
          <Text style={{ color: colors['text-secondary'] }}>{'앞 Step을 순서대로 완료하면 열려요.'}</Text>
          <Button
            label="코스 지도로"
            onPress={toMap}
          />
        </Screen>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title }} />
      <LessonRunner
        key={stepKey(stage.id, phase.id, stepId)}
        progressKey={stepKey(stage.id, phase.id, stepId)}
        eyebrow={`${ stage.label } · ${ phase.title } · Step ${ stepIndex + 1 }/${ phase.steps.length }`}
        title={title}
        subtitle={term.title?.en ?? ''}
        lesson={lesson}
        next={next ? { title: next.title, onPress: () => router.replace(next.href as Href) } : null}
        onMap={toMap}
        onOpenTerm={() => router.push(`/posts/${ stepId }` as Href)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
