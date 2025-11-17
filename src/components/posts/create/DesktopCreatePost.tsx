'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TermData } from '@/types/database';
import { useToast } from '@/layouts/ToastProvider';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function DesktopCreatePost() {
  const router = useRouter();
  const { showToast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState<TermData>({
    title: { ko: '', en: '', etc: [] },
    description: { short: '', full: '' },
    tags: [],
    terms: [],
    difficulty: { level: 1, description: '' },
    relevance: {
      analyst: { score: 1, description: '' },
      engineer: { score: 1, description: '' },
      scientist: { score: 1, description: '' },
    },
    usecase: {
      description: '',
      example: '',
      industries: [],
    },
    metadata: {
      contributors: [],
      authors: [],
      created_at: new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString().split('T')[0],
    },
    references: {
      tutorials: [],
      books: [],
      academic: [],
      opensource: [],
    },
    publish: true,
  });

  // 로그인 확인 로직
  useEffect(() => {
    try {
      const userInfoCookie = document.cookie
        .split('; ')
        .find((row) => row.startsWith('user-info='));

      if (userInfoCookie) {
        const userInfoValue = userInfoCookie.split('=')[1];
        const parsedUserInfo = JSON.parse(decodeURIComponent(userInfoValue));
        setIsLoggedIn(true);

        // 현재 사용자를 authors에 추가
        if (parsedUserInfo.username) {
          setFormData((prev) => ({
            ...prev,
            metadata: {
              ...prev.metadata,
              authors: [parsedUserInfo.username],
            },
          }));
        }
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
    return <LoadingSpinner />;
  }

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="fixed inset-0 top-16 overflow-auto bg-background">
      <div className="size-full">
        <div className="flex flex-col gap-2 m-8">
          <h1 className="text-3xl font-bold">{'새 포스트 작성'}</h1>
          <p className="text-gray1">{'포스트 작성 페이지'}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-8">
          {/* 왼쪽: 편집 영역 */}
          <div className="bg-background-secondary rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">{'편집 영역'}</h2>
            <p className="text-sub">{'PC용 레이아웃이 여기에 들어갑니다.'}</p>
          </div>

          {/* 오른쪽: 미리보기 영역 */}
          <div className="bg-background-secondary rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">{'미리보기'}</h2>
            <p className="text-sub">{'실시간 미리보기가 여기에 표시됩니다.'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
