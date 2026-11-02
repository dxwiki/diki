import type { CourseMode, PhaseSummary } from './types';

export type StepStatus = 'completed' | 'available' | 'locked' | 'draft';

export interface ProgressRecord {
  completed: boolean;
  review: boolean;
}

export interface StepState {
  id: string;
  title: string;
  summary: string;
  status: StepStatus;
  review: boolean;
}

export interface PhaseState {
  id: string;
  title: string;
  locked: boolean;
  completed: boolean;
  steps: StepState[];
}

export const stepKey = (scope: string, phaseId: string, stepId: string) => `${ scope }/${ phaseId }/${ stepId }`;

// 앞 Phase를 모두 완료해야 다음 Phase가, 앞 Step을 완료해야 다음 Step이 열린다
export function computePhaseStates(
  phases: PhaseSummary[],
  scope: string,
  records: Record<string, ProgressRecord>,
  courseUnlocked = true
): PhaseState[] {
  let previousPhaseDone = courseUnlocked;

  return phases.map((phase) => {
    const locked = !previousPhaseDone;
    let previousStepDone = !locked;

    const steps = phase.steps.map((step) => {
      const record = records[stepKey(scope, phase.id, step.id)];
      const completed = !!record?.completed;
      const status: StepStatus = completed ? 'completed' : previousStepDone ? 'available' : 'locked';
      previousStepDone = completed;
      return { ...step, status, review: !!record?.review };
    });

    const completed = steps.length > 0 && steps.every((s) => s.status === 'completed');
    previousPhaseDone = completed;
    return { id: phase.id, title: phase.title, locked, completed, steps };
  });
}

export function isCourseComplete(phases: PhaseSummary[], scope: string, records: Record<string, ProgressRecord>) {
  return phases.every((phase) => phase.steps.every((step) => records[stepKey(scope, phase.id, step.id)]?.completed));
}

export interface StepRecord {
  completed: boolean;
  review: boolean;
  attempts: number;
  firstTryCorrect?: boolean;
  updatedAt: string;
}

export interface ProgressState {
  learn: Record<string, StepRecord>;
  interview: Record<string, StepRecord>;
  drafts: Record<string, string>;
}

export const EMPTY_PROGRESS: ProgressState = { learn: {}, interview: {}, drafts: {} };

// 저장된 문자열이 깨졌거나 비어 있으면 빈 진도로 시작한다
export function parseProgress(raw: string | null | undefined): ProgressState {
  if (!raw) return EMPTY_PROGRESS;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return EMPTY_PROGRESS;
    const pick = (value: unknown) => (value && typeof value === 'object' && !Array.isArray(value) ? value : {});
    return {
      learn: pick(parsed.learn) as ProgressState['learn'],
      interview: pick(parsed.interview) as ProgressState['interview'],
      drafts: pick(parsed.drafts) as ProgressState['drafts'],
    };
  } catch {
    return EMPTY_PROGRESS;
  }
}

// 한 번 완료한 Step은 다시 풀어도 완료 상태를 유지하고, 복습 표시는 마지막 시도를 따른다
export function applyAttempt(
  state: ProgressState,
  mode: CourseMode,
  key: string,
  result: { completed: boolean; review: boolean },
  now: string
): ProgressState {
  const prev = state[mode][key];
  const attempts = (prev?.attempts ?? 0) + 1;
  const next: StepRecord = {
    completed: !!prev?.completed || result.completed,
    review: result.review,
    attempts,
    firstTryCorrect: prev?.firstTryCorrect ?? (result.completed && !result.review && attempts === 1),
    updatedAt: now,
  };
  return { ...state, [mode]: { ...state[mode], [key]: next } };
}
