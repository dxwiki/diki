import { Pressable, StyleSheet, View } from 'react-native';
import type { PhaseState, StepState } from '@diki/core';
import Text from '@/components/ui/Text';
import { useThemeColors } from '@/theme';
import Icon from './Icon';

interface PhaseListProps {
  phases: PhaseState[];
  onOpenStep: (phaseId: string, stepId: string)=> void;
}

const STATUS_LABEL: Record<StepState['status'], string> = {
  completed: '완료',
  available: '진행 가능',
  locked: '잠김',
  draft: '제작 중',
};

function StepBadge({ index, status }: { index: number; status: StepState['status'] }) {
  const colors = useThemeColors();
  if (status === 'completed') {
    return (
      <View style={[styles.badge, { backgroundColor: colors.primary }]}>
        <Icon name="check" color={colors.background} size={14} />
      </View>
    );
  }
  if (status === 'available') {
    return (
      <View style={[styles.badge, { backgroundColor: colors.secondary }]}>
        <Text style={[styles.badgeText, { color: colors.accent }]}>{String(index)}</Text>
      </View>
    );
  }
  return (
    <View style={[styles.badge, { backgroundColor: colors['extreme-light'] }]}>
      <Text style={[styles.badgeText, { color: colors.gray2 }]}>{String(index)}</Text>
    </View>
  );
}

export default function PhaseList({ phases, onOpenStep }: PhaseListProps) {
  const colors = useThemeColors();
  return (
    <View style={styles.list}>
      {phases.map((phase, phaseIndex) => {
        const done = phase.steps.filter((s) => s.status === 'completed').length;
        return (
          <View
            key={phase.id}
            style={styles.phase}
          >
            <View style={styles.phaseHeader}>
              <View style={styles.phaseTitleRow}>
                {phase.locked ? <Icon name="lock" color={colors.gray2} size={13} /> : null}
                <Text
                  accessibilityRole="header"
                  style={[styles.phaseTitle, { color: phase.locked ? colors.gray1 : colors.text }]}
                >
                  {`Phase ${ phaseIndex + 1 }. ${ phase.title }`}
                </Text>
              </View>
              <Text variant="caption">{`${ done }/${ phase.steps.length }`}</Text>
            </View>
            <View style={[styles.steps, { borderColor: colors['extreme-light'] }]}>
              {phase.steps.map((step, i) => {
                const open = step.status === 'available' || step.status === 'completed';
                return (
                  <Pressable
                    key={step.id}
                    accessibilityRole="button"
                    accessibilityState={{ disabled: !open }}
                    accessibilityLabel={`Step ${ i + 1 } ${ step.title }, ${ STATUS_LABEL[step.status] }${ step.review ? ', 복습 필요' : '' }`}
                    disabled={!open}
                    onPress={() => onOpenStep(phase.id, step.id)}
                    style={({ pressed }) => [
                      styles.step,
                      i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
                      pressed && { backgroundColor: colors['extreme-light'] },
                    ]}
                  >
                    <StepBadge
                      index={i + 1}
                      status={step.status}
                    />
                    <View style={styles.stepBody}>
                      <Text
                        numberOfLines={1}
                        style={[styles.stepTitle, { color: open ? colors.text : colors.gray2 }]}
                      >
                        {step.title}
                      </Text>
                      {step.summary ? (
                        <Text
                          variant="caption"
                          numberOfLines={2}
                          style={!open && { color: colors.gray3 }}
                        >
                          {step.summary}
                        </Text>
                      ) : null}
                    </View>
                    {step.review ? (
                      <View style={[styles.review, { backgroundColor: colors['primary-opacity'] }]}>
                        <Text style={[styles.reviewText, { color: colors.accent }]}>{'복습'}</Text>
                      </View>
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 28,
  },
  phase: {
    gap: 10,
  },
  phaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  phaseTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
  },
  phaseTitle: {
    fontSize: 17,
    fontWeight: '700',
    flexShrink: 1,
  },
  steps: {
    borderWidth: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  badge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 15,
    fontWeight: '700',
  },
  stepBody: {
    flex: 1,
    gap: 2,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  review: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  reviewText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
