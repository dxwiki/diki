import { useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { computePhaseStates, type RoleId } from '@diki/core';
import RoleSelector from '@/components/interview/RoleSelector';
import PhaseList from '@/components/learn/PhaseList';
import ProgressBar from '@/components/learn/ProgressBar';
import Button from '@/components/ui/Button';
import Screen from '@/components/ui/Screen';
import Text from '@/components/ui/Text';
import { interviewStepPath, useInterviewCourse } from '@/lib/course';
import { useProgress } from '@/lib/progress';
import { font, spacing, useThemeColors } from '@/theme';

export default function InterviewScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { roles } = useInterviewCourse();
  const { ready, state } = useProgress();
  const [roleId, setRoleId] = useState<RoleId>('ds');
  const role = roles.find((r) => r.id === roleId) ?? roles[0];
  // 직무별 진도는 서로 독립이고, 직무 안에서는 학습과 같은 순서 규칙을 쓴다
  const phases = useMemo(() => (role ? computePhaseStates(role.phases, role.id, state.interview) : []), [role, state.interview]);

  if (!ready || !role) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const steps = phases.flatMap((p) => p.steps.map((s) => ({ phaseId: p.id, step: s })));
  const doneCount = steps.filter(({ step }) => step.status === 'completed').length;
  const next = steps.find(({ step }) => step.status === 'available');
  const open = (phaseId: string, stepId: string) => router.push(interviewStepPath(role.id, phaseId, stepId) as Href);

  return (
    <Screen
      bleed
      divided
    >
      <View style={styles.top}>
        <Text
          variant="caption"
          style={styles.gutter}
        >{'직무별 질문에 답하고, 평가 기준으로 내 답변을 점검해요.'}
        </Text>
        <RoleSelector
          roles={roles}
          selectedId={role.id}
          onSelect={setRoleId}
        />
        <View style={styles.summary}>
          <Text style={styles.roleTitle}>{`${ role.fullLabel } 면접`}</Text>
          <Text style={{ color: colors['text-secondary'] }}>{role.description}</Text>
          <View style={styles.progressRow}>
            <View style={styles.progressBar}>
              <ProgressBar value={steps.length ? doneCount / steps.length : 0} />
            </View>
            <Text variant="caption">{`${ doneCount }/${ steps.length } 질문`}</Text>
          </View>
          {next ? (
            <Button
              label={doneCount === 0 ? '첫 질문 시작하기' : `이어서 연습 · ${ next.step.title }`}
              onPress={() => open(next.phaseId, next.step.id)}
            />
          ) : (
            <Text variant="caption">{'모든 질문을 연습했어요. 원하는 질문을 다시 풀어볼 수 있어요.'}</Text>
          )}
        </View>
      </View>
      <PhaseList
        phases={phases}
        onOpenStep={open}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: {
    gap: spacing.lg,
    paddingVertical: spacing.lg,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gutter: {
    paddingHorizontal: spacing.gutter,
  },
  summary: {
    gap: spacing.md,
    paddingHorizontal: spacing.gutter,
  },
  roleTitle: {
    fontSize: font.title3,
    fontWeight: '700',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  progressBar: {
    flex: 1,
  },
});
