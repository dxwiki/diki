'use client';

import { TermData } from '@/types';
import { formatDate } from '@/utils/filters';
import DifficultyLevel from './DifficultyLevel';
import Level from '@/components/ui/Level';
interface PostHeaderProps {
  term: TermData
}

const PostHeader = ({ term }: PostHeaderProps) => {
  return (
    <div className='animate-intro sm:ml-5'>
      <div className='flex sm:justify-start mt-10 sm:mt-32'>
        <div className='flex flex-col justify-center items-center'>
          <h1 className="text-3xl font-bold mb-0">
            <span className='block sm:inline text-main'>{term.title?.ko}</span>
            {
              term.title?.en && (
                <span className='block sm:inline text-main break-all'>{'('}{term.title.en}{')'}</span>
              )
            }
          </h1>
        </div>
      </div>
      <div className='flex justify-start gap-1 text-xs my-1'>
        <span className='text-main'>{term.metadata?.authors ?? '작가 확인 안됨'}</span>
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
      <div className='flex items-start gap-1 my-1'>
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