import { TermData } from '../../src/types';
import { searchTerms } from './search';

// 원본: src/components/posts/sections/RecommendationSection.tsx 의 추천 계산 (분리 전 동결 사본, terms 는 fetchTermsData 결과를 인자로 받음)
export function legacyRecommend(term: TermData, terms: TermData[]) {
  let filteredTerms = searchTerms(term.title?.ko ?? '', terms)
    .filter((t) => t.id !== term.id)
    .slice(0, 6);

  // 추천 포스트가 6개 미만이면 최신 컨텐츠로 채우기
  if (filteredTerms.length < 6) {
    const recentTerms = terms
      .filter((t) =>
        t.id !== term.id
        && !filteredTerms.some((ft) => ft.id === t.id)
      )
      .sort((a, b) => (b.id ?? 0) - (a.id ?? 0))
      .slice(0, 6 - filteredTerms.length);

    filteredTerms = [...filteredTerms, ...recentTerms];
  }

  return filteredTerms;
}
