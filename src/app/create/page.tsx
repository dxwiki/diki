'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TermData } from '@/types/database';
import BasicInfoEdit from '@/components/create/BasicInfoEdit';
import DescriptionEdit from '@/components/create/DescriptionEdit';
import TagsEdit from '@/components/create/TagsEdit';
import TermsEdit from '@/components/create/TermsEdit';
import DifficultyEdit from '@/components/create/DifficultyEdit';
import RelevanceEdit from '@/components/create/RelevanceEdit';
import UsecaseEdit from '@/components/create/UsecaseEdit';
import ReferencesEdit from '@/components/create/ReferencesEdit';
import EditPreview from '@/components/create/EditPreview';
import { ConfirmModal } from '@/components/ui/Modal';
import Footer from '@/components/common/Footer';
import { useToast } from '@/layouts/ToastProvider';

interface EditingSectionState {
  basicInfo: boolean;
  difficulty: boolean;
  description: boolean;
  tags: boolean;
  terms: boolean;
  relevance: boolean;
  usecase: boolean;
  references: boolean;
  koTitle: boolean;
  enTitle: boolean;
  shortDesc: boolean;
}

export default function CreatePage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isPreview, setIsPreview] = useState(false);

  // 각 섹션의 편집 상태를 관리하는 상태
  const [editingSections, setEditingSections] = useState<EditingSectionState>({
    basicInfo: false,
    difficulty: false,
    description: false,
    tags: false,
    terms: false,
    relevance: false,
    usecase: false,
    references: false,
    koTitle: false,
    enTitle: false,
    shortDesc: false,
  });

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

  // 섹션 토글 함수
  const toggleSection = (section: string) => {
    console.log('섹션 토글 함수 호출됨:', section);

    // section이 문자열이 아닌 경우 처리
    if (typeof section !== 'string') {
      console.error('섹션이 문자열이 아님:', section);
      return;
    }

    // 'close' 명령이면 모든 섹션 닫기
    if (section === 'close') {
      setEditingSections((prev) => {
        const newState = { ...prev };
        Object.keys(newState).forEach((key) => {
          newState[key as keyof EditingSectionState] = false;
        });
        return newState;
      });
      return;
    }

    // 섹션 ID에서 키로 변환
    const getSectionKey = (id: string): keyof EditingSectionState | null => {
      const sectionMap: Record<string, keyof EditingSectionState> = {
        'description': 'description',
        'terms': 'terms',
        'tags': 'tags',
        'relevance': 'relevance',
        'usecase': 'usecase',
        'references': 'references',
        'description-section': 'description',
        'terms-section': 'terms',
        'tags-section': 'tags',
        'relevance-section': 'relevance',
        'usecase-section': 'usecase',
        'references-section': 'references',
        'koTitle': 'koTitle',
        'enTitle': 'enTitle',
        'shortDesc': 'shortDesc',
        'difficulty': 'difficulty',
      };

      return sectionMap[id] || null;
    };

    const sectionKey = getSectionKey(section);
    if (!sectionKey) {
      console.error('알 수 없는 섹션 ID:', section);
      return;
    }

    setEditingSections((prev) => {
      // 다른 섹션들을 모두 닫고 선택한 섹션만 토글
      const newState = Object.keys(prev).reduce((acc, key) => {
        acc[key as keyof EditingSectionState] = false;
        return acc;
      }, {} as EditingSectionState);

      newState[sectionKey] = !prev[sectionKey];
      return newState;
    });
  };

  // 미리보기 모드 토글 함수
  const togglePreviewMode = () => {
    setIsPreview(!isPreview);
    // 미리보기 모드에서는 모든 섹션 편집 닫기
    if (!isPreview) {
      setEditingSections((prev) => {
        const newState = { ...prev };
        Object.keys(newState).forEach((key) => {
          newState[key as keyof EditingSectionState] = false;
        });
        return newState;
      });
    }
  };

  // 폼 필드 유효성 검사 조건을 하나의 객체로 정의
  const validationRules = {
    koTitle: (data: TermData) => !data.title?.ko || data.title.ko.trim() === '',
    enTitle: (data: TermData) => !data.title?.en || data.title.en.trim() === '',
    shortDesc: (data: TermData) => !data.description?.short || data.description.short.trim() === '',
    difficulty: (data: TermData) => !data.difficulty?.description || data.difficulty.description.trim() === '',
    description: (data: TermData) => !data.description?.full || data.description.full.trim() === '',
    relevance: (data: TermData) => (
      !data.relevance?.analyst?.description
      || !data.relevance?.scientist?.description
      || !data.relevance?.engineer?.description
    ),
    usecase: (data: TermData) => !data.usecase?.description || !data.usecase?.example,
    // 태그와 용어, 참고자료는 필수가 아님
    tags: () => false,
    terms: () => false,
    references: () => false,
  };

  // 에러 메시지 맵
  const errorMessages = {
    koTitle: '한글 제목을 입력해주세요.',
    enTitle: '영문 제목을 입력해주세요.',
    shortDesc: '짧은 설명을 입력해주세요.',
    difficulty: '난이도 설명을 입력해주세요.',
    description: '전체 설명을 입력해주세요.',
    relevance: [
      '데이터 분석가 직무 연관성 설명을 입력해주세요.',
      '데이터 과학자 직무 연관성 설명을 입력해주세요.',
      '데이터 엔지니어 직무 연관성 설명을 입력해주세요.',
    ],
    usecase: [
      '사용 사례 개요를 입력해주세요.',
      '구체적인 사용 사례를 입력해주세요.',
    ],
  };

  // 섹션 유효성 검사 함수
  const validateSection = (section: string): boolean => {
    const errors = getSectionValidationErrors(section);
    setValidationErrors(errors);
    return errors.length === 0;
  };

  // 섹션별 유효성 검사 에러 가져오기
  const getSectionValidationErrors = (section: string): string[] => {
    const errors: string[] = [];

    // 유효성 검사 규칙이 있고 해당 섹션이 유효하지 않은 경우
    if (section in validationRules && validationRules[section as keyof typeof validationRules](formData)) {
      const errorMessage = errorMessages[section as keyof typeof errorMessages];

      // 에러 메시지가 배열인 경우 (relevance, usecase)
      if (Array.isArray(errorMessage)) {
        errors.push(...errorMessage);
      } else if (errorMessage) {
        errors.push(errorMessage);
      }
    }

    return errors;
  };

  // 폼 유효성 검사
  const validateForm = (): boolean => {
    const errors: string[] = [];

    // 모든 필수 섹션에 대해 유효성 검사 수행
    Object.keys(validationRules).forEach((section) => {
      if (section === 'tags' || section === 'terms' || section === 'references') return; // 필수 아님

      const sectionErrors = getSectionValidationErrors(section);
      if (sectionErrors.length > 0) {
        errors.push(...sectionErrors);
      }
    });

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 폼 제출 상태 설정
    setFormSubmitted(true);

    if (!validateForm()) {
      setError('필수 항목을 모두 입력해주세요.');
      // 토스트 메시지 표시
      showToast('필수 요소를 모두 채워주세요.', 'error');

      // 필수 항목 중 누락된 항목에 해당하는 섹션 자동으로 열기
      const newEditingSections = { ...editingSections };

      // 첫 번째 에러가 있는 섹션 찾기
      for (const section of Object.keys(validationRules)) {
        if (section === 'tags' || section === 'terms' || section === 'references') continue; // 필수 아님

        if (validationRules[section as keyof typeof validationRules](formData)) {
          newEditingSections[section as keyof EditingSectionState] = true;
          break; // 첫 번째 에러가 있는 섹션만 열기
        }
      }

      setEditingSections(newEditingSections);

      // 첫 번째 오류 발생 위치로 스크롤
      const firstErrorSection = Object.entries(newEditingSections).find(([, isOpen]) => isOpen);
      if (firstErrorSection) {
        const sectionElement = document.getElementById(`${ firstErrorSection[0] }-section`);
        if (sectionElement) {
          sectionElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }

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

  // 모달용 컴포넌트 생성
  const renderKoreanTitleForm = () => (
    <div className="p-2">
      <label className="block text-sm font-medium mb-1 text-gray0">{'한글 제목'}</label>
      <input
        type="text"
        name="title.ko"
        value={formData.title?.ko || ''}
        onChange={handleChange}
        className="w-full p-2 border border-gray4 text-main rounded-md focus:border-primary focus:ring-1 focus:ring-primary"
        placeholder="포스트 한글 제목 (ex. 인공지능)"
        required
      />
      {validationErrors.find((err) => err.includes('한글 제목')) && (
        <p className="text-level-5 text-sm mt-1">{'한글 제목을 입력해주세요.'}</p>
      )}
    </div>
  );

  const renderEnglishTitleForm = () => (
    <div className="p-2">
      <label className="block text-sm font-medium mb-1 text-gray0">{'영문 제목'}</label>
      <input
        type="text"
        name="title.en"
        value={formData.title?.en || ''}
        onChange={handleChange}
        className="w-full p-2 border border-gray4 text-main rounded-md focus:border-primary focus:ring-1 focus:ring-primary"
        placeholder="포스트 영문 제목 (ex. Artificial Intelligence)"
        required
      />
      {validationErrors.find((err) => err.includes('영문 제목')) && (
        <p className="text-level-5 text-sm mt-1">{'영문 제목을 입력해주세요.'}</p>
      )}
    </div>
  );

  const renderShortDescriptionForm = () => (
    <div className="p-2">
      <label className="block text-sm font-medium mb-1 text-gray0">{'짧은 설명'}</label>
      <div className="relative">
        <textarea
          name="description.short"
          value={formData.description?.short || ''}
          onChange={(e) => {
            handleChange(e);
            // 높이 자동 조절
            e.target.style.height = 'auto';
            e.target.style.height = e.target.scrollHeight + 'px';
          }}
          className="w-full p-2 border border-gray4 text-main rounded-md resize-none overflow-hidden focus:border-primary focus:ring-1 focus:ring-primary"
          required
          placeholder="포스트에 대한 1~2줄 짧은 설명 (100자 이내)"
          maxLength={100}
          rows={2}
          style={{ minHeight: '60px' }}
        />
        <div className="absolute right-2 bottom-2 text-xs text-gray2">
          {`${ formData.description?.short?.length || 0 }/100`}
        </div>
      </div>
      {validationErrors.find((err) => err.includes('짧은 설명')) && (
        <p className="text-level-5 text-sm mt-1">{'짧은 설명을 입력해주세요.'}</p>
      )}
    </div>
  );

  return (
    <div className="container mx-auto">
      <div className="w-full flex justify-between items-center mb-4">
        <div className="flex items-center text-lg md:text-xl lg:text-2xl font-bold">{'새 포스트 작성'}</div>
      </div>

      <form id="createForm" onSubmit={handleSubmit} noValidate>
        <div className="relative">
          {/* EditPreview 컴포넌트가 섹션 클릭 이벤트를 받을 수 있도록 toggleSection 함수 전달 */}
          <EditPreview
            term={formData}
            onSectionClick={isPreview ? undefined : toggleSection}
            editingSections={editingSections}
            formComponents={{
              basicInfo: <BasicInfoEdit formData={formData} handleChange={handleChange} validationErrors={validationErrors} />,
              difficulty: <DifficultyEdit formData={formData} handleChange={handleChange} validationErrors={validationErrors} />,
              description: <DescriptionEdit formData={formData} handleChange={handleChange} validationErrors={validationErrors} />,
              terms: <TermsEdit formData={formData} setFormData={setFormData} />,
              tags: <TagsEdit formData={formData} setFormData={setFormData} />,
              relevance: <RelevanceEdit formData={formData} handleChange={handleChange} validationErrors={validationErrors} />,
              usecase: <UsecaseEdit formData={formData} setFormData={setFormData} handleChange={handleChange} validationErrors={validationErrors} />,
              references: <ReferencesEdit formData={formData} setFormData={setFormData} />,
            }}
            renderKoreanTitleForm={renderKoreanTitleForm}
            renderEnglishTitleForm={renderEnglishTitleForm}
            renderShortDescriptionForm={renderShortDescriptionForm}
            validateSection={validateSection}
            formSubmitted={formSubmitted}
            isPreview={isPreview}
          />
        </div>

        {error && validationErrors.length === 0 && (
          <div className="text-end text-level-5 rounded-lg">
            {error}
          </div>
        )}
      </form>

      <div className="flex justify-between space-x-2 sm:space-x-4 space-y-2 sm:space-y-4">
        <button
          type="button"
          onClick={() => setIsCancelModalOpen(true)}
          className="px-4 py-2 text-level-5 hover:bg-red-700 dark:hover:bg-red-900 hover:text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {'작성 취소'}
        </button>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={togglePreviewMode}
            className={`px-4 py-2 rounded-md ${ isPreview
              ? 'text-primary hover:text-accent'
              : 'text-gray2 hover:text-main' }`}
          >
            {isPreview ? '편집하기' : '미리보기'}
          </button>
          <button
            type="submit"
            form="createForm"
            disabled={submitting}
            className="px-4 py-2 text-white bg-primary dark:bg-secondary hover:bg-accent dark:hover:bg-background-secondary rounded-md border-gray4 disabled:opacity-50"
          >
            {submitting ? '제출 중...' : '등록하기'}
          </button>
        </div>
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