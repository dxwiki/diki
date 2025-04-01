'use client';

import { useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setTerms } from '@/store/termsSlice';

export default function HydrateStore() {
  const dispatch = useDispatch();
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current && typeof window !== 'undefined') {
      // 윈도우 객체에서 전역 변수를 가져옴
      const preloadedState = window.__PRELOADED_STATE__;

      // 전역 변수를 렌더링 된 페이지에 전달
      dispatch(setTerms(preloadedState.terms));

      // 메모리 문제를 방지하기 위해 전역 변수를 빈 객체로 설정
      window.__PRELOADED_STATE__ = { terms: [] };

      initialized.current = true;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}