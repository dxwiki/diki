import { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { buildInterview, computePhaseStates, getNeighborSteps, stepKey, type RoleId } from '@diki/core';
import InterviewRunner from '@/components/interview/InterviewRunner';
import Button from '@/components/ui/Button';
import Screen from '@/components/ui/Screen';
import Text from '@/components/ui/Text';
import { useInterviewCourse } from '@/lib/course';
import { useProgress } from '@/lib/progress';
import { useThemeColors } from '@/theme';

const first = (value?: string | string[]) => (Array.isArray(value) ? value[0] : value) ?? '';
const RELEVANCE_KEY: Record<RoleId, 'scientist' | 'engineer' | 'analyst'> = { ds: 'scientist', de: 'engineer', da: 'analyst' };

export default function InterviewStepScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const params = useLocalSearchParams<{ role?: string; phase?: string; step?: string }>();
  const roleId = first(params.role);
  const phaseId = first(params.phase);
  const stepId = first(params.step);
  const { roles, termMap } = useInterviewCourse();
  const { ready, state } = useProgress();

  const role = roles.find((r) => r.id === roleId);
  const phaseIndex = role?.phases.findIndex((p) => p.id === phaseId) ?? -1;
  const phase = role?.phases[phaseIndex];
  const stepIndex = phase?.steps.findIndex((s) => s.id === stepId) ?? -1;
  const term = stepIndex >= 0 ? termMap.get(stepId) : undefined;
  const content = useMemo(() => (term && role ? buildInterview(term, role.id) : null), [term, role]);

  const status = useMemo(() => {
    if (!role) return undefined;
    return computePhaseStates(role.phases, role.id, state.interview)[phaseIndex]?.steps[stepIndex]?.status;
  }, [role, state.interview, phaseIndex, stepIndex]);

  const next = useMemo(() => (role ? getNeighborSteps(role.phases, phaseId, stepId, `/interview/${ role.id }`).next : null), [role, phaseId, stepId]);
  const toMap = () => (router.canGoBack() ? router.back() : router.replace('/interview'));

  if (!role || !phase || !term || !content) {
    return (
      <>
        <Stack.Screen options={{ title: '면접 준비' }} />
        <Screen>
          <Text variant="title">{'질문을 찾을 수 없어요'}</Text>
          <Text>{'코스가 바뀌었거나 주소가 잘못됐어요.'}</Text>
          <Button
            label="코스 지도로"
            onPress={() => router.replace('/interview')}
          />
        </Screen>
      </>
    );
  }

  const title = term.title?.ko ?? stepId;

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
          <Text variant="title">{'아직 열리지 않은 질문이에요'}</Text>
          <Text style={{ color: colors['text-secondary'] }}>{'앞 질문을 순서대로 완료하면 열려요.'}</Text>
          <Button
            label="코스 지도로"
            onPress={toMap}
          />
        </Screen>
      </>
    );
  }

  const key = stepKey(role.id, phase.id, stepId);
  return (
    <>
      <Stack.Screen options={{ title }} />
      <InterviewRunner
        key={key}
        progressKey={key}
        eyebrow={`${ role.label } · ${ phase.title } · 질문 ${ stepIndex + 1 }/${ phase.steps.length }`}
        title={title}
        roleLabel={role.fullLabel}
        content={content}
        reference={{
          short: term.description?.short ?? '',
          relevance: term.relevance?.[RELEVANCE_KEY[role.id]]?.description ?? '',
          example: term.usecase?.example ?? '',
        }}
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
