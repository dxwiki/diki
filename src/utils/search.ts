import lunr from 'lunr';
import { TermData } from '@/types';

// 한글 스테밍 함수를 전역으로 이동
const koStemmer = (token: lunr.Token) => {
  return token.update((word: string) => {
    return word
      .replace(/^[^\w가-힣]+/, '')
      .replace(/[^\w가-힣]+$/, '');
  });
};

// 한 번만 실행되도록 밖으로 이동
lunr.Pipeline.registerFunction(koStemmer, 'koStemmer');

export function buildSearchIndex(terms: TermData[]) {
  return lunr(function (this: lunr.Builder) {
    this.pipeline.reset();
    this.searchPipeline.reset();
    this.pipeline.add(koStemmer);
    this.searchPipeline.add(koStemmer);

    this.field('titleEn', { boost: 10 });
    this.field('titleKo', { boost: 10 });
    this.field('descriptionShort', { boost: 5 });
    this.field('descriptionFull');
    this.field('descriptionDifficulty');
    this.field('tags');

    terms.forEach((term, idx) => {
      this.add({
        id: idx.toString(),
        titleEn: term.title?.en || '',
        titleKo: term.title?.ko || '',
        descriptionShort: term.description?.short || '',
        descriptionFull: term.description?.full || '',
        descriptionDifficulty: term.difficulty?.description || '',
        tags: term.tags?.map((tag) => tag.name).join(' ') || '',
      });
    });
  });
}

export function searchTerms(query: string, terms: TermData[]): TermData[] {
  if (!query.trim()) return [];

  const idx = buildSearchIndex(terms);
  const words = query.trim().split(/\s+/);

  // 기본 검색 쿼리 생성
  const searchQueries = [
    `"${ query }"`, // 정확한 구문 검색
    query, // 정확한 검색어
    `${ query }*`, // 전방 일치 검색
    `*${ query }`, // 후방 일치 검색
    `*${ query }*`, // 부분 검색
    `${ query }~2`, // 편집 거리 2 허용 (오타 보정)
  ];

  // 각 단어에 대한 개별 검색 쿼리 추가
  if (words.length > 1) {
    words.forEach((word) => {
      if (word.length > 1) { // 한 글자 검색 제외
        searchQueries.push(
          word,
          `${ word }*`,
          `*${ word }*`
        );
      }
    });
  }

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

    ).map(([,result]) => result);

    uniqueResults.sort((a, b) => {
      const termA = terms[parseInt(a.ref)];
      const termB = terms[parseInt(b.ref)];

      // 검색어가 제목에 포함되어 있는지 확인
      const queryLower = query.toLowerCase();
      const aHasQueryInTitle
        = termA.title?.ko?.includes(query)
        || termA.title?.en?.toLowerCase().includes(queryLower);
      const bHasQueryInTitle
        = termB.title?.ko?.includes(query)
        || termB.title?.en?.toLowerCase().includes(queryLower);

      // 제목 포함 여부를 우선적으로 비교
      if (aHasQueryInTitle && !bHasQueryInTitle) return -1;
      if (!aHasQueryInTitle && bHasQueryInTitle) return 1;

      // 제목 포함 여부가 같다면 스코어로 비교 (높은 스코어가 먼저 오도록 변경)
      return b.score - a.score;
    });

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