import { useMemo } from 'react';
import { buildCourseTermMap, getRoleSummaries, getStageSummaries } from '@diki/core';
import { useContent } from '@/lib/content';

// 콘텐츠가 갱신되면 코스 요약도 다시 만든다
export function useLearnCourse() {
  const { terms } = useContent();
  return useMemo(() => {
    const termMap = buildCourseTermMap(terms);
    return { termMap, stages: getStageSummaries(termMap) };
  }, [terms]);
}

export function useInterviewCourse() {
  const { terms } = useContent();
  return useMemo(() => {
    const termMap = buildCourseTermMap(terms);
    return { termMap, roles: getRoleSummaries(termMap) };
  }, [terms]);
}

export const learnStepPath = (stageId: string, phaseId: string, stepId: string) => `/learn/${ stageId }/${ phaseId }/${ stepId }`;
export const interviewStepPath = (roleId: string, phaseId: string, stepId: string) => `/interview/${ roleId }/${ phaseId }/${ stepId }`;
