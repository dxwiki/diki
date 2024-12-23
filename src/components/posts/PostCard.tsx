'use client';

import Link from 'next/link';
import Stars from '@/components/ui/Stars';
import { TermData } from '@/types';
import { ChevronRight } from 'lucide-react';
import { getReadingTime } from '@/utils/metaData';
import { SortType } from '@/types';
import { formatDate } from '@/utils/filters';

interface PostCardProps {
  term: TermData;
  size?: 'flex' | 'sm';
  sortType?: SortType;
}

const PostCard = ({ term, size = 'flex', sortType }: PostCardProps) => {
  const sortTagStyle = 'px-2 py-1 sm:border sm:border-light sm:bg-extreme-light rounded-2xl text-gray1 text-xs';
  const getSortData = (type: SortType) => {
    switch (type) {
      case 'updated':
        return (
          <span className={sortTagStyle}>{formatDate(term.metadata?.updated_at || '')}</span>
        );
      case 'difficulty':
        return (
          <div className={sortTagStyle}>
            <Stars rating={term.difficulty?.level ?? 0} size={12} className='py-0.5' />
          </div>
        );
      case 'DA':
        return (
          <span className={sortTagStyle}>
            {'DA | L'}
            <span className='text-primary'>{term.relevance?.analyst?.score}</span>
          </span>
        );
      case 'DE':
        return (
          <span className={sortTagStyle}>
            {'DE | L'}
            <span className='text-primary'>{term.relevance?.engineer?.score}</span>
          </span>
        );
      case 'DS':
        return (
          <span className={sortTagStyle}>
            {'DS | L'}
            <span className='text-primary'>{term.relevance?.scientist?.score}</span>
          </span>
        );
      default:
        return <span className={sortTagStyle}>{formatDate(term.metadata?.updated_at || '')}</span>;
    }
  };

  if (size === 'sm') {
    return (
      <Link
        href={term.url ?? ''}
        className="group h-full flex flex-col gap-0 justify-between p-2.5 border border-background-secondary rounded-lg
        dark:hover:bg-background-secondary hover:no-underline duration-300 shadow-md hover:shadow-xl"
      >
        <div className="flex flex-col">
          <div className='flex justify-between items-center'>
            <span className="text-lg text-primary font-semibold">{term.title?.ko}</span>
            <ChevronRight className="size-5 text-light group-hover:text-sub" />
          </div>
          <span className="text-gray1 group-hover:text-sub text-sm line-clamp-1 mt-1 font-normal">{term.description?.short}</span>
        </div>
      </Link>
    );
  }
  return (
    <Link
      href={term.url ?? 'not-found'}
      className="group h-full flex flex-col gap-0 sm:gap-2.5 justify-between p-2.5 sm:p-4 border border-background-secondary rounded-lg
      dark:hover:bg-background-secondary hover:no-underline duration-300 shadow-md hover:shadow-xl"
    >
      <div className="flex flex-col">
        <div className='flex justify-between items-center'>
          <div className="flex items-center">
            <span className="text-lg sm:text-2xl text-primary font-semibold">{term.title?.ko}</span>
            <div className="block sm:hidden min-h-[28px]">
              {sortType ? getSortData(sortType) : <span className={sortTagStyle}>{formatDate(term.metadata?.updated_at || '')}</span>}
            </div>
          </div>
          <ChevronRight className="size-5 text-light group-hover:text-sub block sm:hidden" />
        </div>
        <span className="hidden sm:block text-main truncate">{term.title?.en}</span>
        <span className="text-gray1 group-hover:text-sub line-clamp-1 sm:line-clamp-3 sm:mt-2 text-sm sm:text-base">
          {term.description?.short}
        </span>
      </div>
      <div className="hidden sm:flex justify-end sm:justify-between items-center">
        {sortType ? getSortData(sortType) : <span className={sortTagStyle}>{formatDate(term.metadata?.updated_at || '')}</span>}
        <div className="flex gap-0 md:gap-1 items-center">
          <span
            className="text-sub text-sm sm:opacity-0 -translate-x-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0"
          >
            {getReadingTime(term)}
          </span>
          <ChevronRight className="size-5 text-light group-hover:text-sub" />
        </div>
      </div>
    </Link>
  );
};

export default PostCard;
