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
  getSectionValidationErrors?: (section: string)=> string[];
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
  getSectionValidationErrors,
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
    if (validateSection && getSectionValidationErrors) {
      const errors = getSectionValidationErrors(section);
      if (errors.length > 0) {
        setSectionErrors({ ...sectionErrors, [section]: errors });
        return;
      }
    }

    // 에러가 없으면 섹션 닫기
    setSectionErrors({ ...sectionErrors, [section]: [] });
    if (onSectionClick) {
      onSectionClick(section);
    }
  };

  // 섹션별 에러 메시지 렌더링
  const renderSectionErrors = (section: string) => {
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

  // 편집 폼 렌더링 함수
  const renderEditForm = (section: keyof EditingSectionState) => {
    if (!editingSections || !formComponents) return null;
    if (!editingSections[section]) return null;

    switch (section) {
      case 'tags':
        return (
          <>
            {/* 모바일 뷰 (sm 미만): 일반 모달처럼 표시 */}
            <div
              className="modal-container sm:hidden absolute inset-x-0 bg-gray5 border border-gray4 animate-slideDown shadow-lg mt-2 rounded-lg z-20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-4 border-b border-gray4">
                <h3 className="text-lg font-semibold text-main">{'태그 편집'}</h3>
                <button
                  type="button"
                  onClick={() => handleCloseSection(section)}
                  className="p-1 hover:bg-gray4 rounded-lg transition-colors"
                >
                  <X className="size-5 text-gray1" />
                </button>
              </div>
              {renderSectionErrors(section)}
              {formComponents[section as keyof FormComponents]}
            </div>

            {/* 데스크톱 뷰 (sm 이상): 특별한 위치에 표시 */}
            <div
              className="modal-container hidden sm:block fixed md:absolute inset-x-0 md:left-[180px] md:top-[295px] top-[100px] md:inset-x-auto md:w-[500px] lg:w-[600px] bg-gray5 border border-gray4 animate-slideDown shadow-lg rounded-lg z-30"
              style={{ maxHeight: '80vh', overflowY: 'auto' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-4 border-b border-gray4">
                <h3 className="text-lg font-semibold text-main">{'태그 편집'}</h3>
                <button
                  type="button"
                  onClick={() => handleCloseSection(section)}
                  className="p-1 hover:bg-gray4 rounded-lg transition-colors"
                >
                  <X className="size-5 text-gray1" />
                </button>
              </div>
              {renderSectionErrors(section)}
              {formComponents[section as keyof FormComponents]}
            </div>
          </>
        );

      default:
        // 섹션별 제목 설정
        const sectionTitles: { [key: string]: string } = {
          basicInfo: '기본 정보',
          difficulty: '난이도',
          description: '개념 설명',
          terms: '관련 용어',
          relevance: '직무 연관도',
          usecase: '사용 사례',
          references: '참고자료',
          koTitle: '한글 제목',
          enTitle: '영문 제목',
          shortDesc: '짧은 설명',
        };

        return (
          <div
            className="modal-container absolute inset-x-0 bg-gray5 border border-gray4 animate-slideDown shadow-lg mt-2 rounded-lg z-20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b border-gray4">
              <h3 className="text-lg font-semibold text-main">{sectionTitles[section] || '편집'}</h3>
              <button
                type="button"
                onClick={() => handleCloseSection(section)}
                className="p-1 hover:bg-gray4 rounded-lg transition-colors"
              >
                <X className="size-5 text-gray1" />
              </button>
            </div>
            {renderSectionErrors(section)}
            {formComponents[section as keyof FormComponents]}
          </div>
        );
    }
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
      return `${ baseClass } outline outline-2 outline-dashed outline-primary`;
    } else if (hasError) {
      return `${ baseClass } outline outline-2 outline-dashed outline-level-5`;
    } else {
      return `${ baseClass } hover:outline hover:outline-2 hover:outline-dashed hover:outline-primary`;
    }
  };

  return (
    <div className="prose h-[68vh] sm:h-[calc(100vh-230px)] overflow-y-auto overflow-x-hidden block md:grid md:grid-cols-[minmax(0,176px)_5fr] bg-background rounded-lg p-2 sm:p-4 border border-gray4" ref={postPreviewRef}>
      <TableOfContents
        title={term.title?.ko === '' ? '한글 제목' : term.title?.ko ?? ''}
        term={term}
        slug=""
        onTagSectionClick={(e) => handleSectionClick('tags', e)}
        tagsClassName={getSectionClassName('tags')}
      />
      <div className='text-justify relative' ref={contentRef}>
        <div className='sm:ml-5'>
          <div
            className="flex group cursor-pointer"
            id="koTitle-section"
            onClick={(e: React.MouseEvent) => handleSectionClick('koTitle', e)}
          >
            <span className="flex flex-wrap items-center text-3xl font-bold mb-0 group-hover:text-primary transition-colors">
              <span
                className={getSectionClassName('koTitle', 'text-main relative p-1 -m-1 rounded')}
              >
                {term.title?.ko === '' ? '한글 제목' : term.title?.ko}
              </span>
              <span
                className={getSectionClassName('enTitle', 'text-main break-all relative p-1 -m-1 rounded')}
                id="enTitle-section"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  handleSectionClick('enTitle', e);
                }}
              >
                {'('}{term.title?.en === '' ? '영문 제목' : term.title?.en}{')'}
              </span>
              <span className='inline-flex items-center' />
            </span>
          </div>
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
          <div
            className={getSectionClassName('shortDesc', 'flex items-center gap-2 my-1 group p-1 -m-1 rounded cursor-pointer')}
            id="shortDesc-section"
            onClick={(e: React.MouseEvent) => handleSectionClick('shortDesc', e)}
          >
            <Level level={0} />
            <div className='my-0.5 text-main'>
              {term.description?.short || '짧은 설명 없음'}
            </div>
          </div>
          <div
            className={getSectionClassName('difficulty', 'flex items-center gap-2 my-1 group p-1 -m-1 rounded cursor-pointer')}
            id="difficulty-section"
            onClick={(e: React.MouseEvent) => handleSectionClick('difficulty', e)}
          >
            <Level level={Number(term.difficulty?.level)} />
            <div className='my-0.5 text-main'>
              {term.difficulty?.description || '난이도 설명 없음'}
            </div>
          </div>

          {/* 한글 제목 편집 폼 */}
          {editingSections?.koTitle && (
            <div
              className="modal-container absolute inset-x-0 bg-gray5 border border-gray4 animate-slideDown shadow-lg mt-2 rounded-lg z-20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-4 border-b border-gray4">
                <h3 className="text-lg font-semibold text-main">{'한글 제목'}</h3>
                <button
                  type="button"
                  onClick={() => handleCloseSection('koTitle')}
                  className="p-1 hover:bg-gray4 rounded-lg transition-colors"
                >
                  <X className="size-5 text-gray1" />
                </button>
              </div>
              {renderSectionErrors('koTitle')}
              {renderKoreanTitleForm ? renderKoreanTitleForm()
                : (formComponents?.basicInfo && React.cloneElement(formComponents.basicInfo as React.ReactElement, { isModal: true }))}
            </div>
          )}

          {/* 영문 제목 편집 폼 */}
          {editingSections?.enTitle && (
            <div
              className="modal-container absolute inset-x-0 bg-gray5 border border-gray4 animate-slideDown shadow-lg mt-2 rounded-lg z-20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-4 border-b border-gray4">
                <h3 className="text-lg font-semibold text-main">{'영문 제목'}</h3>
                <button
                  type="button"
                  onClick={() => handleCloseSection('enTitle')}
                  className="p-1 hover:bg-gray4 rounded-lg transition-colors"
                >
                  <X className="size-5 text-gray1" />
                </button>
              </div>
              {renderSectionErrors('enTitle')}
              {renderEnglishTitleForm ? renderEnglishTitleForm()
                : (formComponents?.basicInfo && React.cloneElement(formComponents.basicInfo as React.ReactElement, { isModal: true }))}
            </div>
          )}

          {/* 짧은 설명 편집 폼 */}
          {editingSections?.shortDesc && (
            <div
              className="modal-container absolute inset-x-0 bg-gray5 border border-gray4 animate-slideDown shadow-lg mt-2 rounded-lg z-20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-4 border-b border-gray4">
                <h3 className="text-lg font-semibold text-main">{'짧은 설명'}</h3>
                <button
                  type="button"
                  onClick={() => handleCloseSection('shortDesc')}
                  className="p-1 hover:bg-gray4 rounded-lg transition-colors"
                >
                  <X className="size-5 text-gray1" />
                </button>
              </div>
              {renderSectionErrors('shortDesc')}
              {renderShortDescriptionForm ? renderShortDescriptionForm()
                : (formComponents?.basicInfo && React.cloneElement(formComponents.basicInfo as React.ReactElement, { isModal: true }))}
            </div>
          )}

          {/* 난이도 편집 폼 */}
          {editingSections?.difficulty && (
            <div
              className="modal-container absolute inset-x-0 bg-gray5 border border-gray4 animate-slideDown shadow-lg mt-2 rounded-lg z-20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-4 border-b border-gray4">
                <h3 className="text-lg font-semibold text-main">{'난이도'}</h3>
                <button
                  type="button"
                  onClick={() => handleCloseSection('difficulty')}
                  className="p-1 hover:bg-gray4 rounded-lg transition-colors"
                >
                  <X className="size-5 text-gray1" />
                </button>
              </div>
              {renderSectionErrors('difficulty')}
              {formComponents?.difficulty && React.cloneElement(formComponents.difficulty as React.ReactElement, { isModal: true })}
            </div>
          )}

          {/* 기본 정보 및 난이도 편집 폼 */}
          {renderEditForm('basicInfo')}
        </div>

        <div className="mt-6 sm:ml-5">
          {/* 개념 설명 섹션 */}
          <div
            className={getSectionClassName('description', 'p-1 my-3 relative cursor-pointer prose-section rounded')}
            id="description-section"
            onClick={(e: React.MouseEvent) => handleSectionClick('description', e)}
          >
            <DescriptionSection
              description={term.description?.full || ''}
            />
            {renderEditForm('description')}
          </div>

          {/* 관련 용어 섹션 */}
          <div
            className={getSectionClassName('terms', 'p-1 my-3 relative cursor-pointer prose-section rounded')}
            id="terms-section"
            onClick={(e: React.MouseEvent) => handleSectionClick('terms', e)}
          >
            <RelatedTermsSection
              terms={term.terms?.length === 0 ? [{ term: '용어없음', description: '용어를 추가해주세요.', internal_link: '' }] : term.terms || []}
            />
            {renderEditForm('terms')}
          </div>

          {/* 태그 섹션 */}
          <div
            className={getSectionClassName('tags', 'sm:hidden p-1 my-3 relative cursor-pointer prose-section rounded')}
            id="tags-section"
            onClick={(e: React.MouseEvent) => handleSectionClick('tags', e)}
          >
            <div className="flex items-center group-hover:text-primary transition-colors">
              <h2>
                <span className="text-primary sm:ml-[-20px] mr-2.5 sm:opacity-0 group-hover:opacity-100 transition-opacity">{'#'}</span>
                {'관련 포스트'}
              </h2>
            </div>
            {hasData.terms ? (
              <div>
                {Array.isArray(term.tags) && term.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {term.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-gray5 text-main rounded-lg text-sm">
                        {tag.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="relative group/tags inline-block">
                    <p className="text-sub italic">
                      {'내용이 없습니다.'}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative group/tags inline-block">
                <p className="text-sub italic">
                  {'내용이 없습니다.'}
                </p>
              </div>
            )}
            {renderEditForm('tags')}
          </div>

          {/* 직무 연관도 섹션 */}
          <div
            className={getSectionClassName('relevance', 'p-1 my-3 relative bg-cover bg-center size-full cursor-pointer prose-section rounded')}
            id="relevance-section"
            onClick={(e: React.MouseEvent) => handleSectionClick('relevance', e)}
          >
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
            {renderEditForm('relevance')}
          </div>

          {/* 사용 사례 섹션 */}
          <div
            className={getSectionClassName('usecase', 'p-1 my-3 relative cursor-pointer prose-section rounded')}
            id="usecase-section"
            onClick={(e: React.MouseEvent) => handleSectionClick('usecase', e)}
          >
            <UsecaseSection
              usecase={{
                industries: term.usecase?.industries || [],
                example: term.usecase?.example || '클릭하여 내용을 입력하세요.',
                description: term.usecase?.description || '클릭하여 내용을 입력하세요.',
              }}
            />
            {renderEditForm('usecase')}
          </div>

          {/* 참고자료 섹션 */}
          <section
            className={getSectionClassName('references', 'p-1 my-3 relative cursor-pointer prose-section rounded')}
            id="references-section"
            onClick={(e: React.MouseEvent) => handleSectionClick('references', e)}
          >
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
                <p className="text-sub italic">
                  {'내용이 없습니다.'}
                </p>
              </div>
            )}
            {renderEditForm('references')}
          </section>
        </div>
      </div>

      {/* 태그 편집 모달을 최상위 레벨에 렌더링 */}
      {renderEditForm('tags')}
    </div>
  );
};

export default PostPreview;