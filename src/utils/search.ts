import lunr from 'lunr';
import { TermData } from '@/types';

const koTokenizer = (token: lunr.Token) => {
  return token.update((word: string) => {
    return word
      .normalize('NFC') // 유니코드 정규화 (자모 분리 방지)
      .replace(/^[^\w가-힣]+/, '') // 앞쪽 특수 문자 제거
      .replace(/[^\w가-힣]+$/, ''); // 뒤쪽 특수 문자 제거
  });
};

lunr.Pipeline.registerFunction(koTokenizer, 'koTokenizer');

export function buildSearchIndex(terms: TermData[]) {
  return lunr(function (this: lunr.Builder) {
    this.pipeline.reset();
    this.searchPipeline.reset();
    this.pipeline.add(koTokenizer);
    this.searchPipeline.add(koTokenizer);

    // 필드 가중치 조정
    this.field('titleEn', { boost: 10 });
    this.field('titleKo', { boost: 10 });
    this.field('tags', { boost: 7 });
    this.field('descriptionShort', { boost: 3 });
    this.field('descriptionFull', { boost: 1 });
    this.field('term', { boost: 1 });
    this.field('termDescription', { boost: 1 });
    this.field('termTerm', { boost: 1 });
    this.field('usecaseExample', { boost: 1 });
    this.field('usecaseDescription', { boost: 1 });
    this.field('usecaseIndustries', { boost: 1 });
    this.field('tutorialTitles', { boost: 1 });
    this.field('bookTitles', { boost: 1 });
    this.field('academicTitles', { boost: 1 });
    this.field('opensourceTitles', { boost: 1 });

    this.ref('id'); // 검색 결과를 구분할 ID 지정

    terms.forEach((term, idx) => {
      this.add({
        id: idx.toString(),
        titleEn: term.title?.en || '',
        titleKo: term.title?.ko || '',
        descriptionShort: term.description?.short || '',
        descriptionFull: term.description?.full || '',
        descriptionDifficulty: term.difficulty?.description || '',
        tags: term.tags?.map((tag) => tag.name).join(' ') || '',
        termDescription: term.terms?.map((t) => t.description).join(' ') || '',
        termTerm: term.terms?.map((t) => t.term).join(' ') || '',
        usecaseExample: term.usecase?.example || '',
        usecaseDescription: term.usecase?.description || '',
        usecaseIndustries: term.usecase?.industries?.join(' ') || '',
        tutorialTitles: term.references?.tutorials?.map((t) => t.title).join(' ') || '',
        bookTitles: term.references?.books?.map((b) => b.title).join(' ') || '',
        academicTitles: term.references?.academic?.map((a) => a.title).join(' ') || '',
        opensourceTitles: term.references?.opensource?.map((o) => o.name).join(' ') || '',
      });
    });
  });
}

