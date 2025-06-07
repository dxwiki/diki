'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { TermData } from '@/types/database';
import DescriptionEdit from '@/components/create/DescriptionEdit';
import TagsEdit from '@/components/create/TagsEdit';
import TermsEdit from '@/components/create/TermsEdit';
import DifficultyEdit from '@/components/create/DifficultyEdit';
import RelevanceEdit from '@/components/create/RelevanceEdit';
import UsecaseEdit from '@/components/create/UsecaseEdit';
import ReferencesEdit from '@/components/create/ReferencesEdit';
import KoreanTitleEdit from '@/components/create/KoreanTitleEdit';
import EnglishTitleEdit from '@/components/create/EnglishTitleEdit';
import ShortDescriptionEdit from '@/components/create/ShortDescriptionEdit';
import EtcTitleEdit from '@/components/create/EtcTitleEdit';
import EditPreview from '@/components/create/EditPreview';
import { ConfirmModal } from '@/components/ui/Modal';
import Footer from '@/components/common/Footer';
import { useToast } from '@/layouts/ToastProvider';
import { Save, Upload } from 'lucide-react';

interface EditingSectionState {
  koTitle: boolean;
  enTitle: boolean;
  shortDesc: boolean;
  etcTitle: boolean;
  difficulty: boolean;
  description: boolean;
  tags: boolean;
  terms: boolean;
  relevance: boolean;
  usecase: boolean;
  references: boolean;
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
  const [isPreview, setIsPreview] = useState(false);

  // 각 섹션의 편집 상태를 관리하는 상태
  const [editingSections, setEditingSections] = useState<EditingSectionState>({
    koTitle: false,
    enTitle: false,
    shortDesc: false,
    etcTitle: false,
    difficulty: false,
    description: false,
    tags: false,
    terms: false,
    relevance: false,
    usecase: false,
    references: false,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
          <EditPreview
            term={formData}
            onSectionClick={isPreview ? undefined : toggleSection}
            editingSections={editingSections}
            formComponents={{
              koTitle: <KoreanTitleEdit formData={formData} handleChange={handleChange} onEnterPress={() => toggleSection('enTitle')} />,
              enTitle: <EnglishTitleEdit formData={formData} handleChange={handleChange} onEnterPress={() => toggleSection('shortDesc')} />,
              shortDesc: <ShortDescriptionEdit formData={formData} handleChange={handleChange} onEnterPress={() => toggleSection('difficulty')} />,
              etcTitle: <EtcTitleEdit formData={formData} handleChange={handleChange} />,
              difficulty: <DifficultyEdit formData={formData} handleChange={handleChange} />,
              description: <DescriptionEdit formData={formData} handleChange={handleChange} />,
              terms: <TermsEdit formData={formData} setFormData={setFormData} />,
              tags: <TagsEdit formData={formData} setFormData={setFormData} />,
              relevance: <RelevanceEdit formData={formData} handleChange={handleChange} />,
              usecase: <UsecaseEdit formData={formData} setFormData={setFormData} handleChange={handleChange} />,
              references: <ReferencesEdit formData={formData} setFormData={setFormData} />,
            }}
            isPreview={isPreview}
          />
        </div>

        {error && (
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