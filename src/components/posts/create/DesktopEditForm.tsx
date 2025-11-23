'use client';

import { useState, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { TermData } from '@/types/database';
import KoreanTitleEdit from '@/components/edit/KoreanTitleEdit';
import EnglishTitleEdit from '@/components/edit/EnglishTitleEdit';
import EtcTitleEdit from '@/components/edit/EtcTitleEdit';
import ShortDescriptionEdit from '@/components/edit/ShortDescriptionEdit';
import DifficultyEdit from '@/components/edit/DifficultyEdit';
import TermsEdit from '@/components/edit/TermsEdit';
import TagsEdit from '@/components/edit/TagsEdit';
import RelevanceEdit from '@/components/edit/RelevanceEdit';
import UsecaseEdit from '@/components/edit/UsecaseEdit';
import ReferencesEdit from '@/components/edit/ReferencesEdit';
import { ChevronDown } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// DescriptionEdit는 MathJax를 사용하므로 동적 로드
const DescriptionEdit = dynamic(() => import('@/components/edit/DescriptionEdit'), {
  ssr: false,
  loading: () => <LoadingSpinner />,
});

interface DesktopEditFormProps {
  formData: TermData;
  setFormData: React.Dispatch<React.SetStateAction<TermData>>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>)=> void;
}

type SectionKey = 'title' | 'summary' | 'difficulty' | 'description' | 'terms' | 'tags' | 'relevance' | 'usecase' | 'references';

interface Section {
  key: SectionKey;
  label: string;
  component: React.ReactNode;
}

export default function DesktopEditForm({ formData, setFormData, handleChange }: DesktopEditFormProps) {
  const [activeSection, setActiveSection] = useState<SectionKey>('title');

  // 섹션 완료 여부 체크
  const isSectionComplete = useCallback((key: SectionKey): boolean => {
    switch (key) {
      case 'title':
        return !!(formData.title?.ko?.trim() && formData.title?.en?.trim());
      case 'summary':
        return !!(formData.description?.short?.trim());
      case 'difficulty':
        return !!(formData.difficulty?.level && formData.difficulty?.description?.trim());
      case 'description':
        return !!(formData.description?.full?.trim());
      case 'terms':
        return Array.isArray(formData.terms) && formData.terms.length > 0;
      case 'tags':
        return Array.isArray(formData.tags) && formData.tags.length > 0;
      case 'relevance':
        return !!(
          formData.relevance?.analyst?.description?.trim()
          && formData.relevance?.engineer?.description?.trim()
          && formData.relevance?.scientist?.description?.trim()
        );
      case 'usecase':
        return !!(formData.usecase?.description?.trim() && formData.usecase?.example?.trim());
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
          <KoreanTitleEdit formData={formData} handleChange={handleChange} />
          <EnglishTitleEdit formData={formData} handleChange={handleChange} />
          <EtcTitleEdit formData={formData} handleChange={handleChange} />
        </div>
      ),
    },
    {
      key: 'summary',
      label: '요약',
      component: <ShortDescriptionEdit formData={formData} handleChange={handleChange} />,
    },
    {
      key: 'difficulty',
      label: '난이도',
      component: <DifficultyEdit formData={formData} handleChange={handleChange} />,
    },
    {
      key: 'description',
      label: '개념',
      component: <DescriptionEdit formData={formData} handleChange={handleChange} />,
    },
    {
      key: 'terms',
      label: '관련 용어',
      component: <TermsEdit formData={formData} setFormData={setFormData} />,
    },
    {
      key: 'tags',
      label: '관련 포스트',
      component: <TagsEdit formData={formData} setFormData={setFormData} />,
    },
    {
      key: 'relevance',
      label: '직무 연관도',
      component: <RelevanceEdit formData={formData} handleChange={handleChange} />,
    },
    {
      key: 'usecase',
      label: '사용 사례',
      component: <UsecaseEdit formData={formData} setFormData={setFormData} handleChange={handleChange} />,
    },
    {
      key: 'references',
      label: '참고 자료',
      component: <ReferencesEdit formData={formData} setFormData={setFormData} />,
    },
  ], [formData, handleChange, setFormData]);

  const handleSectionClick = (key: SectionKey) => {
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

          return (
            <div key={section.key} className="relative flex items-start gap-2">
              <button
                type="button"
                onClick={() => handleSectionClick(section.key)}
                className={`
                  size-9 rounded-lg font-semibold transition-all duration-200
                  ${ isComplete
              ? 'bg-primary text-white'
              : 'bg-gray4 text-gray1 hover:bg-gray3'
            }
                  ${ isActive ? 'ring ring-primary text-primary' : '' }
                `}
                title={section.label}
              >
                {index + 1}
              </button>
              {/* {isActive && (
                <span className="w-20 absolute top-[-24px] left-14 text-primary animate-fadeIn">
                  {section.label}
                </span>
              )} */}
            </div>
          );
        })}
      </div>

      {/* 아코디언 섹션 */}
      <div className="flex flex-col gap-2 mx-1">
        {orderedSections.map((section) => {
          const isComplete = isSectionComplete(section.key);
          const isActive = activeSection === section.key;
          const originalIndex = sections.findIndex((s) => s.key === section.key);

          return (
            <div
              key={section.key}
              className={`
                rounded-lg border
                ${ isComplete ? 'border-primary' : 'border-gray4' }
                ${ isActive ? 'border-secondary outline outline-2 outline-primary' : '' }
              `}
            >
              {/* 아코디언 헤더 */}
              <div
                className="w-full px-6 py-4 flex items-center justify-between rounded-lg transition-colors duration-200"
              >
                <div className="flex items-center gap-4">
                  <span
                    className={`
                      flex items-center justify-center size-8 rounded-lg font-semibold text-sm transition-all duration-200
                      ${ isComplete ? 'bg-primary text-white' : 'bg-gray4 text-gray1' }
                    `}
                  >
                    {originalIndex + 1}
                  </span>
                  <span className="font-semibold text-lg text-main transition-all duration-200">{section.label}</span>
                </div>
              </div>

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
