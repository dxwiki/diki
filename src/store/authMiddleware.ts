import { Middleware } from '@reduxjs/toolkit';
import { checkAuth, setUser, setLoading, logout } from './authSlice';

export const authMiddleware: Middleware = (store) => (next) => (action) => {
  // checkAuth 액션이 디스패치되면 쿠키에서 사용자 정보를 확인
  if (checkAuth.match(action)) {
    // 서버 사이드 렌더링 환경에서는 실행하지 않음
    if (typeof window === 'undefined') {
      store.dispatch(setLoading(false));
      return next(action);
    }

    const userInfoCookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith('user-info='));

    if (userInfoCookie) {
      try {
        const userInfo = JSON.parse(decodeURIComponent(userInfoCookie.split('=')[1]));
        store.dispatch(setUser(userInfo));
      } catch (error) {
        console.log('Failed to parse user info:', error);
        store.dispatch(setLoading(false));
      }
    } else {
      store.dispatch(setLoading(false));
    }
  }

  // logout 액션이 디스패치되면 쿠키를 삭제
  if (logout.match(action)) {
    if (typeof window !== 'undefined') {
      document.cookie = 'user-info=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
      document.cookie = 'user-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    }
  }

  return next(action);
};