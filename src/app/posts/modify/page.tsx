'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PostList from '@/components/posts/PostList';
import Footer from '@/components/common/Footer';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { SearchDetailInput } from '@/components/search/SearchDetailInput';

export default function PostsModifyPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // 로그인 확인 로직
  useEffect(() => {
    try {
      const userInfoCookie = document.cookie
        .split('; ')
        .find((row) => row.startsWith('user-info='));

      if (userInfoCookie) {
        const userInfoValue = userInfoCookie.split('=')[1];
        JSON.parse(decodeURIComponent(userInfoValue));
        setIsLoggedIn(true);
      }
    } catch (err) {
      console.error('쿠키 파싱 오류:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 권한 없는 사용자는 리다이렉트
  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.push('/login?error=login_required');
    }
  }, [loading, isLoggedIn, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isLoggedIn) {
    return null; // useEffect에서 리다이렉트 처리
  }

  return (
    <div className="relative">
      <div className='mb-5 text-center'>
        <h1 className='text-2xl font-bold text-primary'>{'포스트 수정하기'}</h1>
        <p className='text-sub mt-2'>{'수정할 포스트를 선택하세요'}</p>
      </div>
      <div className='animate-intro relative z-20'>
        <SearchDetailInput />
      </div>
      <div className='animate-introSecond mt-5 z-10'>
        <PostList itemsPerPage={12} isModifyMode={true} />
      </div>
      <div className='block sm:hidden'>
        <Footer />
      </div>
    </div>
  );
}