export function searchTerms(query: string, terms: TermData[]): TermData[] {
  if (!query.trim()) return [];

  const idx = buildSearchIndex(terms);
  const queryLower = query.toLowerCase();
  const words = queryLower.trim().split(/\s+/);

  // 검색 쿼리 생성 (부분 검색 *query* 제거)
  const searchQueries = [
    `"${ query }"`, // 정확한 구문 검색
    `${ query }*`, // 전방 일치 검색
    `*${ query }`, // 후방 일치 검색
    `${ query }~1`, // 편집 거리 1 허용 (오타 보정)
  ];

  if (words.length > 1) {
    words.forEach((word) => {
      if (word.length > 1) { // 한 글자 검색 제외
        searchQueries.push(
          word,
          `${ word }*`
        );
      }
    });
  }

  try {
    // 각 검색 쿼리 실행
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
    ).map(([, result]) => result);

    // lunr 검색 결과 중에서 정확한 검색어 포함 여부 확인
    const filteredResults = uniqueResults
      .map((result) => terms[parseInt(result.ref)])
      .filter((term) =>
        term.title?.en?.toLowerCase().includes(queryLower)
        || term.title?.ko?.includes(queryLower)
        || term.description?.short?.toLowerCase().includes(queryLower)
        || term.description?.full?.toLowerCase().includes(queryLower)
        || term.tags?.some((tag) => tag.name?.includes(queryLower))
        || term.terms?.some((t) => t.description?.includes(queryLower) || t.term?.includes(queryLower))
        || term.usecase?.example?.toLowerCase().includes(queryLower)
        || term.usecase?.description?.toLowerCase().includes(queryLower)
        || term.usecase?.industries?.some((industry) => industry.toLowerCase().includes(queryLower))
        || term.references?.tutorials?.some((t) => t.title?.toLowerCase().includes(queryLower))
        || term.references?.books?.some((b) => b.title?.toLowerCase().includes(queryLower))
        || term.references?.academic?.some((a) => a.title?.toLowerCase().includes(queryLower))
        || term.references?.opensource?.some((o) => o.name?.toLowerCase().includes(queryLower))
      );

    // lunr 검색으로 찾은 결과가 없을 경우 Fallback 수행
    if (filteredResults.length === 0) {
      return terms.filter((term) =>
        term.title?.en?.toLowerCase().includes(queryLower)
        || term.title?.ko?.includes(queryLower)
        || term.description?.short?.toLowerCase().includes(queryLower)
        || term.description?.full?.toLowerCase().includes(queryLower)
        || term.tags?.some((tag) => tag.name?.includes(queryLower))
        || term.terms?.some((t) => t.description?.includes(queryLower) || t.term?.includes(queryLower))
        || term.usecase?.example?.toLowerCase().includes(queryLower)
        || term.usecase?.description?.toLowerCase().includes(queryLower)
        || term.usecase?.industries?.some((industry) => industry.toLowerCase().includes(queryLower))
        || term.references?.tutorials?.some((t) => t.title?.toLowerCase().includes(queryLower))
        || term.references?.books?.some((b) => b.title?.toLowerCase().includes(queryLower))
        || term.references?.academic?.some((a) => a.title?.toLowerCase().includes(queryLower))
        || term.references?.opensource?.some((o) => o.name?.toLowerCase().includes(queryLower))
      );
    }

    // 검색 결과에 가중치 기반 점수 계산 추가
    const scoredResults = filteredResults.map((term) => {
      let score = 0;
      const titleEn = term.title?.en?.toLowerCase() || '';
      const titleKo = term.title?.ko || '';
      const descShort = term.description?.short?.toLowerCase() || '';
      const descFull = term.description?.full?.toLowerCase() || '';
      const tagNames = term.tags?.map((tag) => tag.name).join(' ').toLowerCase() || '';
      const termDescriptions = term.terms?.map((t) => t.description).join(' ').toLowerCase() || '';
      const termTerms = term.terms?.map((t) => t.term).join(' ').toLowerCase() || '';
      const usecaseExample = term.usecase?.example?.toLowerCase() || '';
      const usecaseDescription = term.usecase?.description?.toLowerCase() || '';
      const usecaseIndustries = term.usecase?.industries?.join(' ').toLowerCase() || '';
      const tutorialTitles = term.references?.tutorials?.map((t) => t.title).join(' ').toLowerCase() || '';
      const bookTitles = term.references?.books?.map((b) => b.title).join(' ').toLowerCase() || '';
      const academicTitles = term.references?.academic?.map((a) => a.title).join(' ').toLowerCase() || '';
      const opensourceTitles = term.references?.opensource?.map((o) => o.name).join(' ').toLowerCase() || '';

      score += (titleEn.split(queryLower).length - 1) * 10;
      score += (titleKo.split(queryLower).length - 1) * 10;
      score += (tagNames.split(queryLower).length - 1) * 7;
      score += (descShort.split(queryLower).length - 1) * 3;
      score += (descFull.split(queryLower).length - 1) * 1;
      score += (termDescriptions.split(queryLower).length - 1) * 1;
      score += (termTerms.split(queryLower).length - 1) * 1;
      score += (usecaseExample.split(queryLower).length - 1) * 1;
      score += (usecaseDescription.split(queryLower).length - 1) * 1;
      score += (usecaseIndustries.split(queryLower).length - 1) * 1;
      score += (tutorialTitles.split(queryLower).length - 1) * 1;
      score += (bookTitles.split(queryLower).length - 1) * 1;
      score += (academicTitles.split(queryLower).length - 1) * 1;
      score += (opensourceTitles.split(queryLower).length - 1) * 1;

      return { term, score };
    }).sort((a, b) => b.score - a.score) // 점수 기준 내림차순 정렬
      .map((item) => item.term);

    if (scoredResults.length === 0) {
      // Fallback 검색 결과도 동일한 방식으로 점수 계산
      return terms.filter((term) =>
        term.title?.en?.toLowerCase().includes(queryLower)
        || term.title?.ko?.includes(queryLower)
        || term.description?.short?.toLowerCase().includes(queryLower)
        || term.description?.full?.toLowerCase().includes(queryLower)
        || term.tags?.some((tag) => tag.name?.includes(queryLower))
        || term.terms?.some((t) => t.description?.includes(queryLower) || t.term?.includes(queryLower))
        || term.usecase?.example?.toLowerCase().includes(queryLower)
        || term.usecase?.description?.toLowerCase().includes(queryLower)
        || term.usecase?.industries?.some((industry) => industry.toLowerCase().includes(queryLower))
        || term.references?.tutorials?.some((t) => t.title?.toLowerCase().includes(queryLower))
        || term.references?.books?.some((b) => b.title?.toLowerCase().includes(queryLower))
        || term.references?.academic?.some((a) => a.title?.toLowerCase().includes(queryLower))
        || term.references?.opensource?.some((o) => o.name?.toLowerCase().includes(queryLower))
      ).map((term) => {
        let score = 0;
        const titleEn = term.title?.en?.toLowerCase() || '';
        const titleKo = term.title?.ko || '';
        const descShort = term.description?.short?.toLowerCase() || '';
        const descFull = term.description?.full?.toLowerCase() || '';
        const tagNames = term.tags?.map((tag) => tag.name).join(' ').toLowerCase() || '';
        const termDescriptions = term.terms?.map((t) => t.description).join(' ').toLowerCase() || '';
        const termTerms = term.terms?.map((t) => t.term).join(' ').toLowerCase() || '';
        const usecaseExample = term.usecase?.example?.toLowerCase() || '';
        const usecaseDescription = term.usecase?.description?.toLowerCase() || '';
        const usecaseIndustries = term.usecase?.industries?.join(' ').toLowerCase() || '';
        const tutorialTitles = term.references?.tutorials?.map((t) => t.title).join(' ').toLowerCase() || '';
        const bookTitles = term.references?.books?.map((b) => b.title).join(' ').toLowerCase() || '';
        const academicTitles = term.references?.academic?.map((a) => a.title).join(' ').toLowerCase() || '';
        const opensourceTitles = term.references?.opensource?.map((o) => o.name).join(' ').toLowerCase() || '';

        score += (titleEn.split(queryLower).length - 1) * 10;
        score += (titleKo.split(queryLower).length - 1) * 10;
        score += (tagNames.split(queryLower).length - 1) * 7;
        score += (descShort.split(queryLower).length - 1) * 3;
        score += (descFull.split(queryLower).length - 1) * 1;
        score += (termDescriptions.split(queryLower).length - 1) * 1;
        score += (termTerms.split(queryLower).length - 1) * 1;
        score += (usecaseExample.split(queryLower).length - 1) * 1;
        score += (usecaseDescription.split(queryLower).length - 1) * 1;
        score += (usecaseIndustries.split(queryLower).length - 1) * 1;
        score += (tutorialTitles.split(queryLower).length - 1) * 1;
        score += (bookTitles.split(queryLower).length - 1) * 1;
        score += (academicTitles.split(queryLower).length - 1) * 1;
        score += (opensourceTitles.split(queryLower).length - 1) * 1;

        return { term, score };
      }).sort((a, b) => b.score - a.score)
        .map((item) => item.term);
    }

    return scoredResults;
  } catch (error) {
    console.log('error', error);
    // lunr 검색 오류 시 Fallback 검색
    return terms.filter((term) =>
      term.title?.en?.toLowerCase().includes(queryLower)
      || term.title?.ko?.includes(queryLower)
      || term.description?.short?.toLowerCase().includes(queryLower)
      || term.description?.full?.toLowerCase().includes(queryLower)
      || term.tags?.some((tag) => tag.name?.includes(queryLower))
      || term.terms?.some((t) => t.description?.includes(queryLower) || t.term?.includes(queryLower))
      || term.usecase?.example?.toLowerCase().includes(queryLower)
      || term.usecase?.description?.toLowerCase().includes(queryLower)
      || term.usecase?.industries?.some((industry) => industry.toLowerCase().includes(queryLower))
      || term.references?.tutorials?.some((t) => t.title?.toLowerCase().includes(queryLower))
      || term.references?.books?.some((b) => b.title?.toLowerCase().includes(queryLower))
      || term.references?.academic?.some((a) => a.title?.toLowerCase().includes(queryLower))
      || term.references?.opensource?.some((o) => o.name?.toLowerCase().includes(queryLower))
    );
  }
}
