import { TermData, Profile } from '@/types';

// 전역 변수를 저장할 네임스페이스 생성
declare global {
  interface Window {
    __PRELOADED_STATE__: {
      terms: TermData[];
      profiles: Profile[];
    };
  }
}

// 레이아웃에서 상태를 초기화하는 데 사용될 함수
export function createPreloadedStateScript(terms: TermData[], profiles: Profile[]) {
  // 최소한의 상태 객체만 생성
  const preloadedState = {
    terms,
    profiles,
  };

  // JSON으로 직렬화하고 스크립트 위험 문자를 이스케이프 처리
  const serializedState = JSON.stringify(preloadedState).replace(
    /</g,
    '\\u003c'
  );

  // 전역 윈도우 객체를 초기화하는 스크립트 콘텐츠 반환
  return `window.__PRELOADED_STATE__ = ${ serializedState };`;
}