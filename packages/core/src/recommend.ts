import { TermData } from './types';
import { searchTerms } from './search';

export const RECOMMENDATION_LIMIT = 6;

export function getRecommendedTerms(term: TermData, terms: TermData[], limit = RECOMMENDATION_LIMIT): TermData[] {
  let recommended = searchTerms(term.title?.ko ?? '', terms)
    .filter((t) => t.id !== term.id)
    .slice(0, limit);

  // 모자라면 id 내림차순 최신 용어로 채운다
  if (recommended.length < limit) {
    const recentTerms = terms
      .filter((t) =>
        t.id !== term.id
        && !recommended.some((rt) => rt.id === t.id)
      )
      .sort((a, b) => (b.id ?? 0) - (a.id ?? 0))
      .slice(0, limit - recommended.length);

    recommended = [...recommended, ...recentTerms];
  }

  return recommended;
}
