'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TermData } from '@/types/database';
import BasicInfoSection from '@/components/create/BasicInfoSection';
import DescriptionSection from '@/components/create/DescriptionSection';
import TagsSection from '@/components/create/TagsSection';
import TermsSection from '@/components/create/TermsSection';
import DifficultySection from '@/components/create/DifficultySection';
import RelevanceSection from '@/components/create/RelevanceSection';
import UsecaseSection from '@/components/create/UsecaseSection';
import ReferencesSection from '@/components/create/ReferencesSection';
import { ConfirmModal } from '@/components/ui/Modal';
import Footer from '@/components/common/Footer';

export default function CreatePage() {
  const router = useRouter();
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
    publish: false,
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

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

  // 폼 유효성 검사
  const validateForm = (): boolean => {
    const errors: string[] = [];

    // 기본 정보 검증
    if (!formData.title?.ko || formData.title.ko.trim() === '') {
      errors.push('한글 제목을 입력해주세요.');
    }

    if (!formData.title?.en || formData.title.en.trim() === '') {
      errors.push('영문 제목을 입력해주세요.');
    }

    if (!formData.description?.short || formData.description.short.trim() === '') {
      errors.push('짧은 설명을 입력해주세요.');
    }

    // 난이도 설명 검증
    if (!formData.difficulty?.description || formData.difficulty.description.trim() === '') {
      errors.push('난이도 설명을 입력해주세요.');
    }

    // 전체 설명 검증
    if (!formData.description?.full || formData.description.full.trim() === '') {
      errors.push('전체 설명을 입력해주세요.');
    }

    // 직무 연관도 설명 검증
    if (!formData.relevance?.analyst?.description || formData.relevance.analyst.description.trim() === '') {
      errors.push('데이터 분석가 직무 연관성 설명을 입력해주세요.');
    }

    if (!formData.relevance?.scientist?.description || formData.relevance.scientist.description.trim() === '') {
      errors.push('데이터 과학자 직무 연관성 설명을 입력해주세요.');
    }

    if (!formData.relevance?.engineer?.description || formData.relevance.engineer.description.trim() === '') {
      errors.push('데이터 엔지니어 직무 연관성 설명을 입력해주세요.');
    }

    // 사용 사례 검증
    if (!formData.usecase?.description || formData.usecase.description.trim() === '') {
      errors.push('사용 사례 개요를 입력해주세요.');
    }

    if (!formData.usecase?.example || formData.usecase.example.trim() === '') {
      errors.push('구체적인 사용 사례를 입력해주세요.');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setError('필수 항목을 모두 입력해주세요.');
      return;
    }

    // 모달 열기
    setIsConfirmModalOpen(true);
  };

  const submitToGithub = async () => {
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

  if (loading) {
    return <div className="flex justify-center items-center min-h-[70vh]">{'로딩 중...'}</div>;
  }

  if (!isLoggedIn) {
    return null; // useEffect에서 리다이렉트 처리
  }

  return (
    <div className="container mx-auto">
      <form onSubmit={handleSubmit} noValidate>
        <div className="h-[65vh] sm:h-[78vh] overflow-y-auto overflow-x-hidden border border-gray3 rounded-lg">
          <BasicInfoSection formData={formData} handleChange={handleChange} validationErrors={validationErrors} />
          <DifficultySection formData={formData} handleChange={handleChange} validationErrors={validationErrors} />
          <DescriptionSection formData={formData} handleChange={handleChange} validationErrors={validationErrors} />
          <TagsSection formData={formData} setFormData={setFormData} />
          <TermsSection formData={formData} setFormData={setFormData} />
          <RelevanceSection formData={formData} handleChange={handleChange} validationErrors={validationErrors} />
          <UsecaseSection formData={formData} setFormData={setFormData} handleChange={handleChange} validationErrors={validationErrors} />
          <ReferencesSection formData={formData} setFormData={setFormData} />
        </div>

        {error && validationErrors.length === 0 && (
          <div className="text-end text-level-5 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex justify-end space-x-4 py-4">
          <button
            type="button"
            onClick={() => setIsCancelModalOpen(true)}
            className="px-4 py-2 text-gray2 rounded-md hover:text-main"
          >
            {'작성취소'}
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 text-white bg-primary dark:bg-secondary hover:bg-accent dark:hover:bg-background-secondary rounded-md border-gray4 disabled:opacity-50"
          >
            {submitting ? '제출 중...' : 'GitHub 이슈 등록하기'}
          </button>
        </div>
      </form>

      {/* 확인 모달 */}
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={submitToGithub}
        title="GitHub 이슈 등록"
        message="작성한 내용을 GitHub 이슈로 등록하시겠습니까?"
        confirmText="등록하기"
        cancelText="취소"
      />

      {/* 취소 확인 모달 */}
      <ConfirmModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={() => router.push('/')}
        title="작성 취소"
        message="정말 작성을 취소하시겠습니까?"
        confirmText="확인"
        cancelText="취소"
      />

      <div className="sm:hidden">
        <Footer />
      </div>
    </div>
  );
}