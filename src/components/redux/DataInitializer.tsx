'use client';

import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setTerms } from '@/store/termsSlice';
import { setProfiles } from '@/store/profilesSlice';
import { checkAuth } from '@/store/authSlice';
import { getServerTermsData, getServerProfilesData } from '@/app/actions';

export default function DataInitializer() {
  const dispatch = useDispatch();
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // const termsCount = useSelector((state: RootState) => state.terms.terms.length);
  // const profilesCount = useSelector((state: RootState) => state.profiles.profiles.length);

  useEffect(() => {
    const initializeData = async () => {
      if (isInitialized) return;

      try {
        // 서버 액션을 사용하여 데이터 가져오기
        const [terms, profiles] = await Promise.all([
          getServerTermsData(),
          getServerProfilesData(),
        ]);

        if (terms.length > 0) {
          dispatch(setTerms(terms));
        }

        if (profiles.length > 0) {
          dispatch(setProfiles(profiles));
        }

        // 인증 상태 초기화
        dispatch(checkAuth());

        setIsInitialized(true);
        // console.log(`데이터 초기화 완료: ${ terms.length }개 용어, ${ profiles.length }개 프로필`);
      } catch (err) {
        console.error('데이터 초기화 실패:', err);
        setError('데이터를 로드하는 중 오류가 발생했습니다.');
      }
    };

    initializeData();
  }, [dispatch, isInitialized]);

  // 디버깅을 위한 로깅
  // useEffect(() => {
  //   if (isInitialized) {
  //     console.log(`현재 Redux 스토어 상태: ${ termsCount }개 용어, ${ profilesCount }개 프로필`);
  //   }
  // }, [isInitialized, termsCount, profilesCount]);

  if (error) {
    return <div>{'Error: '}{error}</div>;
  }

  return null;
}