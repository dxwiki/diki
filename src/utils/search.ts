import lunr from 'lunr';
import { TermData } from '@/types';

export function buildSearchIndex(terms: TermData[]) {
  return lunr(function (this: lunr.Builder) {
    // 한글 검색을 위한 파이프라인 제거
    this.pipeline.reset();
    this.searchPipeline.reset();

    this.field('titleEn', { boost: 10 });
    this.field('titleKo', { boost: 10 });
    this.field('description');
    this.field('tags');

    terms.forEach((term, idx) => {
      this.add({
        id: idx.toString(),
        titleEn: term.title?.en || '',
        titleKo: term.title?.ko || '',
        description: term.description?.full || '',
        tags: term.tags?.map((tag) => tag.name).join(' ') || '',
      });
    });
  });
}

export function searchTerms(query: string, terms: TermData[]): TermData[] {
  if (!query.trim()) return [];

  const idx = buildSearchIndex(terms);
  const searchQueries = [
    query, // 정확한 검색어
    `${ query }*`, // 전방 일치 검색
    `*${ query }`, // 후방 일치 검색
    `*${ query }*`, // 부분 검색
    `${ query }~2`, // 편집 거리 2 허용 (오타 보정)
  ];

  try {
    // 각 검색 쿼리로 검색 수행
    const allResults = searchQueries.flatMap((q) => {
      try {
        return idx.search(q);
      } catch {
        return [];
      }
    });

    // 중복 제거 및 스코어 기반 정렬
    const uniqueResults = Array.from(
      allResults.reduce((map, result) => {
        const existing = map.get(result.ref);
        if (!existing || existing.score < result.score) {
          map.set(result.ref, result);
        }
        return map;
      }, new Map())
    ).map(([_, result]) => result);

    // 스코어 기준 내림차순 정렬
    uniqueResults.sort((a, b) => b.score - a.score);

    const searchResults = uniqueResults.map((result) => terms[parseInt(result.ref)]);

    // 결과가 없는 경우 fallback 검색 수행
    if (searchResults.length === 0) {
      return terms.filter((term) =>
        term.title?.en?.toLowerCase().includes(query.toLowerCase())
        || term.title?.ko?.includes(query)
        || term.description?.full?.toLowerCase().includes(query.toLowerCase())
      );
    }

    return searchResults;
  } catch (error) {
    console.log('error', error);
    // lunr 구문 오류 시 fallback 검색
    return terms.filter((term) =>
      term.title?.en?.toLowerCase().includes(query.toLowerCase())
      || term.title?.ko?.includes(query)
      || term.description?.full?.toLowerCase().includes(query.toLowerCase())
    );
  }
}