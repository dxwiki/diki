'use client';

import { TermData } from '@/types/database';
import DescriptionSection from '../posts/sections/DescriptionSection';
import RelevanceSection from '../posts/sections/RelevanceSection';
import RelatedTermsSection from '../posts/sections/RelatedTermsSection';
import UsecaseSection from '../posts/sections/UsecaseSection';
import ReferencesSection from '../posts/sections/ReferencesSection';
import { Share2, Edit, Pencil } from 'lucide-react';
import TooltipButton from '@/components/ui/TooltipButton';
import Level from '@/components/ui/Level';
import { formatDate } from '@/utils/filters';
import React, { useEffect, useRef, ReactElement, useState } from 'react';
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
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);

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
  const handleSectionClick = (section: string, e?: React.MouseEvent) => {
    console.log('섹션 클릭됨:', section);
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
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
      onSectionClick(section); // 기존 동작 유지
    }
  };

  // 섹션 헤더 렌더링 함수
  const renderSectionHeader = (title: string, section: string) => (
    <h2
      className="flex items-center cursor-pointer group-hover:text-primary transition-colors"
      onClick={(e) => handleSectionClick(section, e)}
    >
      <span className="text-primary sm:ml-[-20px] mr-2.5 sm:opacity-0 group-hover:opacity-100 transition-opacity">{'#'}</span>
      {title}
      <Edit className="ml-2 size-4 opacity-0 group-hover:opacity-100 transition-opacity" />
    </h2>
  );

  // 편집 폼 렌더링 함수
  const renderEditForm = (section: keyof EditingSectionState) => {
    if (!editingSections || !formComponents) return null;

    return editingSections[section] ? (
      <div className="absolute inset-x-0 bg-background border border-gray4 animate-slideDown shadow-lg mt-2 rounded-lg z-20">
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
    <div className="prose block md:grid md:grid-cols-[minmax(0,176px)_5fr] bg-background rounded-lg p-2 sm:p-4">
      <TableOfContents
        title={term.title?.ko === '' ? '제목 없음' : term.title?.ko ?? ''}
        term={term}
        slug=""
      />
      <div className='md:grid md:grid-cols-[minmax(0,720px)_minmax(0,1fr)]'>
        <div className='text-justify' ref={contentRef}>
          <div className='sm:ml-5'>
            <div className="flex group cursor-pointer" id="koTitle-section">
              <span className="flex flex-wrap items-center text-3xl font-bold mb-0 group-hover:text-primary transition-colors">
                <span
                  className='text-main relative flex items-center'
                  onMouseEnter={() => setHoveredSection('koTitle')}
                  onMouseLeave={() => setHoveredSection(null)}
                >
                  {term.title?.ko === '' ? '제목 없음' : term.title?.ko}
                  <TooltipButton
                    tooltip="한글 제목 수정"
                    className={`text-gray1 hover:text-primary ml-1.5 ${ hoveredSection === 'koTitle' ? 'opacity-100' : 'opacity-0' }`}
                    onClick={() => handleSectionClick('koTitle')}
                  >
                    <Pencil className='size-4' />
                  </TooltipButton>
                </span>
                <span
                  className='text-main break-all flex items-center'
                  onMouseEnter={() => setHoveredSection('enTitle')}
                  onMouseLeave={() => setHoveredSection(null)}
                  id="enTitle-section"
                >
                  {'('}{term.title?.en === '' ? '영문 제목 없음' : term.title?.en}{')'}
                  <TooltipButton
                    tooltip="영문 제목 수정"
                    className={`text-gray1 hover:text-primary ml-1.5 ${ hoveredSection === 'enTitle' ? 'opacity-100' : 'opacity-0' }`}
                    onClick={() => handleSectionClick('enTitle')}
                  >
                    <Pencil className='size-4' />
                  </TooltipButton>
                  <div className='relative top-[2px] inline-block'>
                    <TooltipButton
                      tooltip="공유하기"
                      className='text-gray1 hover:text-primary ml-1.5'
                    >
                      <Share2 className='size-6' />
                    </TooltipButton>
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
              onMouseEnter={() => setHoveredSection('shortDesc')}
              onMouseLeave={() => setHoveredSection(null)}
              id="shortDesc-section"
            >
              <Level level={0} />
              <div className='my-0.5 flex items-center'>
                {term.description?.short || '짧은 설명 없음'}
                <TooltipButton
                  tooltip="짧은 설명 수정"
                  className={`text-gray1 hover:text-primary ml-1.5 ${ hoveredSection === 'shortDesc' ? 'opacity-100' : 'opacity-0' }`}
                  onClick={() => handleSectionClick('shortDesc')}
                >
                  <Pencil className='size-4' />
                </TooltipButton>
              </div>
            </div>
            <div
              className='flex items-center gap-2 my-1 group'
              onMouseEnter={() => setHoveredSection('difficulty')}
              onMouseLeave={() => setHoveredSection(null)}
              id="difficulty-section"
            >
              <Level level={Number(term.difficulty?.level)} />
              <div className='my-0.5 flex items-center'>
                {term.difficulty?.description || '난이도 설명 없음'}
                <TooltipButton
                  tooltip="난이도 수정"
                  className={`text-gray1 hover:text-primary ml-1.5 ${ hoveredSection === 'difficulty' ? 'opacity-100' : 'opacity-0' }`}
                  onClick={() => handleSectionClick('difficulty')}
                >
                  <Pencil className='size-4' />
                </TooltipButton>
              </div>
            </div>

            {/* 한글 제목 편집 폼 */}
            {editingSections?.koTitle && (
              <div className="absolute inset-x-0 bg-background border border-gray4 animate-slideDown shadow-lg mt-2 rounded-lg z-20">
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
              <div className="absolute inset-x-0 bg-background border border-gray4 animate-slideDown shadow-lg mt-2 rounded-lg z-20">
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
              <div className="absolute inset-x-0 bg-background border border-gray4 animate-slideDown shadow-lg mt-2 rounded-lg z-20">
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
              <div className="absolute inset-x-0 bg-background border border-gray4 animate-slideDown shadow-lg mt-2 rounded-lg z-20">
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
            <section className='group group-section mt-10' id="description-section">
              {renderSectionHeader('개념', 'description')}
              {hasData.description ? (
                <DescriptionSection description={term.description?.full || ''} />
              ) : (
                <p className="text-sub italic cursor-pointer" onClick={(e) => handleSectionClick('description', e)}>
                  {'내용이 없습니다. 클릭하여 내용을 추가해주세요.'}
                </p>
              )}
              {renderEditForm('description')}
            </section>

            {/* 관련 용어 섹션 */}
            <section className="group group-section" id="terms-section">
              {renderSectionHeader('관련 용어', 'terms')}
              {hasData.terms ? (
                <RelatedTermsSection terms={term.terms || []} />
              ) : (
                <p className="text-sub italic cursor-pointer" onClick={(e) => handleSectionClick('terms', e)}>
                  {'내용이 없습니다. 클릭하여 내용을 추가해주세요.'}
                </p>
              )}
              {renderEditForm('terms')}
            </section>

            {/* 태그 섹션 */}
            <section className="group group-section" id="tags-section">
              {renderSectionHeader('태그', 'tags')}
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
                    <p className="text-sub italic cursor-pointer" onClick={(e) => handleSectionClick('tags', e)}>
                      {'내용이 없습니다. 클릭하여 내용을 추가해주세요.'}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sub italic cursor-pointer" onClick={(e) => handleSectionClick('tags', e)}>
                  {'내용이 없습니다. 클릭하여 내용을 추가해주세요.'}
                </p>
              )}
              {renderEditForm('tags')}
            </section>

            {/* 직무 연관도 섹션 */}
            <section className='group group-section relative bg-cover bg-center size-full' id="relevance-section">
              {renderSectionHeader('직무 연관도', 'relevance')}
              {hasData.relevance ? (
                <RelevanceSection
                  analyst={term.relevance?.analyst || { score: 0, description: '' }}
                  engineer={term.relevance?.engineer || { score: 0, description: '' }}
                  scientist={term.relevance?.scientist || { score: 0, description: '' }}
                />
              ) : (
                <p className="text-sub italic cursor-pointer" onClick={(e) => handleSectionClick('relevance', e)}>
                  {'내용이 없습니다. 클릭하여 내용을 추가해주세요.'}
                </p>
              )}
              {renderEditForm('relevance')}
            </section>

            {/* 사용 사례 섹션 */}
            <section className="group group-section" id="usecase-section">
              {renderSectionHeader('사용 사례', 'usecase')}
              {hasData.usecase ? (
                <UsecaseSection usecase={term.usecase || { industries: [], example: '', description: '' }} />
              ) : (
                <p className="text-sub italic cursor-pointer" onClick={(e) => handleSectionClick('usecase', e)}>
                  {'내용이 없습니다. 클릭하여 내용을 추가해주세요.'}
                </p>
              )}
              {renderEditForm('usecase')}
            </section>

            {/* 참고자료 섹션 */}
            <section className="group group-section" id="references-section">
              {renderSectionHeader('참고자료', 'references')}
              {hasData.references ? (
                <ReferencesSection references={term.references || { tutorials: [], books: [], academic: [], opensource: [] }} />
              ) : (
                <p className="text-sub italic cursor-pointer" onClick={(e) => handleSectionClick('references', e)}>
                  {'내용이 없습니다. 클릭하여 내용을 추가해주세요.'}
                </p>
              )}
              {renderEditForm('references')}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostPreview;