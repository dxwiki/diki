'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import dynamic from 'next/dynamic';
import { TermData } from '@/types/database';
import { RootState, AppDispatch } from '@/store';
import {
  SectionKey,
  setFieldErrors,
  setFieldValids,
  setSectionError,
  setSectionTouched,
} from '@/store/formValidationSlice';
import { validateSection, validateAllSections } from '@/utils/formValidation';
import KoreanTitleEdit, { KoreanTitleEditHandle } from '@/components/edit/KoreanTitleEdit';
import EnglishTitleEdit, { EnglishTitleEditHandle } from '@/components/edit/EnglishTitleEdit';
import EtcTitleEdit, { EtcTitleEditHandle } from '@/components/edit/EtcTitleEdit';
import ShortDescriptionEdit, { ShortDescriptionEditHandle } from '@/components/edit/ShortDescriptionEdit';
import DifficultyEdit, { DifficultyEditHandle } from '@/components/edit/DifficultyEdit';
import TermsEdit, { TermsEditHandle } from '@/components/edit/TermsEdit';
import TagsEdit, { TagsEditHandle } from '@/components/edit/TagsEdit';
import RelevanceEdit, { RelevanceEditHandle } from '@/components/edit/RelevanceEdit';
import UsecaseEdit, { UsecaseEditHandle } from '@/components/edit/UsecaseEdit';
import ReferencesEdit, { ReferencesEditHandle } from '@/components/edit/ReferencesEdit';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// DescriptionEdit는 MathJax를 사용하므로 동적 로드
const DescriptionEdit = dynamic(() => import('@/components/edit/DescriptionEdit'), {
  ssr: false,
  loading: () => <LoadingSpinner />,
});

// 섹션 순서 배열
const sectionList: SectionKey[] = ['title', 'summary', 'difficulty', 'description', 'terms', 'tags', 'relevance', 'usecase', 'references'];

interface DesktopEditFormProps {
  formData: TermData;
  setFormData: React.Dispatch<React.SetStateAction<TermData>>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>)=> void;
}

interface Section {
  key: SectionKey;
  label: string;
  component: React.ReactNode;
}

export default function DesktopEditForm({ formData, setFormData, handleChange }: DesktopEditFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const sectionErrors = useSelector((state: RootState) => state.formValidation.sectionErrors);

  const [activeSection, setActiveSection] = useState<SectionKey>('title');

  // 각 컴포넌트 refs
  const koreanTitleRef = useRef<KoreanTitleEditHandle>(null);
  const englishTitleRef = useRef<EnglishTitleEditHandle>(null);
  const etcTitleRef = useRef<EtcTitleEditHandle>(null);
  const shortDescriptionRef = useRef<ShortDescriptionEditHandle>(null);
  const difficultyRef = useRef<DifficultyEditHandle>(null);
  const termsRef = useRef<TermsEditHandle>(null);
  const tagsRef = useRef<TagsEditHandle>(null);
  const relevanceRef = useRef<RelevanceEditHandle>(null);
  const usecaseRef = useRef<UsecaseEditHandle>(null);
  const referencesRef = useRef<ReferencesEditHandle>(null);

  // 컴포넌트 마운트 시 및 formData 변경 시 초기 유효성 체크
  useEffect(() => {
    const { fieldValids, sectionErrors: validatedSectionErrors } = validateAllSections(formData);
    dispatch(setFieldValids(fieldValids));

    // 에러로 표시된 섹션이 이제 유효하면 에러 상태 해제
    sectionList.forEach((section) => {
      // 현재 섹션이 에러 상태이고, validation 결과 에러가 없으면 에러 해제
      if (sectionErrors[section] && !validatedSectionErrors[section]) {
        dispatch(setSectionError({ section, hasError: false }));
      }
    });
  }, [formData, dispatch, sectionErrors]);

  // 다음 섹션으로 이동하는 함수
  const goToNextSection = useCallback((currentSection: SectionKey) => {
    const currentIndex = sectionList.indexOf(currentSection);
    // 마지막 섹션이면 첫 번째 섹션으로, 아니면 다음 섹션으로
    const nextSection = currentIndex < sectionList.length - 1
      ? sectionList[currentIndex + 1]
      : sectionList[0];

    // 현재 섹션 validation
    const result = validateSection(formData, currentSection);
    dispatch(setSectionTouched({ section: currentSection, touched: true }));
    dispatch(setFieldErrors(result.errors));
    dispatch(setFieldValids(result.fieldValids));
    dispatch(setSectionError({ section: currentSection, hasError: result.hasError }));

    // 다음 섹션 활성화
    setActiveSection(nextSection);
  }, [formData, dispatch]);

  // 섹션이 활성화될 때 첫 입력 요소에 focus
  useEffect(() => {
    if (!activeSection) return;

    const timer = setTimeout(() => {
      switch (activeSection) {
        case 'title':
          koreanTitleRef.current?.focus();
          break;
        case 'summary':
          shortDescriptionRef.current?.focus();
          break;
        case 'difficulty':
          difficultyRef.current?.focus();
          break;
        case 'description':
          // DescriptionEdit는 dynamic import라 autoFocus prop 사용
          break;
        case 'terms':
          termsRef.current?.focus();
          break;
        case 'tags':
          tagsRef.current?.focus();
          break;
        case 'relevance':
          relevanceRef.current?.focus();
          break;
        case 'usecase':
          usecaseRef.current?.focus();
          break;
        case 'references':
          referencesRef.current?.focus();
          break;
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [activeSection]);

  // 안전한 문자열 trim 헬퍼
  const safeTrim = (value: unknown): string => {
    if (typeof value === 'string') return value.trim();
    return '';
  };

  // 섹션 완료 여부 체크
  const isSectionComplete = useCallback((key: SectionKey): boolean => {
    switch (key) {
      case 'title':
        return !!(safeTrim(formData.title?.ko) && safeTrim(formData.title?.en));
      case 'summary':
        return !!safeTrim(formData.description?.short);
      case 'difficulty':
        return !!(formData.difficulty?.level && safeTrim(formData.difficulty?.description));
      case 'description':
        return !!safeTrim(formData.description?.full);
      case 'terms':
        return Array.isArray(formData.terms) && formData.terms.length > 0;
      case 'tags':
        return Array.isArray(formData.tags) && formData.tags.length > 0;
      case 'relevance':
        return !!(
          safeTrim(formData.relevance?.analyst?.description)
          && safeTrim(formData.relevance?.engineer?.description)
          && safeTrim(formData.relevance?.scientist?.description)
        );
      case 'usecase':
        return !!(safeTrim(formData.usecase?.description) && safeTrim(formData.usecase?.example));
      case 'references':
        return (
          (Array.isArray(formData.references?.tutorials) && formData.references.tutorials.length > 0)
          || (Array.isArray(formData.references?.books) && formData.references.books.length > 0)
          || (Array.isArray(formData.references?.academic) && formData.references.academic.length > 0)
          || (Array.isArray(formData.references?.opensource) && formData.references.opensource.length > 0)
        );
      default:
        return false;
    }
  }, [formData]);

  const sections: Section[] = useMemo(() => [
    {
      key: 'title',
      label: '제목',
      component: (
        <div className="space-y-4">
          <KoreanTitleEdit
            ref={koreanTitleRef}
            formData={formData}
            handleChange={handleChange}
            onTabToNext={() => englishTitleRef.current?.focus()}
          />
          <EnglishTitleEdit
            ref={englishTitleRef}
            formData={formData}
            handleChange={handleChange}
            onTabToNext={() => etcTitleRef.current?.focus()}
          />
          <EtcTitleEdit
            ref={etcTitleRef}
            formData={formData}
            handleChange={handleChange}
            onTabToNext={() => goToNextSection('title')}
          />
        </div>
      ),
    },
    {
      key: 'summary',
      label: '요약',
      component: (
        <ShortDescriptionEdit
          ref={shortDescriptionRef}
          formData={formData}
          handleChange={handleChange}
          onTabToNext={() => goToNextSection('summary')}
        />
      ),
    },
    {
      key: 'difficulty',
      label: '난이도',
      component: (
        <DifficultyEdit
          ref={difficultyRef}
          formData={formData}
          handleChange={handleChange}
          onTabToNext={() => goToNextSection('difficulty')}
        />
      ),
    },
    {
      key: 'description',
      label: '개념',
      component: (
        <DescriptionEdit
          formData={formData}
          handleChange={handleChange}
          autoFocus={activeSection === 'description'}
          onTabToNext={() => goToNextSection('description')}
        />
      ),
    },
    {
      key: 'terms',
      label: '관련 용어',
      component: (
        <TermsEdit
          ref={termsRef}
          formData={formData}
          setFormData={setFormData}
          onTabToNext={() => goToNextSection('terms')}
        />
      ),
    },
    {
      key: 'tags',
      label: '관련 포스트',
      component: (
        <TagsEdit
          ref={tagsRef}
          formData={formData}
          setFormData={setFormData}
          onTabToNext={() => goToNextSection('tags')}
        />
      ),
    },
    {
      key: 'relevance',
      label: '직무 연관도',
      component: (
        <RelevanceEdit
          ref={relevanceRef}
          formData={formData}
          handleChange={handleChange}
          onTabToNext={() => goToNextSection('relevance')}
        />
      ),
    },
    {
      key: 'usecase',
      label: '사용 사례',
      component: (
        <UsecaseEdit
          ref={usecaseRef}
          formData={formData}
          setFormData={setFormData}
          handleChange={handleChange}
          onTabToNext={() => goToNextSection('usecase')}
        />
      ),
    },
    {
      key: 'references',
      label: '참고 자료',
      component: (
        <ReferencesEdit
          ref={referencesRef}
          formData={formData}
          setFormData={setFormData}
          onTabToNext={() => goToNextSection('references')}
        />
      ),
    },
  ], [formData, handleChange, setFormData, activeSection, goToNextSection]);

  const handleSectionClick = (key: SectionKey) => {
    // 현재 섹션이 있고, 다른 섹션으로 이동하는 경우 validation 수행
    if (activeSection && activeSection !== key) {
      const result = validateSection(formData, activeSection);

      // 현재 섹션의 모든 필드를 touched로 설정
      dispatch(setSectionTouched({ section: activeSection, touched: true }));

      // 필드 에러 설정
      dispatch(setFieldErrors(result.errors));

      // 필드 유효성 설정
      dispatch(setFieldValids(result.fieldValids));

      // 섹션 에러 설정
      dispatch(setSectionError({ section: activeSection, hasError: result.hasError }));
    }

    setActiveSection(activeSection === key ? null as unknown as SectionKey : key);
  };

  // 활성 섹션에 따라 섹션 순서 재정렬
  const reorderedSections = useCallback(() => {
    if (!activeSection) return sections;

    const activeIndex = sections.findIndex((s) => s.key === activeSection);
    if (activeIndex === -1) return sections;

    // 활성 섹션부터 순환하여 배열 생성
    return [
      ...sections.slice(activeIndex),
      ...sections.slice(0, activeIndex),
    ];
  }, [activeSection, sections]);

  const orderedSections = reorderedSections();

  return (
    <div className="flex flex-col gap-1 pb-6">
      {/* 상단 진행도 표시 */}
      <div className="flex gap-2 flex-wrap sticky top-[80px] bg-background pb-[22px] border-b border-gray5 z-20">
        {sections.map((section, index) => {
          const isComplete = isSectionComplete(section.key);
          const isActive = activeSection === section.key;
          const hasError = sectionErrors[section.key];

          return (
            <div key={section.key} className="relative flex items-start gap-2">
              <button
                type="button"
                onClick={() => handleSectionClick(section.key)}
                className={`
                  size-9 rounded-lg font-semibold transition-all duration-200
                  ${ isActive ? 'ring ring-primary text-primary' : '' }
                  ${ hasError ? 'bg-level-5 text-white' : isComplete ? 'bg-primary text-white' : 'bg-gray4 text-gray1 hover:bg-gray3' }
                `}
                title={section.label}
              >
                {index + 1}
              </button>
            </div>
          );
        })}
      </div>

      {/* 아코디언 섹션 */}
      <div className="flex flex-col gap-2 mx-1">
        {orderedSections.map((section) => {
          const isComplete = isSectionComplete(section.key);
          const isActive = activeSection === section.key;
          const hasError = sectionErrors[section.key];
          const originalIndex = sections.findIndex((s) => s.key === section.key);

          return (
            <div
              key={section.key}
              className={`
                rounded-lg border transition-all duration-200
                ${ hasError ? 'border-level-5' : isComplete ? 'border-primary' : 'border-gray4' }
                ${ isActive ? 'outline outline-2 outline-primary' : '' }
              `}
            >
              {/* 아코디언 헤더 */}
              <button
                type="button"
                onClick={() => handleSectionClick(section.key)}
                className="w-full px-6 py-4 flex items-center justify-between rounded-lg transition-colors duration-200"
              >
                <div className="flex items-center gap-4">
                  <span
                    className={`
                      flex items-center justify-center size-8 rounded-lg font-semibold text-sm transition-all duration-200
                      ${ isActive ? 'ring ring-primary text-primary' : '' }
                      ${ hasError ? 'bg-level-5 text-white' : isComplete ? 'bg-primary text-white' : 'bg-gray4 text-gray1' }
                    `}
                  >
                    {originalIndex + 1}
                  </span>
                  <span className="font-semibold text-lg text-main transition-all duration-200">{section.label}</span>
                </div>
                <span className={`text-sm transition-all duration-200 ${ hasError ? 'text-level-5' : isComplete ? 'text-primary' : 'text-gray2' }`}>
                  {hasError ? '입력 필요' : isComplete ? '작성 완료' : isActive ? '작성중' : ''}
                </span>
              </button>

              {/* 아코디언 내용 */}
              {isActive && (
                <div className="px-6 py-4 bg-background rounded-b-lg">
                  {section.component}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
