import { TermData } from '../../src/types';

// 원본: src/components/posts/sections/PrevNextSection.tsx 의 이전·다음 계산 (분리 전 동결 사본, getTermDataByID 는 terms 배열 조회로 대체)
export function legacyPrevNext(terms: TermData[], id: number, lastTermId: number) {
  const getTermDataByID = (targetId: number) => terms.find((term) => term.id === targetId);
  let prevTerm = getTermDataByID(id - 1);
  let nextTerm = getTermDataByID(id + 1);
  if(prevTerm?.id) {
    prevTerm = getTermDataByID(id - 1);
  } else {
    // last term
    prevTerm = getTermDataByID(lastTermId);
  }
  if(nextTerm?.id) {
    nextTerm = getTermDataByID(id + 1);
  } else {
    nextTerm = getTermDataByID(1);
  }

  return { prevTerm, nextTerm };
}

// 원본: src/app/posts/[slug]/page.tsx 의 lastTermId 계산
export function legacyLastTermId(termsData: TermData[]) {
  const lastTermId = termsData.length > 0 ? termsData[termsData.length - 1].id ?? 1 : 1;
  return lastTermId;
}
