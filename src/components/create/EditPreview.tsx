'use client';

import { TermData } from '@/types/database';
import DescriptionSection from '../posts/sections/DescriptionSection';
import RelevanceSection from '../posts/sections/RelevanceSection';
import RelatedTermsSection from '../posts/sections/RelatedTermsSection';
import UsecaseSection from '../posts/sections/UsecaseSection';
import ReferencesSection from '../posts/sections/ReferencesSection';
import { X } from 'lucide-react';
import Level from '@/components/ui/Level';
import { formatDate } from '@/utils/filters';
import React, { useEffect, useRef, ReactElement, useState, useCallback } from 'react';
import TableOfContents from '@/components/common/TableOfContents';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

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

interface FormComponents {
  basicInfo: ReactElement;
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
  renderKoreanTitleForm?: ()=> React.ReactNode;
  renderEnglishTitleForm?: ()=> React.ReactNode;
  renderShortDescriptionForm?: ()=> React.ReactNode;
  validateSection?: (section: string)=> boolean;
  formSubmitted?: boolean;
  isPreview?: boolean;
}

const PostPreview = ({
  term,
  onSectionClick,
  editingSections,
  formComponents,
  renderKoreanTitleForm,
  renderEnglishTitleForm,
  renderShortDescriptionForm,
  validateSection,
  formSubmitted = false,
  isPreview = false,
}: PostPreviewProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const postPreviewRef = useRef<HTMLDivElement>(null);
  const profiles = useSelector((state: RootState) => state.profiles.profiles);
  const [authorNames, setAuthorNames] = useState<{ [key: string]: string }>({});
  const [sectionErrors, setSectionErrors] = useState<{ [key: string]: string[] }>({});

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
    console.log(term);
  }, [term]);

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
    setSectionErrors((prev) => ({ ...prev, [section]: [] }));
    if (onSectionClick) {
      onSectionClick(section);
    }
  }, [onSectionClick]);

  // 섹션별 에러 메시지 렌더링
  const renderSectionErrors = useCallback((section: string): React.ReactNode => {
    const errors = sectionErrors[section];
    if (!errors || errors.length === 0) return null;

    return (
      <div className="px-4 pb-2">
        {errors.map((error, index) => (
          <p key={index} className="text-level-5 text-sm mt-1">
            {error}
          </p>
        ))}
      </div>
    );
  }, [sectionErrors]);

  // 섹션 hover 스타일 클래스 생성
  const getSectionClassName = useCallback((section: string, baseClass: string = '') => {
    const isEditing = editingSections && editingSections[section as keyof EditingSectionState];

    // 미리보기 모드이면 모든 스타일 적용 안함
    if (isPreview) {
      return baseClass;
    }

    // 섹션의 상태 확인 (비어있음, 에러, 콘텐츠 있음)
    const getSectionStatus = (): 'empty' | 'error' | 'filled' => {
      // 폼 제출 시에만 에러 확인
      if (formSubmitted && validateSection) {
        switch (section) {
          case 'koTitle':
            if (!term.title?.ko || term.title.ko.trim() === '') return 'error';
            break;
          case 'enTitle':
            if (!term.title?.en || term.title.en.trim() === '') return 'error';
            break;
          case 'shortDesc':
            if (!term.description?.short || term.description.short.trim() === '') return 'error';
            break;
          case 'difficulty':
            if (!term.difficulty?.description || term.difficulty.description.trim() === '') return 'error';
            break;
          case 'description':
            if (!term.description?.full || term.description.full.trim() === '') return 'error';
            break;
          case 'relevance':
            if (!term.relevance?.analyst?.description
                || !term.relevance?.scientist?.description
                || !term.relevance?.engineer?.description) return 'error';
            break;
          case 'usecase':
            if (!term.usecase?.description || !term.usecase?.example) return 'error';
            break;
          case 'tags':
            if (!Array.isArray(term.tags) || term.tags.length === 0) return 'error';
            break;
          case 'terms':
            if (!Array.isArray(term.terms) || term.terms.length === 0) return 'error';
            break;
          case 'references':
            const hasTutorials = Array.isArray(term.references?.tutorials) && term.references.tutorials.length > 0;
            const hasBooks = Array.isArray(term.references?.books) && term.references.books.length > 0;
            const hasAcademic = Array.isArray(term.references?.academic) && term.references.academic.length > 0;
            const hasOpensource = Array.isArray(term.references?.opensource) && term.references.opensource.length > 0;

            if (!(hasTutorials || hasBooks || hasAcademic || hasOpensource)) return 'error';
            break;
        }
      }

      // 섹션에 내용이 있는지 확인
      switch (section) {
        case 'koTitle':
          return term.title?.ko && term.title.ko.trim() !== '' ? 'filled' : 'empty';
        case 'enTitle':
          return term.title?.en && term.title.en.trim() !== '' ? 'filled' : 'empty';
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

    // 상태에 따른 스타일 적용
    switch (status) {
      case 'error':
        return `${ baseClass } outline outline-1 outline-dashed outline-level-5 bg-gray5 hover:outline-primary hover:outline-2 hover:bg-background-secondary`;
      case 'empty':
        return `${ baseClass } outline outline-1 outline-dashed outline-gray3 bg-gray5 hover:outline-primary hover:outline-2 hover:bg-background-secondary`;
      case 'filled':
        return `${ baseClass } outline outline-1 outline-dashed outline-gray3 hover:outline-primary hover:outline-2 hover:bg-background-secondary`;
    }
  }, [editingSections, formSubmitted, isPreview, term, validateSection]);

  // 섹션 내부에 편집 폼 렌더링
  const renderInlineEditForm = useCallback((section: keyof EditingSectionState) => {
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

    // 특정 섹션에 대한 컨텐츠 렌더링
    const renderContent = () => {
      switch (section) {
        case 'koTitle':
          return renderKoreanTitleForm ? renderKoreanTitleForm()
            : (formComponents.basicInfo && React.cloneElement(formComponents.basicInfo as React.ReactElement, { isModal: true }));
        case 'enTitle':
          return renderEnglishTitleForm ? renderEnglishTitleForm()
            : (formComponents.basicInfo && React.cloneElement(formComponents.basicInfo as React.ReactElement, { isModal: true }));
        case 'shortDesc':
          return renderShortDescriptionForm ? renderShortDescriptionForm()
            : (formComponents.basicInfo && React.cloneElement(formComponents.basicInfo as React.ReactElement, { isModal: true }));
        default:
          return formComponents[section as keyof FormComponents];
      }
    };

    return (
      <div className={`m-1 p-1 mt-2 animate-slideDown ${ section === 'koTitle' || section === 'enTitle' ? '' : 'border-t border-primary border-dashed' } ${ section === 'tags' ? 'border-t border-primary border-dashed sm:border-t-0' : '' }`}>
        {renderContent()}
        {renderSectionErrors(section)}
        {closeButton}
      </div>
    );
  }, [editingSections, formComponents, handleCloseSection, renderKoreanTitleForm, renderEnglishTitleForm, renderShortDescriptionForm, renderSectionErrors]);

  return (
    <div className="prose h-[68vh] sm:h-[calc(100vh-280px)] overflow-y-auto overflow-x-hidden block md:grid md:grid-cols-[minmax(0,176px)_5fr] bg-background rounded-lg p-2 sm:p-4 border border-gray4" ref={postPreviewRef}>
      <div className="relative">
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
          <div className="hidden md:block absolute top-[336px] left-[196px] min-w-[54vw] z-20 shadow-lg">
            <div className="outline outline-2 outline-primary rounded-lg bg-background p-2">
              {renderInlineEditForm('tags')}
            </div>
          </div>
        )}
      </div>
      <div className='text-justify relative' ref={contentRef}>
        <div className='sm:ml-5'>
          {/* 한글/영문 제목 섹션 */}
          <div
            className="flex group cursor-pointer"
          >
            <span className={`flex flex-wrap items-center text-3xl font-bold mb-0 transition-colors ${ isPreview ? '' : ' gap-2' }`}>
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
                    {term.description?.short || '짧은 설명을 입력하세요.'}
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
                  {term.difficulty?.description || '난이도 설명을 입력하세요.'}
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
                  className={getSectionClassName('terms', 'flex flex-col p-1 my-3 prose-section rounded')}
                >
                  <div className="cursor-pointer" onClick={(e: React.MouseEvent) => handleSectionClick('terms', e)}>
                    <RelatedTermsSection
                      terms={term.terms?.length === 0 ? [{ term: '용어없음', description: '용어를 추가하세요.', internal_link: '' }] : term.terms || []}
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
                  className={getSectionClassName('relevance', 'flex flex-col p-1 my-3 bg-cover bg-center prose-section rounded')}
                >
                  <div className="cursor-pointer" onClick={(e: React.MouseEvent) => handleSectionClick('relevance', e)}>
                    <RelevanceSection
                      analyst={{
                        score: term.relevance?.analyst?.score ?? 1,
                        description: term.relevance?.analyst?.description || '데이터 분석가를 위한 설명을 입력하세요.',
                      }}
                      engineer={{
                        score: term.relevance?.engineer?.score ?? 1,
                        description: term.relevance?.engineer?.description || '데이터 엔지니어를 위한 설명을 입력하세요.',
                      }}
                      scientist={{
                        score: term.relevance?.scientist?.score ?? 1,
                        description: term.relevance?.scientist?.description || '데이터 과학자를 위한 설명을 입력하세요.',
                      }}
                    />
                  </div>
                  {editingSections?.relevance && renderInlineEditForm('relevance')}
                </div>
              </div>

              {/* 사용 사례 섹션 */}
              <div id="usecase-section" className="relative">
                <div
                  className={getSectionClassName('usecase', 'flex flex-col p-1 my-3 prose-section rounded')}
                >
                  <div className="cursor-pointer" onClick={(e: React.MouseEvent) => handleSectionClick('usecase', e)}>
                    <UsecaseSection
                      usecase={{
                        industries: term.usecase?.industries || [],
                        example: term.usecase?.example || '사용 사례를 입력하세요.',
                        description: term.usecase?.description || '사용 사례에 대한 개요를 입력하세요.',
                      }}
                    />
                  </div>
                  {editingSections?.usecase && renderInlineEditForm('usecase')}
                </div>
              </div>

              {/* 참고자료 섹션 */}
              <div id="references-section" className="relative mb-16">
                <div
                  className={getSectionClassName('references', 'flex flex-col p-1 my-3 prose-section rounded')}
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
                          {'참고 자료를 1개 이상 추가하세요.'}
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