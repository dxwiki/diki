import { transformToSlug, type TermData } from '@diki/core';

export const DIFFICULTY_LABELS = ['기초', '초급', '중급', '고급', '전문'];

export const difficultyLabel = (level: number | undefined): string | null => {
  if (!level || level < 1 || level > DIFFICULTY_LABELS.length) return null;
  return DIFFICULTY_LABELS[level - 1];
};

export const termPath = (term: TermData): string => {
  if (term.url) return term.url;
  return `/posts/${ encodeURIComponent(transformToSlug(term.title?.en ?? '')) }`;
};

export const termKey = (term: TermData, index: number): string => (term.id !== undefined ? String(term.id) : `${ term.url ?? 'term' }-${ index }`);
