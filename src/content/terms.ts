import fs from 'fs';
import path from 'path';
import { TermData } from '@/types';
import {
  buildCourseTermMap,
  courseSlug,
  getNeighborSteps as coreNeighborSteps,
  getRoleSummaries as coreRoleSummaries,
  getStageSummaries as coreStageSummaries,
} from '@diki/core';
import { PhaseSummary, RoleSummary, StageSummary } from './types';

let cache: Map<string, TermData> | null = null;

export const termSlug = courseSlug;

// Redux 등 부수 효과 없이 terms.json만 읽는다
export function getTermMap(): Map<string, TermData> {
  if (cache) return cache;
  try {
    const filePath = path.join(process.cwd(), 'src', 'data', 'terms.json');
    cache = buildCourseTermMap(JSON.parse(fs.readFileSync(filePath, 'utf8')) as TermData[]);
  } catch (error) {
    console.error('terms.json 읽기 오류:', error);
    cache = new Map();
  }
  return cache;
}

export function getTerm(slug: string): TermData | undefined {
  return getTermMap().get(slug);
}

export function getStageSummaries(): StageSummary[] {
  return coreStageSummaries(getTermMap());
}

export function getRoleSummaries(): RoleSummary[] {
  return coreRoleSummaries(getTermMap());
}

export function getNeighborSteps(phases: PhaseSummary[], phaseId: string, stepId: string, basePath: string) {
  return coreNeighborSteps(phases, phaseId, stepId, basePath);
}
