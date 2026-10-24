import { TermData } from './types';

export const RECENT_TERMS_LIMIT = 20;

const isTermId = (value: unknown): value is number => typeof value === 'number' && Number.isInteger(value);

export function addRecentTermId(list: number[], id: number, limit: number = RECENT_TERMS_LIMIT): number[] {
  return [id, ...list.filter((item) => item !== id)].slice(0, limit);
}

export function resolveRecentTerms(ids: number[], terms: TermData[]): TermData[] {
  const byId = new Map<number, TermData>();
  terms.forEach((term) => {
    if (isTermId(term.id)) byId.set(term.id, term);
  });
  return ids.flatMap((id) => {
    const term = byId.get(id);
    return term ? [term] : [];
  });
}

export function parseRecentIds(raw: string | null | undefined): number[] {
  if (!raw) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];
  return Array.from(new Set(parsed.filter(isTermId))).slice(0, RECENT_TERMS_LIMIT);
}
