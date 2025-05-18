'use client';

import { TermData } from '@/types/database';
import DescriptionSection from '../posts/sections/DescriptionSection';
import RelevanceSection from '../posts/sections/RelevanceSection';
import RelatedTermsSection from '../posts/sections/RelatedTermsSection';
import UsecaseSection from '../posts/sections/UsecaseSection';
import ReferencesSection from '../posts/sections/ReferencesSection';
import { Share2, Pencil } from 'lucide-react';
import TooltipButton from '@/components/ui/TooltipButton';
import Level from '@/components/ui/Level';
import { formatDate } from '@/utils/filters';
import React, { useEffect, useRef, ReactElement } from 'react';
import TableOfContents from '@/components/common/TableOfContents';

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
  onSectionValidated?: (section: string, isValid: boolean)=> void;
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
  onSectionValidated,
}: PostPreviewProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const postPreviewRef = useRef<HTMLDivElement>(null);

  // 각 섹션별 데이터가 유효한지 체크하는 helper 함수
  const hasData = {
    basicInfo: term.title?.ko || term.title?.en,
    description: term.description?.full,
    terms: Array.isArray(term.terms) && term.terms.length > 0,
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

  // 섹션 클릭 핸들러
  const handleSectionClick = (section: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (onSectionClick) {
      onSectionClick(section);
    }
  };

  // 섹션 완료 핸들러
  const handleSectionComplete = (section: string) => {
    if (validateSection && onSectionValidated) {
      const isValid = validateSection(section);
      onSectionValidated(section, isValid);
    } else if (onSectionClick) {
      onSectionClick(section);
    }
  };

  // 편집 폼 렌더링 함수
  const renderEditForm = (section: keyof EditingSectionState) => {
    if (!editingSections || !formComponents) return null;

    return editingSections[section] ? (
      <div
        className="modal-container absolute inset-x-0 bg-gray5 border border-gray4 animate-slideDown shadow-lg mt-2 rounded-lg z-20"
        onClick={(e) => e.stopPropagation()}
      >
        {formComponents[section as keyof FormComponents]}
        <div className="flex justify-end p-4">
          <button
            type="button"
            onClick={() => handleSectionComplete(section)}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-accent transition-colors"
          >
            {'완료'}
          </button>
        </div>
      </div>
    ) : null;
  };

  return (
    <div className="prose h-[68vh] sm:h-[calc(100vh-230px)] overflow-y-auto overflow-x-hidden block md:grid md:grid-cols-[minmax(0,176px)_5fr] bg-background rounded-lg p-2 sm:p-4 border border-gray4" ref={postPreviewRef}>
      <TableOfContents
        title={term.title?.ko === '' ? '제목 없음' : term.title?.ko ?? ''}
        term={term}
        slug=""
      />
      <div className='text-justify relative' ref={contentRef}>
        <div className='sm:ml-5'>
          <div className="flex group cursor-pointer" id="koTitle-section">
            <span className="flex flex-wrap items-center text-3xl font-bold mb-0 group-hover:text-primary transition-colors">
              <span
                className='text-main relative group/title'
              >
                <span className="relative inline-block">
                  {term.title?.ko === '' ? '제목 없음' : term.title?.ko}
                  <span className="absolute inset-0 flex items-center justify-center bg-background/80 opacity-0 group-hover/title:opacity-100 transition-opacity">
                    <TooltipButton
                      tooltip="한글 제목 수정"
                      className="text-gray1 hover:text-primary"
                      onClick={(e: React.MouseEvent) => handleSectionClick('koTitle', e)}
                    >
                      <Pencil className='size-5' />
                    </TooltipButton>
                  </span>
                </span>
              </span>
              <span
                className='text-main break-all group/entitle relative'
                id="enTitle-section"
              >
                <span className="relative inline-block">
                  {'('}{term.title?.en === '' ? '영문 제목 없음' : term.title?.en}{')'}
                  <span className="absolute inset-0 flex items-center justify-center bg-background/80 opacity-0 group-hover/entitle:opacity-100 transition-opacity">
                    <TooltipButton
                      tooltip="영문 제목 수정"
                      className="text-gray1 hover:text-primary"
                      onClick={(e: React.MouseEvent) => handleSectionClick('enTitle', e)}
                    >
                      <Pencil className='size-5' />
                    </TooltipButton>
                  </span>
                </span>
                <div className='relative top-[2px] inline-block ml-1 text-gray1 hover:text-primary'>
                  <Share2 className='size-6' />
                </div>
              </span>
              <span className='inline-flex items-center' />
            </span>
          </div>
          <div className='flex justify-start gap-1 text-[13px] my-2'>
            <span className='text-main flex flex-wrap gap-1'>
              {term.metadata?.authors && term.metadata.authors.length > 0 ? (
                term.metadata.authors.map((author, index) => (
                  <span key={author}>
                    <span className="text-primary">{author}</span>
                    {index < (term.metadata?.authors?.length ?? 0) - 1 && ', '}
                  </span>
                ))
              ) : (
                '작가 확인 안됨'
              )}
            </span>
            <span className="text-light">{'•'}</span>
            <div className='flex gap-1 items-center'>
              {
                term.metadata?.created_at ? (
                  <span>{formatDate(term.metadata.created_at ?? '')}{' 발행'}</span>
                ) : (
                  <span>{'발행일 확인 안됨'}</span>
                )
              }
              {term.metadata?.updated_at && (
                <>
                  <span className="text-light">{'•'}</span>
                  <span>{formatDate(term.metadata.updated_at ?? '')}{' 수정'}</span>
                </>
              )}
            </div>
          </div>
          <div
            className='flex items-center gap-2 my-1 group'
            id="shortDesc-section"
          >
            <Level level={0} />
            <div className='my-0.5 relative group/shortdesc'>
              <span className="relative inline-block">
                {term.description?.short || '짧은 설명 없음'}
                <span className="absolute inset-0 flex items-center justify-center bg-background/80 opacity-0 group-hover/shortdesc:opacity-100 transition-opacity">
                  <TooltipButton
                    tooltip="짧은 설명 수정"
                    className="text-gray1 hover:text-primary"
                    onClick={(e: React.MouseEvent) => handleSectionClick('shortDesc', e)}
                  >
                    <Pencil className='size-5' />
                  </TooltipButton>
                </span>
              </span>
            </div>
          </div>
          <div
            className='flex items-center gap-2 my-1 group'
            id="difficulty-section"
          >
            <Level level={Number(term.difficulty?.level)} />
            <div className='my-0.5 relative group/difficulty'>
              <span className="relative inline-block">
                {term.difficulty?.description || '난이도 설명 없음'}
                <span className="absolute inset-0 flex items-center justify-center bg-background/80 opacity-0 group-hover/difficulty:opacity-100 transition-opacity">
                  <TooltipButton
                    tooltip="난이도 수정"
                    className="text-gray1 hover:text-primary"
                    onClick={(e: React.MouseEvent) => handleSectionClick('difficulty', e)}
                  >
                    <Pencil className='size-5' />
                  </TooltipButton>
                </span>
              </span>
            </div>
          </div>

          {/* 한글 제목 편집 폼 */}
          {editingSections?.koTitle && (
            <div
              className="modal-container absolute inset-x-0 bg-gray5 border border-gray4 animate-slideDown shadow-lg mt-2 rounded-lg z-20"
              onClick={(e) => e.stopPropagation()}
            >
              {renderKoreanTitleForm ? renderKoreanTitleForm()
                : (formComponents?.basicInfo && React.cloneElement(formComponents.basicInfo as React.ReactElement, { isModal: true }))}
              <div className="flex justify-end p-4">
                <button
                  type="button"
                  onClick={() => handleSectionComplete('koTitle')}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-accent transition-colors"
                >
                  {'완료'}
                </button>
              </div>
            </div>
          )}

          {/* 영문 제목 편집 폼 */}
          {editingSections?.enTitle && (
            <div
              className="modal-container absolute inset-x-0 bg-gray5 border border-gray4 animate-slideDown shadow-lg mt-2 rounded-lg z-20"
              onClick={(e) => e.stopPropagation()}
            >
              {renderEnglishTitleForm ? renderEnglishTitleForm()
                : (formComponents?.basicInfo && React.cloneElement(formComponents.basicInfo as React.ReactElement, { isModal: true }))}
              <div className="flex justify-end p-4">
                <button
                  type="button"
                  onClick={() => handleSectionComplete('enTitle')}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-accent transition-colors"
                >
                  {'완료'}
                </button>
              </div>
            </div>
          )}

          {/* 짧은 설명 편집 폼 */}
          {editingSections?.shortDesc && (
            <div
              className="modal-container absolute inset-x-0 bg-gray5 border border-gray4 animate-slideDown shadow-lg mt-2 rounded-lg z-20"
              onClick={(e) => e.stopPropagation()}
            >
              {renderShortDescriptionForm ? renderShortDescriptionForm()
                : (formComponents?.basicInfo && React.cloneElement(formComponents.basicInfo as React.ReactElement, { isModal: true }))}
              <div className="flex justify-end p-4">
                <button
                  type="button"
                  onClick={() => handleSectionComplete('shortDesc')}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-accent transition-colors"
                >
                  {'완료'}
                </button>
              </div>
            </div>
          )}

          {/* 난이도 편집 폼 */}
          {editingSections?.difficulty && (
            <div
              className="modal-container absolute inset-x-0 bg-gray5 border border-gray4 animate-slideDown shadow-lg mt-2 rounded-lg z-20"
              onClick={(e) => e.stopPropagation()}
            >
              {formComponents?.difficulty && React.cloneElement(formComponents.difficulty as React.ReactElement, { isModal: true })}
              <div className="flex justify-end p-4">
                <button
                  type="button"
                  onClick={() => handleSectionComplete('difficulty')}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-accent transition-colors"
                >
                  {'완료'}
                </button>
              </div>
            </div>
          )}

          {/* 기본 정보 및 난이도 편집 폼 */}
          {renderEditForm('basicInfo')}
        </div>

        <div className="space-y-6 mt-6 sm:ml-5">
          {/* 개념 설명 섹션 */}
          <div
            className="p-1 relative cursor-pointer"
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
            className="p-1 relative cursor-pointer"
            id="terms-section"
            onClick={(e: React.MouseEvent) => handleSectionClick('terms', e)}
          >
            <RelatedTermsSection
              terms={term.terms?.length === 0 ? [{ term: '용어없음', description: '용어를 추가해주세요.', internal_link: false }] : term.terms || []}
            />
            {renderEditForm('terms')}
          </div>

          {/* 태그 섹션 */}
          <div
            className="p-1 relative cursor-pointer"
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
            className='p-1 relative bg-cover bg-center size-full cursor-pointer'
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
          <section
            className="p-1 relative cursor-pointer"
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
          </section>

          {/* 참고자료 섹션 */}
          <div
            className="p-1 relative cursor-pointer"
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostPreview;