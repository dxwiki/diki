'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { TermData } from '@/types/database';
import { useToast } from '@/layouts/ToastProvider';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import DesktopEditForm from './DesktopEditForm';
import EditPreview from '@/components/edit/EditPreview';
import { ConfirmModal } from '@/components/ui/Modal';
import { Save, Upload } from 'lucide-react';

export default function DesktopCreatePost() {
  const router = useRouter();
  const { showToast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);
  const [isMobilePreview, setIsMobilePreview] = useState(false);

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

  // 로컬 스토리지에 폼 데이터 저장
  const saveFormData = useCallback(() => {
    try {
      localStorage.setItem('diki-create-form-data', JSON.stringify(formData));
      showToast('작성 중인 내용이 브라우저에 저장되었습니다.', 'info');
    } catch (error) {
      console.error('로컬 스토리지 저장 오류:', error);
      showToast('저장 중 오류가 발생했습니다.');
    }
  }, [formData, showToast]);

  // 로컬 스토리지에서 폼 데이터 불러오기
  const loadFormData = useCallback(() => {
    try {
      const savedData = localStorage.getItem('diki-create-form-data');
      if (savedData) {
        const parsedData = JSON.parse(savedData) as TermData;
        setFormData(parsedData);
        setIsLoadModalOpen(false);
        showToast('마지막으로 작성한 내용을 불러왔습니다.', 'success');
      } else {
        showToast('저장된 내용이 없습니다.');
      }
    } catch (error) {
      console.error('로컬 스토리지 불러오기 오류:', error);
      showToast('불러오기 중 오류가 발생했습니다.');
    }
  }, [showToast]);

  // 자동 저장 기능 구현
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (isLoggedIn) {
        try {
          localStorage.setItem('diki-create-form-data', JSON.stringify(formData));
          showToast('작성 중인 내용이 자동으로 브라우저에 저장되었습니다.', 'info');
        } catch (error) {
          console.error('로컬 스토리지 저장 오류:', error);
          showToast('저장 중 오류가 발생했습니다.');
        }
      }
    }, 180000); // 3분마다 자동 저장

    return () => clearInterval(autoSaveInterval);
  }, [formData, isLoggedIn, showToast]);

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

    // 폼 유효성 검사
    const invalidSections: string[] = [];

    if (!formData.title?.ko || formData.title.ko.trim() === '') invalidSections.push('제목 (한글)');
    if (!formData.title?.en || formData.title.en.trim() === '') invalidSections.push('제목 (영문)');
    if (!formData.description?.short || formData.description.short.trim() === '') invalidSections.push('요약');
    if (!formData.difficulty?.description || formData.difficulty.description.trim() === '') invalidSections.push('난이도');
    if (!formData.description?.full || formData.description.full.trim() === '') invalidSections.push('개념');
    if (!Array.isArray(formData.terms) || formData.terms.length === 0) invalidSections.push('관련 용어');
    if (!Array.isArray(formData.tags) || formData.tags.length === 0) invalidSections.push('관련 포스트');
    if (!formData.relevance?.analyst?.description
        || !formData.relevance.scientist?.description
        || !formData.relevance.engineer?.description) {
      invalidSections.push('직무 연관도');
    }
    if (!formData.usecase?.description || !formData.usecase?.example) {
      invalidSections.push('사용 사례');
    }
    const hasReferences
      = (Array.isArray(formData.references?.tutorials) && formData.references.tutorials.length > 0)
      || (Array.isArray(formData.references?.books) && formData.references.books.length > 0)
      || (Array.isArray(formData.references?.academic) && formData.references.academic.length > 0)
      || (Array.isArray(formData.references?.opensource) && formData.references.opensource.length > 0);
    if (!hasReferences) invalidSections.push('참고 자료');

    if (invalidSections.length > 0) {
      const errorMessage = `필수 항목을 모두 입력해주세요: ${ invalidSections.join(', ') }`;
      showToast(errorMessage, 'error', 10000); // 10초 동안 표시
      return;
    }

    // 등록하기 모달 열기
    setIsConfirmModalOpen(true);
  };

  const submitToGithub = async () => {
    setSubmitting(true);

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
      showToast('문서가 성공적으로 GitHub 이슈로 등록되었습니다!', 'success');

      // 제출 성공 시 로컬 스토리지에서 데이터 삭제
      localStorage.removeItem('diki-create-form-data');
      router.push(`/thank-you?issue=${ result.issue_number }`);
    } catch (error: unknown) {
      showToast(error instanceof Error ? error.message : '문서 제출 중 오류가 발생했습니다.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

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
    <div className="fixed inset-0 top-16 bg-background">
      <div className="relative size-full overflow-y-auto">
        {/* 헤더 영역 */}
        <div className="flex justify-between items-center gap-2 px-8 py-5 sticky top-0 bg-background z-10">
          <h1 className="text-3xl font-bold">{'새 포스트 작성'}</h1>

          <button
            type="submit"
            form="createForm"
            disabled={submitting}
            className="px-4 py-2 text-white bg-primary dark:bg-secondary hover:bg-accent dark:hover:bg-background-secondary rounded-md disabled:opacity-50"
          >
            {submitting ? '제출 중...' : '등록하기'}
          </button>
        </div>

        <form id="createForm" onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-2 gap-8 px-8 py-0">
            {/* 왼쪽: 편집 영역 */}
            <DesktopEditForm
              formData={formData}
              setFormData={setFormData}
              handleChange={handleChange}
            />

            {/* 오른쪽: 실시간 미리보기 영역 */}
            <div className="sticky top-[80px] h-fit flex flex-col gap-2">
              <div className="flex flex-col border border-gray4 rounded-lg">
                <div className="flex justify-between items-center border-b border-gray4 py-2.5 px-4">
                  <span className="text-sm text-gray2">{'미리보기'}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${ !isMobilePreview ? 'text-accent' : 'text-gray3' }`}>
                      {'PC'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsMobilePreview(!isMobilePreview)}
                      className="relative h-4 w-[34px] rounded-full transition-colors duration-300 bg-accent"
                      aria-label="Toggle pc and mobile preview"
                    >
                      <div
                        className={`bg-background absolute top-0.5 size-3 rounded-full shadow-md transition-transform duration-300 ${
                          isMobilePreview ? 'translate-x-5' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                    <span className={`text-sm ${ isMobilePreview ? 'text-accent' : 'text-gray3' }`}>
                      {'Mobile'}
                    </span>
                  </div>
                </div>
                <div className={`flex justify-center ${ isMobilePreview ? 'bg-gray4 rounded-b-lg' : '' }`}>
                  <div className={isMobilePreview ? 'w-full max-w-[375px]' : 'w-full'}>
                    <EditPreview
                      term={formData}
                      isPreview={true}
                      isMobilePreview={isMobilePreview}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCancelModalOpen(true)}
                  className="px-4 py-2 text-level-5 hover:bg-red-700 dark:hover:bg-red-900 hover:text-white rounded-md transition-all duration-200"
                >
                  {'작성 취소'}
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={saveFormData}
                    className="flex items-center px-4 py-2 rounded-md hover:bg-gray4 text-gray0"
                    title="현재 작성 중인 내용을 브라우저에 임시저장합니다"
                  >
                    <Save size={18} className="mr-1.5" />
                    {'임시저장'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsLoadModalOpen(true)}
                    className="flex items-center px-4 py-2 rounded-md bg-gray3 hover:bg-gray2 text-white"
                    title="브라우저에 마지막으로 임시저장한 내용을 불러옵니다"
                  >
                    <Upload size={18} className="mr-1.5" />
                    {'불러오기'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

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
        onConfirm={() => {
          localStorage.removeItem('diki-create-form-data');
          router.push('/');
        }}
        title="작성 취소"
        message="정말 작성을 취소하시겠습니까? 저장된 내용도 삭제됩니다."
        confirmText="확인"
        cancelText="취소"
      />

      {/* 불러오기 확인 모달 */}
      <ConfirmModal
        isOpen={isLoadModalOpen}
        onClose={() => setIsLoadModalOpen(false)}
        onConfirm={loadFormData}
        title="저장된 내용 불러오기"
        message="이전에 저장한 내용을 불러오시겠습니까? 현재 작성 중인 내용은 사라집니다."
        submessage={(
          <div>
            <p className="text-sm text-gray2 mt-2">
              {'- 저장된 내용은 현재 사용 중인 기기와 브라우저에서만 불러올 수 있습니다.'}
            </p>
            <p className="text-sm text-gray2">
              {'- 다른 컴퓨터나 모바일 기기에서 저장한 내용은 여기서 볼 수 없습니다.'}
            </p>
          </div>
        )}
        confirmText="불러오기"
        cancelText="취소"
      />
    </div>
  );
}
