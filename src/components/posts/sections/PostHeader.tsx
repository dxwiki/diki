'use client';

import { useCallback, useEffect, useState } from 'react';
import { TermData } from '@/types';
import { formatDate, getAuthorSlug } from '@/utils/filters';
import DifficultyLevel from './DifficultyLevel';
import Level from '@/components/ui/Level';
import TooltipButton from '@/components/ui/TooltipButton';
import { Share2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
interface PostHeaderProps {
  term: TermData
  onShare: ()=> void;
}

const PostHeader = ({ term, onShare }: PostHeaderProps) => {
  const profiles = useSelector((state: RootState) => state.profiles.profiles);
  const [authorSlugs, setAuthorSlugs] = useState<{ [key: string]: string }>({});
  const [authorNames, setAuthorNames] = useState<{ [key: string]: string }>({});
  const [isDataReady, setIsDataReady] = useState(false);

  const handleShareClick = useCallback((): void => {
    onShare();
  }, [onShare]);

  useEffect(() => {
    if (profiles.length > 0 && term.metadata?.authors) {
      const slugs: { [key: string]: string } = {};
      const names: { [key: string]: string } = {};

      term.metadata.authors.forEach((author) => {
        const profile = profiles.find((p) => p.username === author);
        slugs[author] = getAuthorSlug(author);
        names[author] = profile?.name || author;
      });

      setAuthorSlugs(slugs);
      setAuthorNames(names);
      setIsDataReady(true);
    }
  }, [profiles, term.metadata?.authors]);

  if(!isDataReady) {
    return (
      <LoadingSpinner />
    );
  }

  return (
    <div className='animate-intro sm:ml-5'>
      <div className='mt-10 sm:mt-32'>
        <div className="flex">
          <span className="flex flex-wrap items-center font-bold">
            <h1 className='text-main text-3xl mb-0'>{term.title?.ko}</h1>
            {
              term.title?.en && (
                <h1 className='text-main text-3xl mb-0 break-all'>
                  {'('}{term.title.en}{')'}
                  <div className='relative top-[2px] inline-block'>
                    <TooltipButton
                      onClick={handleShareClick}
                      tooltip="공유하기"
                      className='text-gray1 hover:text-primary ml-1.5'
                    >
                      <Share2 className='size-6' />
                    </TooltipButton>
                  </div>
                </h1>
              )
            }
            <span className='inline-flex items-center' />
            {/* <TooltipButton
              onClick={handleShareClick}
              tooltip="공유하기"
              className='hidden md:block text-gray1 hover:text-primary ml-1.5'
            >
              <Share2 className='size-6' />
            </TooltipButton> */}
          </span>
        </div>
      </div>
      <div className='flex justify-start gap-1 text-[13px] my-2'>
        <span className='text-main flex flex-wrap gap-1'>
          {term.metadata?.authors && term.metadata.authors.length > 0 ? (
            term.metadata.authors.map((author, index) => (
              <span key={author}>
                <TooltipButton
                  tooltip={`${ authorNames[author] }님의 프로필 보기`}
                  isLink={true}
                  href={`/profiles/${ authorSlugs[author] || '' }`}
                  className="text-primary hover:text-accent hover:underline"
                >
                  {authorNames[author]}
                </TooltipButton>
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
      <div className='flex items-start gap-2 my-1'>
        <div>
          <Level level={0} />
        </div>
        <p className='my-0.5'>{term.description?.short}</p>
      </div>
      <DifficultyLevel
        level={term.difficulty?.level ?? 0}
        description={term.difficulty?.description ?? ''}
      />
    </div>
  );
};

export default PostHeader;