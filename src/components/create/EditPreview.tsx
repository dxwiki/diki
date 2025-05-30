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
import React, { useEffect, useRef, ReactElement, useState } from 'react';
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
  const handleSectionClick = (section: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (onSectionClick) {
      onSectionClick(section);
    }
  };

  // X 버튼 클릭 핸들러
  const handleCloseSection = (section: string) => {
    setSectionErrors({ ...sectionErrors, [section]: [] });
    if (onSectionClick) {
      onSectionClick(section);
    }
  };

  // 섹션별 에러 메시지 렌더링
  const renderSectionErrors = (section: string): React.ReactNode => {
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
  };

  // 섹션 hover 스타일 클래스 생성
  const getSectionClassName = (section: string, baseClass: string = '') => {
    const isEditing = editingSections && editingSections[section as keyof EditingSectionState];

    // 섹션별 필수 필드 검증 함수
    const isInvalid = (): boolean => {
      if (!validateSection) return false;

      switch (section) {
        case 'koTitle':
          return !term.title?.ko || term.title.ko.trim() === '';
        case 'enTitle':
          return !term.title?.en || term.title.en.trim() === '';
        case 'shortDesc':
          return !term.description?.short || term.description.short.trim() === '';
        case 'difficulty':
          return !term.difficulty?.description || term.difficulty.description.trim() === '';
        case 'description':
          return !term.description?.full || term.description.full.trim() === '';
        case 'relevance':
          return !term.relevance?.analyst?.description
            || !term.relevance.scientist?.description
            || !term.relevance.engineer?.description;
        case 'usecase':
          return !term.usecase?.description || !term.usecase.example;
        default:
          return false;
      }
    };

    // 필수 필드가 비어있으면 빨간색 테두리 적용 (폼 제출 시에만)
    const hasError = formSubmitted && isInvalid();

    if (isEditing) {
      // 한글/영문 제목은 모달 스타일 유지
      if (section === 'koTitle' || section === 'enTitle') {
        return `${ baseClass } outline outline-2 outline-primary rounded-lg`;
      }
      return `${ baseClass } outline outline-2 outline-primary`;
    } else if (hasError) {
      return `${ baseClass } outline outline-2 outline-dashed outline-level-5`;
    } else {
      return `${ baseClass } hover:outline hover:outline-2 hover:outline-dashed hover:outline-primary`;
    }
  };

  // 섹션 내부에 편집 폼 렌더링
  const renderInlineEditForm = (section: keyof EditingSectionState) => {
    if (!editingSections || !formComponents) return null;
    if (!editingSections[section]) return null;

    // 닫기 버튼
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
        {closeButton}
        {renderContent()}
        {renderSectionErrors(section)}
      </div>
    );
  };

  return (
    <div className="prose h-[68vh] sm:h-[calc(100vh-230px)] overflow-y-auto overflow-x-hidden block md:grid md:grid-cols-[minmax(0,176px)_5fr] bg-background rounded-lg p-2 sm:p-4 border border-gray4" ref={postPreviewRef}>
      <TableOfContents
        title={term.title?.ko === '' ? '한글 제목' : term.title?.ko ?? ''}
        term={term}
        slug=""
        onTagSectionClick={(e) => handleSectionClick('tags', e)}
        tagsClassName={getSectionClassName('tags', 'rounded-lg')}
        isEditMode={true}
      />
      <div className='text-justify relative' ref={contentRef}>
        <div className='sm:ml-5'>
          {/* 한글/영문 제목 섹션 */}
          <div
            className="flex group cursor-pointer"
          >
            <span className="flex flex-wrap items-center gap-2 text-3xl font-bold mb-0 transition-colors">
              <span
                id="koTitle-section"
                onClick={(e: React.MouseEvent) => handleSectionClick('koTitle', e)}
                className={getSectionClassName('koTitle', 'text-main hover:text-primary relative p-1 rounded')}
              >
                {term.title?.ko === '' ? '한글 제목' : term.title?.ko}
              </span>
              <span
                className={getSectionClassName('enTitle', 'text-main hover:text-primary break-all relative p-1 rounded')}
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

          {/* 짧은 설명 */}
          <div className="relative">
            <div
              className={getSectionClassName('shortDesc', 'flex flex-col gap-2 group p-1 rounded cursor-pointer')}
              id="shortDesc-section"
            >
              <div className='flex items-center gap-2' onClick={(e: React.MouseEvent) => handleSectionClick('shortDesc', e)}>
                <Level level={0} />
                <div className='my-0.5 text-main'>
                  {term.description?.short || '짧은 설명 없음'}
                </div>
              </div>
              {editingSections?.shortDesc && renderInlineEditForm('shortDesc')}
            </div>
          </div>

          {/* 난이도 */}
          <div className="relative">
            <div
              className={getSectionClassName('difficulty', 'flex flex-col gap-2 group p-1 rounded cursor-pointer')}
              id="difficulty-section"
            >
              <div className='flex items-center gap-2' onClick={(e: React.MouseEvent) => handleSectionClick('difficulty', e)}>
                <Level level={Number(term.difficulty?.level)} />
                <div className='my-0.5 text-main'>
                  {term.difficulty?.description || '난이도 설명 없음'}
                </div>
              </div>

              {editingSections?.difficulty && renderInlineEditForm('difficulty')}
            </div>
            <div className="mt-6 flex flex-col gap-16">
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
                      terms={term.terms?.length === 0 ? [{ term: '용어없음', description: '용어를 추가해주세요.', internal_link: '' }] : term.terms || []}
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
                        <p className="text-sub">{'관련 포스트를 추가해주세요.'}</p>
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
                        description: term.relevance?.analyst?.description || '데이터 분석가를 위한 설명을 입력하세요',
                      }}
                      engineer={{
                        score: term.relevance?.engineer?.score ?? 1,
                        description: term.relevance?.engineer?.description || '데이터 엔지니어를 위한 설명을 입력하세요',
                      }}
                      scientist={{
                        score: term.relevance?.scientist?.score ?? 1,
                        description: term.relevance?.scientist?.description || '데이터 과학자를 위한 설명을 입력하세요',
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
                        example: term.usecase?.example || '클릭하여 내용을 입력하세요.',
                        description: term.usecase?.description || '클릭하여 내용을 입력하세요.',
                      }}
                    />
                  </div>
                  {editingSections?.usecase && renderInlineEditForm('usecase')}
                </div>
              </div>

              {/* 참고자료 섹션 */}
              <div id="references-section" className="relative">
                <div
                  className={getSectionClassName('references', 'flex flex-col p-1 my-3 prose-section rounded')}
                >
                  <div className="cursor-pointer" onClick={(e: React.MouseEvent) => handleSectionClick('references', e)}>
                    {!hasData.references && (
                      <div className="flex items-center group-hover:text-primary transition-colors">
                        <h2>
                          <span className="text-primary sm:ml-[-20px] mr-2.5 sm:opacity-0 group-hover:opacity-100 transition-opacity">{'#'}</span>
                          {'참고자료'}
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
                          {'내용이 없습니다.'}
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

      {/* 데스크톱 태그 편집 (사이드바) */}
      {editingSections?.tags && (
        <div className="hidden md:block absolute left-[12px] top-[420px] w-3/5">
          <div className="outline outline-2 outline-primary rounded-lg bg-background">
            {renderInlineEditForm('tags')}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostPreview;