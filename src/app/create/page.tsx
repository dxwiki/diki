'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TermData } from '@/types/database';
import Link from 'next/link';
import BasicInfoSection from '@/components/create/BasicInfoSection';
import DescriptionSection from '@/components/create/DescriptionSection';
import TagsSection from '@/components/create/TagsSection';
import TermsSection from '@/components/create/TermsSection';
import DifficultySection from '@/components/create/DifficultySection';
import RelevanceSection from '@/components/create/RelevanceSection';
import UsecaseSection from '@/components/create/UsecaseSection';
import ReferencesSection from '@/components/create/ReferencesSection';

export default function CreatePage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(false);
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
    publish: false,
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        if (parsedUserInfo.name) {
          setFormData((prev) => ({
            ...prev,
            metadata: {
              ...prev.metadata,
              authors: [parsedUserInfo.name],
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

  // 기본 입력 필드 변경 처리
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name.includes('.')) {
      const parts = name.split('.');
      if (parts.length === 2) {
        const [parent, child] = parts;
        setFormData((prev) => ({
          ...prev,
          [parent]: {
            ...((prev[parent as keyof TermData]) as object),
            [child]: value,
          },
        }));
      } else if (parts.length === 3) {
        const [parent, child, grandchild] = parts;
        setFormData((prev) => ({
          ...prev,
          [parent]: {
            ...((prev[parent as keyof TermData]) as object),
            [child]: {
              // @ts-expect-error 복잡한 중첩 객체 접근
              ...((prev[parent as keyof TermData])[child] as object),
              [grandchild]: isNaN(Number(value)) ? value : Number(value),
            },
          },
        }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // GitHub 이슈 생성 API 호출
      const response = await fetch('/api/create-issue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '문서 제출 중 오류가 발생했습니다.');
      }

      const result = await response.json();
      alert('문서가 성공적으로 GitHub 이슈로 등록되었습니다!');
      router.push(`/thank-you?issue=${ result.issue_number }`);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : '문서 제출 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  // 데이터 미리보기 Toggle
  const togglePreview = () => {
    setPreview(!preview);
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-[70vh]">{'로딩 중...'}</div>;
  }

  if (!isLoggedIn) {
    return null; // useEffect에서 리다이렉트 처리
  }

  return (
    <div className="container mx-auto">

      <div className="w-full flex justify-between items-center mb-4">
        <div className="flex items-center text-lg md:text-xl lg:text-2xl font-bold">{'새 포스트 작성'}</div>
        <button
          onClick={togglePreview}
          className="text-xs sm:text-sm px-2 py-1 sm:px-4 sm:py-2 text-gray2 hover:text-main hover:bg-gray4 rounded-md"
        >
          {preview ? '편집 모드' : 'JSON 미리보기'}
        </button>
      </div>

      {preview ? (
        <div className="bg-gray4 p-4 rounded-lg">
          <h2 className="text-end text-base sm:text-lg mb-4">{'JSON 미리보기'}</h2>
          <pre className="whitespace-pre-wrap overflow-auto max-h-[70vh]">
            {JSON.stringify(formData, null, 2)}
          </pre>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-2">
          <BasicInfoSection formData={formData} handleChange={handleChange} />
          <DifficultySection formData={formData} handleChange={handleChange} />
          <DescriptionSection formData={formData} handleChange={handleChange} />
          <TagsSection formData={formData} setFormData={setFormData} />
          <TermsSection formData={formData} setFormData={setFormData} />
          <RelevanceSection formData={formData} handleChange={handleChange} />
          <UsecaseSection formData={formData} setFormData={setFormData} handleChange={handleChange} />
          <ReferencesSection setFormData={setFormData} />

          {error && (
            <div className="p-4 mb-6 bg-red-100 text-red-600 dark:bg-red-400 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <Link
              href="/"
              className="px-4 py-2 bg-gray4 text-gray0 rounded-md hover:bg-gray3"
            >
              {'취소'}
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-main hover:bg-gray4 rounded-md border-gray4 disabled:opacity-50"
            >
              {submitting ? '제출 중...' : 'GitHub 이슈로 등록하기'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}