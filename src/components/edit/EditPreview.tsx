'use client';

import React, { useEffect, useRef, ReactElement, useState, useCallback } from 'react';
import { TermData } from '@/types/database';
import DescriptionSection from '../posts/sections/DescriptionSection';
import RelevanceSection from '../posts/sections/RelevanceSection';
import RelatedTermsSection from '../posts/sections/RelatedTermsSection';
import UsecaseSection from '../posts/sections/UsecaseSection';
import ReferencesSection from '../posts/sections/ReferencesSection';
import { X } from 'lucide-react';
import Level from '@/components/ui/Level';
import { formatDate } from '@/utils/filters';
import TableOfContents from '@/components/common/TableOfContents';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

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

interface FormComponents {
  koTitle: ReactElement;
  enTitle: ReactElement;
  shortDesc: ReactElement;
  etcTitle: ReactElement;
  difficulty: ReactElement;
  description: ReactElement;
  tags: ReactElement;
  terms: ReactElement;
  relevance: ReactElement;
  usecase: ReactElement;
  references: ReactElement;
}

interface PostPreviewProps {
  term: TermData;
  onSectionClick?: (section: string)=> void;
  editingSections?: EditingSectionState;
  formComponents?: FormComponents;
  isPreview?: boolean;
  invalidSections?: string[];
}

