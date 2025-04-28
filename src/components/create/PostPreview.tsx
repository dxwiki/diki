'use client';

import { TermData } from '@/types/database';
import DescriptionSection from '../posts/sections/DescriptionSection';
import RelevanceSection from '../posts/sections/RelevanceSection';
import RelatedTermsSection from '../posts/sections/RelatedTermsSection';
import UsecaseSection from '../posts/sections/UsecaseSection';
import ReferencesSection from '../posts/sections/ReferencesSection';
import { Share2 } from 'lucide-react';
import TooltipButton from '@/components/ui/TooltipButton';
import Level from '@/components/ui/Level';
import { formatDate } from '@/utils/filters';
import { useEffect, useRef } from 'react';
import TableOfContents from '@/components/common/TableOfContents';

interface PostPreviewProps {
  term: TermData;
}

const PostPreview = ({ term }: PostPreviewProps) => {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log(term);
  }, [term]);

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
            <div className="flex">
              <span className="flex flex-wrap items-center text-3xl font-bold mb-0">
                <span className='text-main'>{term.title?.ko === '' ? '제목 없음' : term.title?.ko}</span>
                <span className='text-main break-all'>
                  {'('}{term.title?.en === '' ? '영문 제목 없음' : term.title?.en}{')'}
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
            <div className='flex items-center gap-2 my-1'>
              <Level level={0} />
              <p className='my-0.5'>{term.description?.short || '짧은 설명 없음'}</p>
            </div>
            <div className='flex items-center gap-2 my-1'>
              <Level level={Number(term.difficulty?.level)} />
              <p className='my-0.5'>{term.difficulty?.description || '난이도 설명 없음'}</p>
            </div>
          </div>

          <div className="space-y-6 mt-6 sm:ml-5">
            <DescriptionSection description={term.description?.full || ''} />
            <RelatedTermsSection terms={term.terms || []} />
            <RelevanceSection
              analyst={term.relevance?.analyst || { score: 0, description: '' }}
              engineer={term.relevance?.engineer || { score: 0, description: '' }}
              scientist={term.relevance?.scientist || { score: 0, description: '' }}
            />
            <UsecaseSection usecase={term.usecase || { industries: [], example: '', description: '' }} />
            <ReferencesSection references={term.references || { tutorials: [], books: [], academic: [], opensource: [] }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostPreview;