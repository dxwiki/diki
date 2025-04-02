'use client';

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

// 스토어의 하이드레이션 상태를 확인하는 컴포넌트
export default function HydrateStore() {
  const termsCount = useSelector((state: RootState) => state.terms.terms.length);
  const profilesCount = useSelector((state: RootState) => state.profiles.profiles.length);
  const termsLoading = useSelector((state: RootState) => state.terms.loading);
  const profilesLoading = useSelector((state: RootState) => state.profiles.loading);

  // 디버깅을 위한 로깅
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log(`Redux store state: ${ termsCount } terms, ${ profilesCount } profiles`);
      console.log(`Loading states: terms=${ termsLoading }, profiles=${ profilesLoading }`);

      if (termsCount === 0 || profilesCount === 0) {
        console.warn('데이터가 비어 있습니다. 초기화가 제대로 되었는지 확인하세요.');
      }
    }
  }, [termsCount, profilesCount, termsLoading, profilesLoading]);

  return null;
}