const PostPreview = ({
  term,
  onSectionClick,
  editingSections,
  formComponents,
  isPreview = false,
  invalidSections = [],
}: PostPreviewProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const postPreviewRef = useRef<HTMLDivElement>(null);
  const profiles = useSelector((state: RootState) => state.profiles.profiles);
  const [authorNames, setAuthorNames] = useState<{ [key: string]: string }>({});

  // 각 섹션별 폼 참조 객체 생성
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({
    koTitle: null,
    enTitle: null,
    etcTitle: null,
    shortDesc: null,
    difficulty: null,
    description: null,
    tags: null,
    terms: null,
    relevance: null,
    usecase: null,
    references: null,
    basicInfo: null,
  });

  // 각 섹션별 데이터가 유효한지 체크하는 helper 함수
  const hasData = {
    basicInfo: term.title?.ko || term.title?.en,
    description: term.description?.full,
    terms: Array.isArray(term.terms) && term.terms.length > 0,
    tags: Array.isArray(term.tags) && term.tags.length > 0,
    relevance:
      term.relevance?.analyst?.description
      || term.relevance?.engineer?.description
      || term.relevance?.scientist?.description,
    usecase: term.usecase?.description || term.usecase?.example,
    references:
      (Array.isArray(term.references?.tutorials) && term.references.tutorials.length > 0)
      || (Array.isArray(term.references?.books) && term.references.books.length > 0)
      || (Array.isArray(term.references?.academic) && term.references.academic.length > 0)
      || (Array.isArray(term.references?.opensource) && term.references.opensource.length > 0),
  };

  useEffect(() => {
    if (profiles.length > 0 && term.metadata?.authors) {
      const names: { [key: string]: string } = {};

      term.metadata.authors.forEach((author) => {
        const profile = profiles.find((p) => p.username === author);
        names[author] = profile?.name || author;
      });

      setAuthorNames(names);
    }
  }, [profiles, term.metadata?.authors]);

  // 섹션이 열릴 때 자동으로 첫번째 input이나 textarea에 포커스
  useEffect(() => {
    if (!editingSections) return;

    Object.keys(editingSections).forEach((section) => {
      if (editingSections[section as keyof EditingSectionState]) {
        setTimeout(() => {
          const sectionDiv = sectionRefs.current[section];
          if (sectionDiv) {
            const searchInput = sectionDiv.querySelector('[data-search-input]') as HTMLElement;

            if (searchInput) {
              searchInput.focus();
            } else {
              const inputElement = sectionDiv.querySelector('input, textarea') as HTMLElement;
              if (inputElement) {
                inputElement.focus();
              }
            }
          }
        }, 50);
      }
    });
  }, [editingSections]);

  // 섹션 클릭 핸들러
  const handleSectionClick = useCallback((section: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (onSectionClick) {
      onSectionClick(section);
    }
  }, [onSectionClick]);

  // X 버튼 클릭 핸들러
  const handleCloseSection = useCallback((section: string) => {
    if (onSectionClick) {
      onSectionClick(section);
    }
  }, [onSectionClick]);

  // ESC 키 이벤트 핸들러 추가
  useEffect(() => {
    if (!editingSections) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const openSection = Object.keys(editingSections).find(
          (section) => editingSections[section as keyof EditingSectionState]
        );

        if (openSection && onSectionClick) {
          onSectionClick(openSection);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [editingSections, onSectionClick]);

  // 섹션 hover 스타일 클래스 생성
  const getSectionClassName = useCallback((section: string, baseClass: string = '') => {
    const isEditing = editingSections && editingSections[section as keyof EditingSectionState];
    const isInvalid = invalidSections.includes(section);

    // 미리보기 모드이면 모든 스타일 적용 안함
    if (isPreview) {
      return baseClass;
    }

    // 섹션의 상태 확인 (비어있음, 콘텐츠 있음)
    const getSectionStatus = (): 'empty' | 'filled' => {
      // 섹션에 내용이 있는지 확인
      switch (section) {
        case 'koTitle':
          return term.title?.ko && term.title.ko.trim() !== '' ? 'filled' : 'empty';
        case 'enTitle':
          return term.title?.en && term.title.en.trim() !== '' ? 'filled' : 'empty';
        case 'etcTitle':
          return Array.isArray(term.title?.etc) && term.title.etc.length > 0 ? 'filled' : 'empty';
        case 'shortDesc':
          return term.description?.short && term.description.short.trim() !== '' ? 'filled' : 'empty';
        case 'difficulty':
          return term.difficulty?.description && term.difficulty.description.trim() !== '' ? 'filled' : 'empty';
        case 'description':
          return term.description?.full && term.description.full.trim() !== '' ? 'filled' : 'empty';
        case 'tags':
          return Array.isArray(term.tags) && term.tags.length > 0 ? 'filled' : 'empty';
        case 'terms':
          return Array.isArray(term.terms) && term.terms.length > 0 ? 'filled' : 'empty';
        case 'relevance':
          return term.relevance?.analyst?.description
                && term.relevance.scientist?.description
                && term.relevance.engineer?.description ? 'filled' : 'empty';
        case 'usecase':
          return term.usecase?.description && term.usecase?.example ? 'filled' : 'empty';
        case 'references':
          return (Array.isArray(term.references?.tutorials) && term.references.tutorials.length > 0)
                || (Array.isArray(term.references?.books) && term.references.books.length > 0)
                || (Array.isArray(term.references?.academic) && term.references.academic.length > 0)
                || (Array.isArray(term.references?.opensource) && term.references.opensource.length > 0) ? 'filled' : 'empty';
        default:
          return 'empty';
      }
    };

    const status = getSectionStatus();

    // 편집 중인 경우
    if (isEditing) {
      return `${ baseClass } outline outline-2 outline-primary`;
    }
    if (status === 'filled') {
      return `${ baseClass } outline outline-1 outline-dashed outline-gray3 hover:outline-primary hover:outline-2 hover:bg-background-secondary`;
    }
    if (isInvalid) {
      return `${ baseClass } outline outline-2 outline-dashed outline-level-5 bg-gray5 hover:outline-primary hover:outline-2 hover:bg-background-secondary`;
    }
    if (status === 'empty') {
      return `${ baseClass } outline outline-1 outline-dashed outline-gray3 bg-gray5 hover:outline-primary hover:outline-2 hover:bg-background-secondary`;
    }
  }, [editingSections, isPreview, invalidSections, term]);

  // 섹션 내부에 편집 폼 렌더링
  const renderInlineEditForm = useCallback((section: keyof EditingSectionState & keyof FormComponents) => {
    if (!editingSections || !formComponents) return null;
    if (!editingSections[section]) return null;

    const closeButton = (
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => handleCloseSection(section)}
          className="w-full flex justify-center items-center gap-1 p-1.5 m-2 text-main bg-gray5 hover:bg-gray4 rounded-lg transition-colors"
        >
          {'닫기'}
          <X className="size-5 text-gray1" />
        </button>
      </div>
    );

    // 각 섹션에 맞는 컴포넌트 반환
    return (
      <div
        ref={(el) => { sectionRefs.current[section] = el; }}
        className={`m-1 p-1 mt-2 animate-slideDown ${ section === 'koTitle' || section === 'enTitle' || section === 'etcTitle' ? '' : 'border-t border-primary border-dashed' } ${ section === 'tags' ? 'border-t border-primary border-dashed md:border-t-0' : '' }`}
      >
        {formComponents[section]}
        {closeButton}
      </div>
    );
  }, [editingSections, formComponents, handleCloseSection]);

  return (
    <div className="prose h-[68vh] sm:h-[calc(100vh-280px)] overflow-y-auto overflow-x-hidden block md:grid md:grid-cols-[minmax(0,176px)_5fr] bg-background" ref={postPreviewRef}>
      <TableOfContents
        title={term.title?.ko === '' ? '한글 제목' : term.title?.ko ?? ''}
        term={term}
        slug=""
        onTagSectionClick={(e) => handleSectionClick('tags', e)}
        tagsClassName={getSectionClassName('tags', 'rounded-lg')}
        isEditMode={true}
        isPreview={isPreview}
      />

      {/* 데스크톱 태그 편집 (사이드바) */}
      {editingSections?.tags && (
        <div className="hidden md:block absolute top-[353px] left-[206px] w-[50vw] max-w-[720px] z-20">
          <div className="outline outline-2 outline-primary rounded-lg bg-background p-2">
            {renderInlineEditForm('tags')}
          </div>
        </div>
      )}

      <div className='text-justify relative' ref={contentRef}>
        <div className='sm:ml-5'>
          {/* 한글/영문 제목 섹션 */}
          <div
            className="flex group cursor-pointer"
          >
            <span className={`flex flex-wrap items-center text-3xl font-bold mb-0 ${ isPreview ? '' : ' gap-2' }`}>
              <span
                id="koTitle-section"
                onClick={(e: React.MouseEvent) => handleSectionClick('koTitle', e)}
                className={getSectionClassName('koTitle', 'text-main relative p-1 rounded')}
              >
                {term.title?.ko === '' ? '한글 제목' : term.title?.ko}
              </span>
              <span
                className={getSectionClassName('enTitle', 'text-main break-all relative p-1 rounded')}
                id="enTitle-section"
                onClick={(e: React.MouseEvent) => {
                  handleSectionClick('enTitle', e);
                }}
              >
                {'('}{term.title?.en === '' ? '영문 제목' : term.title?.en}{')'}
              </span>
              {!isPreview && (
                <button
                  className={`${ getSectionClassName('etcTitle', 'inline-flex items-center px-2 py-1 text-xs rounded-lg') } border-t-0`}
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    handleSectionClick('etcTitle', e);
                  }}
                >
                  {Array.isArray(term.title?.etc) && term.title.etc.length > 0
                    ? `검색 키워드 (${ term.title.etc.length })`
                    : '검색 키워드'}
                </button>
              )}
              <span className='inline-flex items-center' />
            </span>
          </div>

          {/* 한글 제목 편집 폼 */}
          {editingSections?.koTitle && (
            <div className="relative outline outline-2 outline-primary rounded-lg">
              {renderInlineEditForm('koTitle')}
            </div>
          )}

          {/* 영문 제목 편집 폼 */}
          {editingSections?.enTitle && (
            <div className="relative outline outline-2 outline-primary rounded-lg">
              {renderInlineEditForm('enTitle')}
            </div>
          )}

          {/* Etc 제목 편집 폼 */}
          {editingSections?.etcTitle && (
            <div className="relative outline outline-2 outline-primary rounded-lg">
              {renderInlineEditForm('etcTitle')}
            </div>
          )}

          <div className='flex justify-start gap-1 text-[13px] my-2'>
            <span className='text-main flex flex-wrap gap-1'>
              {term.metadata?.authors && term.metadata.authors.length > 0 ? (
                term.metadata.authors.map((author, index) => (
                  <span key={author}>
                    <span className="text-primary">{authorNames[author] || author}</span>
                    {index < (term.metadata?.authors?.length ?? 0) - 1 && ', '}
                  </span>
                ))
              ) : (
                '작가 확인 안됨'
              )}
            </span>
            <span className="text-light">{'•'}</span>
            <div className='flex gap-1 items-center'>
              <span>{formatDate(term.metadata?.created_at ?? '')}{' 발행'}</span>
              <span className="text-light">{'•'}</span>
              <span>{formatDate(term.metadata?.updated_at ?? '')}{' 수정'}</span>
            </div>
          </div>

          <div className={`flex flex-col ${ isPreview ? '' : 'gap-2' }`}>
            {/* 짧은 설명 */}
            <div className="relative">
              <div
                className={getSectionClassName('shortDesc', 'flex flex-col gap-2 group p-1 rounded cursor-pointer')}
                id="shortDesc-section"
              >
                <div className='flex items-center gap-2' onClick={(e: React.MouseEvent) => handleSectionClick('shortDesc', e)}>
                  <Level level={0} />
                  <div className='text-main'>
                    {term.description?.short || '포스트의 요약을 작성하세요.'}
                  </div>
                </div>
                {editingSections?.shortDesc && renderInlineEditForm('shortDesc')}
              </div>
            </div>

            {/* 난이도 */}
            <div
              className={getSectionClassName('difficulty', 'flex flex-col gap-2 group p-1 rounded cursor-pointer')}
              id="difficulty-section"
            >
              <div className='flex items-center gap-2' onClick={(e: React.MouseEvent) => handleSectionClick('difficulty', e)}>
                <Level level={Number(term.difficulty?.level)} />
                <div className='my-0.5 text-main'>
                  {term.difficulty?.description || '난이도에 대한 설명을 작성하세요.'}
                </div>
              </div>
              {editingSections?.difficulty && renderInlineEditForm('difficulty')}
            </div>
          </div>

          <div className="relative">
            <div className={`mt-6 flex flex-col gap-16 ${ isPreview ? 'gap-16' : 'gap-8' }`}>
              {/* 개념 설명 섹션 */}
              <div id="description-section" className="relative">
                <div
                  className={getSectionClassName('description', 'flex flex-col p-1 my-3 prose-section rounded')}
                >
                  <div className="cursor-pointer" onClick={(e: React.MouseEvent) => handleSectionClick('description', e)}>
                    <DescriptionSection
                      description={term.description?.full || ''}
                    />
                  </div>
                  {editingSections?.description && renderInlineEditForm('description')}
                </div>
              </div>

              {/* 관련 용어 섹션 */}
              <div id="terms-section" className="relative">
                <div
                  className={getSectionClassName('terms', 'flex flex-col p-1 my-3 prose-section rounded gap-2')}
                >
                  <div className="cursor-pointer" onClick={(e: React.MouseEvent) => handleSectionClick('terms', e)}>
                    <RelatedTermsSection
                      terms={term.terms?.length === 0 ? [{ term: '용어없음', description: '포스트와 관련된 용어를 작성하세요.', internal_link: '' }] : term.terms || []}
                    />
                  </div>
                  {editingSections?.terms && renderInlineEditForm('terms')}
                </div>
              </div>

              {/* 태그 섹션 (모바일) */}
              <div id="tags-section" className="relative md:hidden">
                <div
                  className={getSectionClassName('tags', 'flex flex-col p-1 my-3 prose-section rounded')}
                >
                  <div className="cursor-pointer" onClick={(e: React.MouseEvent) => handleSectionClick('tags', e)}>
                    <div className="flex items-center group-hover:text-primary transition-colors">
                      <h2>
                        <span className="text-primary sm:ml-[-20px] mr-2.5 sm:opacity-0 group-hover:opacity-100 transition-opacity">{'#'}</span>
                        {'관련 포스트'}
                      </h2>
                    </div>
                    {hasData.tags ? (
                      <div>
                        {Array.isArray(term.tags) && term.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {term.tags.map((tag, index) => (
                              <span key={index} className="px-2 py-1 bg-gray5 text-main rounded-lg text-sm">
                                {tag.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="relative group/tags inline-block">
                        <p className="text-sub">{'관련 포스트를 추가하세요.'}</p>
                      </div>
                    )}
                  </div>
                  <div className="md:hidden">
                    {renderInlineEditForm('tags')}
                  </div>
                </div>
              </div>

              {/* 직무 연관도 섹션 */}
              <div id="relevance-section" className="relative">
                <div
                  className={getSectionClassName('relevance', 'flex flex-col p-1 my-3 bg-cover bg-center prose-section rounded gap-2')}
                >
                  <div className="cursor-pointer" onClick={(e: React.MouseEvent) => handleSectionClick('relevance', e)}>
                    <RelevanceSection
                      analyst={{
                        score: term.relevance?.analyst?.score ?? 1,
                        description: term.relevance?.analyst?.description || '데이터 분석가와 관련된 내용을 작성하세요.',
                      }}
                      engineer={{
                        score: term.relevance?.engineer?.score ?? 1,
                        description: term.relevance?.engineer?.description || '데이터 엔지니어와 관련된 내용을 작성하세요.',
                      }}
                      scientist={{
                        score: term.relevance?.scientist?.score ?? 1,
                        description: term.relevance?.scientist?.description || '데이터 과학자와 관련된 내용을 작성하세요.',
                      }}
                    />
                  </div>
                  {editingSections?.relevance && renderInlineEditForm('relevance')}
                </div>
              </div>

              {/* 사용 사례 섹션 */}
              <div id="usecase-section" className="relative">
                <div
                  className={getSectionClassName('usecase', 'flex flex-col p-1 my-3 prose-section rounded gap-2')}
                >
                  <div className="cursor-pointer" onClick={(e: React.MouseEvent) => handleSectionClick('usecase', e)}>
                    <UsecaseSection
                      usecase={{
                        industries: term.usecase?.industries || [],
                        example: term.usecase?.example || '구체적인 사용 사례를 작성하세요.',
                        description: term.usecase?.description || '사용 사례에 대한 개요를 작성하세요.',
                      }}
                    />
                  </div>
                  {editingSections?.usecase && renderInlineEditForm('usecase')}
                </div>
              </div>

              {/* 참고자료 섹션 */}
              <div id="references-section" className="relative mb-16">
                <div
                  className={getSectionClassName('references', 'flex flex-col p-1 my-3 prose-section rounded gap-2')}
                >
                  <div className="cursor-pointer" onClick={(e: React.MouseEvent) => handleSectionClick('references', e)}>
                    {!hasData.references && (
                      <div className="flex items-center group-hover:text-primary transition-colors">
                        <h2>
                          <span className="text-primary sm:ml-[-20px] mr-2.5 sm:opacity-0 group-hover:opacity-100 transition-opacity">{'#'}</span>
                          {'참고 자료'}
                        </h2>
                      </div>
                    )}
                    {hasData.references ? (
                      <ReferencesSection
                        references={term.references || { tutorials: [], books: [], academic: [], opensource: [] }}
                      />
                    ) : (
                      <div className="relative group/references inline-block">
                        <p className="text-sub">
                          {'참고 자료를 1개 이상 작성하세요.'}
                        </p>
                      </div>
                    )}
                  </div>
                  {editingSections?.references && renderInlineEditForm('references')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostPreview;