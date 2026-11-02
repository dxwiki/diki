import type { TermData } from '../types';
import { interviewRoles } from './interview';
import { learnStages } from './learn';
import { isCourseComplete, type ProgressRecord } from './progress';
import type { PhaseDefinition, PhaseSummary, RoleSummary, StageSummary, StepLink } from './types';

export function courseSlug(term: TermData): string {
  return term.url?.split('/').pop() ?? '';
}

export function buildCourseTermMap(terms: TermData[]): Map<string, TermData> {
  return new Map(terms.filter((t) => t.publish !== false).map((t) => [courseSlug(t), t]));
}

export function summarizePhases(phases: PhaseDefinition[], terms: Map<string, TermData>): PhaseSummary[] {
  return phases.map((phase) => ({
    id: phase.id,
    title: phase.title,
    steps: phase.steps
      .filter((slug) => terms.has(slug))
      .map((slug) => {
        const term = terms.get(slug)!;
        return { id: slug, title: term.title?.ko ?? slug, summary: term.description?.short ?? '' };
      }),
  }));
}

export function getStageSummaries(terms: Map<string, TermData>): StageSummary[] {
  return learnStages.map((stage) => ({
    id: stage.id,
    label: stage.label,
    description: stage.description,
    phases: summarizePhases(stage.phases, terms),
  }));
}

export function getRoleSummaries(terms: Map<string, TermData>): RoleSummary[] {
  return interviewRoles.map((role) => ({
    id: role.id,
    label: role.label,
    fullLabel: role.fullLabel,
    description: role.description,
    phases: summarizePhases(role.phases, terms),
  }));
}

export function getNeighborSteps(phases: PhaseSummary[], phaseId: string, stepId: string, basePath: string) {
  const flat = phases.flatMap((phase) => phase.steps.map((step) => ({ phaseId: phase.id, step })));
  const index = flat.findIndex((item) => item.phaseId === phaseId && item.step.id === stepId);
  const toLink = (item?: (typeof flat)[number]): StepLink | null =>
    item ? { href: `${ basePath }/${ item.phaseId }/${ item.step.id }`, title: item.step.title } : null;
  return { prev: toLink(flat[index - 1]), next: toLink(flat[index + 1]) };
}

// 학습 코스 전체 순서에서 지금 Step보다 앞에 나온 용어들 (복습 문제 재료)
export function getEarlierTerms(stages: StageSummary[], stepId: string, terms: Map<string, TermData>): TermData[] {
  const order = stages.flatMap((s) => s.phases.flatMap((p) => p.steps.map((step) => step.id)));
  const index = order.indexOf(stepId);
  return order.slice(0, Math.max(0, index)).map((slug) => terms.get(slug)).filter((t): t is TermData => !!t);
}

// 앞 단계를 모두 완료해야 다음 단계가 열린다
export function getUnlockedStages(stages: StageSummary[], records: Record<string, ProgressRecord>): boolean[] {
  return stages.map((_, i) => i === 0 || isCourseComplete(stages[i - 1].phases, stages[i - 1].id, records));
}
