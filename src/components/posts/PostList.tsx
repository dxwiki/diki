'use client';

import { useState } from 'react';
import { TermData } from '@/types';
import { SortType, SortDirection } from '@/types';
import PostCard from '@/components/posts/PostCard';
import Pagination from '@/components/common/Pagination';
import SortButtons from './SortButtons';
import AdContainer from '@/components/common/AdContainer';

interface PaginationProps {
  termsData: TermData[];
  totalPages: number;
  itemsPerPage: number;
}

const PostList = ({ termsData, itemsPerPage }: PaginationProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortType, setSortType] = useState<SortType>('created');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (type: SortType) => {
    let newDirection: SortDirection = 'desc';

    if (sortType === type) {
      newDirection = sortDirection === 'desc' ? 'asc' : 'desc';
    }

    setSortType(type);
    setSortDirection(newDirection);
    setCurrentPage(1);
  };

  const handleSortMobile = (type: SortType, direction: SortDirection) => {
    setSortType(type);
    setSortDirection(direction);
    setCurrentPage(1);
  };

  const sortedTermsData = [...termsData].sort((a, b) => {
    const multiplier = sortDirection === 'asc' ? 1 : -1;

    switch (sortType) {
      case 'difficulty': {
        const difficultyCompare = multiplier * ((a.difficulty?.level || 0) - (b.difficulty?.level || 0));
        return difficultyCompare === 0 ? multiplier * ((a.id || 0) - (b.id || 0)) : difficultyCompare;
      }
      case 'updated': {
        const dateCompare = multiplier * ((new Date(a.metadata?.updated_at || 0)).getTime()
                           - (new Date(b.metadata?.updated_at || 0)).getTime());
        return dateCompare === 0 ? multiplier * ((a.id || 0) - (b.id || 0)) : dateCompare;
      }
      case 'created': {
        const dateCompare = multiplier * ((new Date(a.metadata?.created_at || 0)).getTime()
                           - (new Date(b.metadata?.created_at || 0)).getTime());
        return dateCompare === 0 ? multiplier * ((a.id || 0) - (b.id || 0)) : dateCompare;
      }
      default:
        return 0;
    }
  });

  const totalPages = Math.ceil(sortedTermsData.length / itemsPerPage);
  const pagesPerGroup = 5;

  const currentGroup = Math.ceil(currentPage / pagesPerGroup);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const TermsPerPage = sortedTermsData.slice(startIndex, endIndex);

  const startPage = ((currentGroup - 1) * pagesPerGroup) + 1;
  const endPage = Math.min(startPage + pagesPerGroup - 1, totalPages);
  const pageNumbers = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

  return (
    <>
      <div className="w-full flex justify-between items-center mb-5">
        <h1 className='flex items-center gap-2 text-sub'>
          {'검색결과'}
          <span className='text-primary font-bold'>{sortedTermsData.length}</span>
          {'/ '}{sortedTermsData.length}{' 개'}
        </h1>
        <SortButtons
          sortType={sortType}
          sortDirection={sortDirection}
          onSortChange={handleSort}
          onSortMobile={handleSortMobile}
        />
      </div>
      <div className='sm:min-h-[804px] lg:min-h-[598px]'>
        {TermsPerPage.length > 0 ? (
          <ul className="grid sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {TermsPerPage.map((term: TermData) => (
              <li
                key={term.id}
                className="transition-transform duration-300 hover:-translate-y-2 sm:min-h-[186px]"
              >
                <PostCard sortType={sortType} term={term} />
              </li>
            ))}
          </ul>
        ) : (
          <p>{'검색결과가 없습니다.'}</p>
        )}
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        pageNumbers={pageNumbers}
        setCurrentPage={setCurrentPage}
      />
      <AdContainer
        slot="6636477998"
        format="auto"
        className="w-full min-h-[60px] sm:min-h-[160px]"
      />
    </>
  );
};

export default PostList;
