'use client';

import { useState, useEffect, useCallback } from 'react';
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
import { X, Save, Upload } from 'lucide-react';

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
  etcTitle: boolean;
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
  const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [newEtcKeyword, setNewEtcKeyword] = useState('');

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
    etcTitle: false,
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
      if (isLoggedIn && !formSubmitted) {
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
  }, [formData, isLoggedIn, formSubmitted, showToast]);

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
    // console.log('섹션 토글 함수 호출됨:', section);

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
        'etcTitle': 'etcTitle',
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
    tags: (data: TermData) => !Array.isArray(data.tags) || data.tags.length === 0,
    terms: (data: TermData) => !Array.isArray(data.terms) || data.terms.length === 0,
    references: (data: TermData) => {
      const hasTutorials = Array.isArray(data.references?.tutorials) && data.references.tutorials.length > 0;
      const hasBooks = Array.isArray(data.references?.books) && data.references.books.length > 0;
      const hasAcademic = Array.isArray(data.references?.academic) && data.references.academic.length > 0;
      const hasOpensource = Array.isArray(data.references?.opensource) && data.references.opensource.length > 0;
      return !(hasTutorials || hasBooks || hasAcademic || hasOpensource);
    },
  };

  // 에러 메시지 맵
  const errorMessages = {
    koTitle: '한글 제목을 입력하세요.',
    enTitle: '영문 제목을 입력하세요.',
    shortDesc: '짧은 설명을 입력하세요.',
    difficulty: '난이도에 대한 설명을 입력하세요.',
    description: '전체 설명을 입력하세요.',
    relevance: [
      '데이터 분석가 직무 연관성 설명을 입력하세요.',
      '데이터 과학자 직무 연관성 설명을 입력하세요.',
      '데이터 엔지니어 직무 연관성 설명을 입력하세요.',
    ],
    usecase: [
      '사용 사례 개요를 입력하세요.',
      '구체적인 사용 사례를 입력하세요.',
    ],
    tags: '관련 포스트를 하나 이상 추가하세요.',
    terms: '관련 용어를 하나 이상 추가하세요.',
    references: '참고 자료를 하나 이상 추가하세요.',
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
      setError('붉은 점선으로 된 항목을 모두 채워주세요.');
      showToast('붉은 점선으로 된 항목을 모두 채워주세요.', 'error');
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

      // 제출 성공 시 로컬 스토리지에서 데이터 삭제
      localStorage.removeItem('diki-create-form-data');
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
        onKeyDown={(e) => {
          if (e.nativeEvent.isComposing) return;
          if (e.key === 'Enter') {
            e.preventDefault();
            toggleSection('enTitle');
          }
        }}
        className="w-full p-2 border border-gray4 text-main rounded-md focus:border-primary focus:ring-1 focus:ring-primary"
        placeholder="포스트 한글 제목 (ex. 인공지능)"
        required
      />
      {validationErrors.find((err) => err.includes('한글 제목')) && (
        <p className="text-level-5 text-sm mt-1">{'한글 제목을 입력하세요.'}</p>
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
        onKeyDown={(e) => {
          if (e.nativeEvent.isComposing) return;
          if (e.key === 'Enter') {
            e.preventDefault();
            toggleSection('shortDesc');
          }
        }}
        className="w-full p-2 border border-gray4 text-main rounded-md focus:border-primary focus:ring-1 focus:ring-primary"
        placeholder="포스트 영문 제목 (ex. Artificial Intelligence)"
        required
      />
      {validationErrors.find((err) => err.includes('영문 제목')) && (
        <p className="text-level-5 text-sm mt-1">{'영문 제목을 입력하세요.'}</p>
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
          onKeyDown={(e) => {
            if (e.nativeEvent.isComposing) return;
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              toggleSection('difficulty');
            }
          }}
          className="w-full p-2 border border-gray4 text-main rounded-md resize-none overflow-hidden focus:border-primary focus:ring-1 focus:ring-primary"
          required
          placeholder="포스트에 대한 간단한 설명을 작성하세요."
          maxLength={100}
          rows={2}
          style={{ minHeight: '60px' }}
        />
        <div className="absolute right-2 bottom-2 text-xs text-gray2">
          {`${ formData.description?.short?.length || 0 }/100`}
        </div>
      </div>
      {validationErrors.find((err) => err.includes('짧은 설명')) && (
        <p className="text-level-5 text-sm mt-1">{'짧은 설명을 입력하세요.'}</p>
      )}
    </div>
  );

  // ETC 제목 폼 렌더링
  const renderEtcTitleForm = () => {
    const currentEtcArray = Array.isArray(formData.title?.etc) ? formData.title.etc : [];

    const handleAddKeyword = () => {
      if (newEtcKeyword.trim()) {
        setFormData((prev) => ({
          ...prev,
          title: {
            ...prev.title,
            etc: [...(prev.title?.etc || []), newEtcKeyword.trim()],
          },
        }));
        setNewEtcKeyword('');
      }
    };

    const handleRemoveKeyword = (index: number) => {
      setFormData((prev) => ({
        ...prev,
        title: {
          ...prev.title,
          etc: (prev.title?.etc || []).filter((_, i) => i !== index),
        },
      }));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.nativeEvent.isComposing) return;
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAddKeyword();
      }
    };

    return (
      <div className="p-2">
        <label className="block text-sm font-medium mb-1 text-gray0">
          {'검색 키워드'}
        </label>
        <div className="flex items-end space-x-2 mb-2">
          <div className="flex-1">
            <input
              type="text"
              value={newEtcKeyword}
              onChange={(e) => setNewEtcKeyword(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full p-2 border border-gray4 rounded-md text-main"
              placeholder="검색 결과의 정확도를 높이기 위해 주제를 잘 나타내는 키워드를 작성하세요."
            />
          </div>
          <button
            type="button"
            onClick={handleAddKeyword}
            className="px-4 py-2 text-main border border-gray4 bg-gray4 hover:text-white hover:bg-gray3 rounded-md"
          >
            {'추가'}
          </button>
        </div>
        <p className="text-sm text-gray2 mb-2">
          {'Enter 키 또는 [추가] 버튼을 눌러 키워드를 추가할 수 있습니다. 이 키워드들은 포스트에 표시되지 않지만 검색에 사용됩니다.'}
        </p>

        <div className="flex flex-wrap gap-2 mt-4">
          {currentEtcArray.map((keyword, index) => (
            <div key={index} className="bg-gray5 border border-gray4 rounded-lg px-3 py-1 flex items-center text-main">
              <span>{keyword}</span>
              <button
                type="button"
                onClick={() => handleRemoveKeyword(index)}
                className="ml-2 text-level-5"
              >
                <X className="size-5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto">
      <div className="w-full flex justify-between items-center mb-4">
        <div className="flex items-center text-lg md:text-xl lg:text-2xl font-bold">{'새 포스트 작성'}</div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={saveFormData}
            className="flex items-center px-3 py-1.5 rounded-md hover:bg-gray4 text-sm text-gray0"
            title="현재 작성 중인 내용을 브라우저에 임시저장합니다"
          >
            <Save size={16} className="mr-1" />
            {'임시저장'}
          </button>
          <button
            type="button"
            onClick={() => setIsLoadModalOpen(true)}
            className="flex items-center px-3 py-1.5 rounded-md bg-gray3 hover:bg-gray2 text-sm text-white"
            title="브라우저에 마지막으로 임시저장한 내용을 불러옵니다"
          >
            <Upload size={16} className="mr-1" />
            {'불러오기'}
          </button>
        </div>
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
              description: <DescriptionEdit formData={formData} handleChange={handleChange} />,
              terms: <TermsEdit formData={formData} setFormData={setFormData} />,
              tags: <TagsEdit formData={formData} setFormData={setFormData} />,
              relevance: <RelevanceEdit formData={formData} handleChange={handleChange} validationErrors={validationErrors} />,
              usecase: <UsecaseEdit formData={formData} setFormData={setFormData} handleChange={handleChange} validationErrors={validationErrors} />,
              references: <ReferencesEdit formData={formData} setFormData={setFormData} />,
            }}
            renderKoreanTitleForm={renderKoreanTitleForm}
            renderEnglishTitleForm={renderEnglishTitleForm}
            renderShortDescriptionForm={renderShortDescriptionForm}
            renderEtcTitleForm={renderEtcTitleForm}
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

      <div className="flex justify-between items-center space-x-2 sm:space-x-4 space-y-2 sm:space-y-4">
        <div>
          <button
            type="button"
            onClick={() => setIsCancelModalOpen(true)}
            className="px-4 py-2 text-level-5 hover:bg-red-700 dark:hover:bg-red-900 hover:text-white rounded-md transition-all duration-200"
          >
            {'작성 취소'}
          </button>
        </div>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={togglePreviewMode}
            className={`px-4 py-2 rounded-md ${ isPreview
              ? 'text-primary hover:bg-gray4'
              : 'text-gray0 hover:bg-gray4' }`}
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

      <div className="sm:hidden">
        <Footer />
      </div>
    </div>
  );
}