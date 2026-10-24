'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { TermData } from '@/types';
import PostCard from '@/components/posts/PostCard';
import Pagination from '@/components/common/Pagination';
import SortButtons from './SortButtons';
import AdContainer from '@/components/common/AdContainer';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { setCurrentPage, setSortType } from '@/store/pageSlice';
import { searchTerms } from '@/utils/search';
import { parseFilterQuery, filterTerms, sortTerms } from '@diki/core';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface PaginationProps {
  itemsPerPage: number;
  isModifyMode?: boolean;
}

const PostList = ({ itemsPerPage, isModifyMode = false }: PaginationProps) => {
  const { terms } = useSelector((state: RootState) => state.terms);
  const { sortType, sortDirection, currentPage } = useSelector((state: RootState) => state.page);
  const dispatch = useDispatch();
  const [termsData, setTermsData] = useState<TermData[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [localLoading, setLocalLoading] = useState(true);
  const searchParams = useSearchParams();
  const prevSearchParamsRef = useRef<string>('');
  const isFirstRenderRef = useRef(true);

  const getSearchParamsString = (params: URLSearchParams) => {
    const searchRelatedParams = {
      q: params.get('q') || '',
      f: params.get('f') || '',
      p: params.get('p') || '',
      m: params.get('m') || '',
    };
    return JSON.stringify(searchRelatedParams);
  };

  useEffect(() => {
    if (isFirstRenderRef.current) {
      prevSearchParamsRef.current = getSearchParamsString(searchParams);
      isFirstRenderRef.current = false;
    }
  }, [searchParams]);

  useEffect(() => {
    setIsClient(true);
    if (terms.length > 0) {
      setLocalLoading(false);
    }
  }, [terms.length]);

  // 검색 파라미터 변경 감지
  useEffect(() => {
    if (isFirstRenderRef.current) {
      return;
    }

    const currentSearchParams = getSearchParamsString(searchParams);

    if (currentSearchParams !== prevSearchParamsRef.current) {
      dispatch(setCurrentPage(1));
      prevSearchParamsRef.current = currentSearchParams;
    }
  }, [searchParams, dispatch]);

  useEffect(() => {
    if (!terms.length) return;

    setLocalLoading(true);
    let filteredTerms = terms;

    const query = searchParams.get('q');
    if (query) {
      filteredTerms = searchTerms(query, terms);
      dispatch(setSortType('relevance'));
    }

    filteredTerms = filterTerms(filteredTerms, parseFilterQuery({
      f: searchParams.get('f'),
      p: searchParams.get('p'),
      m: searchParams.get('m'),
    }));

    setTermsData(filteredTerms);
    setLocalLoading(false);
  }, [searchParams, terms, dispatch]);

  const sortedTermsData = sortTerms(termsData, sortType, sortDirection);

  const totalPages = Math.ceil(sortedTermsData.length / itemsPerPage);
  const pagesPerGroup = 5;

  const currentGroup = Math.ceil(currentPage / pagesPerGroup);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const TermsPerPage = sortedTermsData.slice(startIndex, endIndex);

  const startPage = ((currentGroup - 1) * pagesPerGroup) + 1;
  const endPage = Math.min(startPage + pagesPerGroup - 1, totalPages);
  const pageNumbers = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

  if(localLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <div className="w-full flex justify-between items-center mb-5">
        <p className='flex items-center gap-2 text-sub'>
          {isClient && (
            <>
              {'검색결과'}
              <span className='text-primary font-bold'>{sortedTermsData.length}</span>
              {'/ '}{terms.length}{' 개'}
            </>
          )}
        </p>
        <SortButtons />
      </div>
      <div className='sm:min-h-[804px] lg:min-h-[598px]'>
        {TermsPerPage.length > 0 ? (
          <ul className="grid sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {TermsPerPage.map((term: TermData) => (
              <li
                key={term.id}
                className="transition-transform duration-300 hover:-translate-y-2 sm:min-h-[186px]"
              >
                <PostCard sortType={sortType} term={term} isModifyMode={isModifyMode} />
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
        setCurrentPage={(page) => dispatch(setCurrentPage(page))}
      />
      <AdContainer
        slot="3276865601"
        format="auto"
        className="w-full min-h-[60px] sm:min-h-[160px]"
      />
    </>
  );
};

export default PostList;
