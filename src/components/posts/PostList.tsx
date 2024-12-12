'use client';

import { useState } from 'react';
import { TermData } from '@/types';
import PostCard from '@/components/posts/PostCard';
import Pagination from '@/components/common/Pagination';

interface PaginationProps {
  termsData: TermData[];
  totalPages: number;
  itemsPerPage: number;
}

const PostList = ({ termsData, itemsPerPage }: PaginationProps) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(termsData.length / itemsPerPage); // termsData의 갯수에 맞춰 totalPages 계산
  const pagesPerGroup = 5;

  const currentGroup = Math.ceil(currentPage / pagesPerGroup);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = termsData.slice(startIndex, endIndex);

  const startPage = ((currentGroup - 1) * pagesPerGroup) + 1;
  const endPage = Math.min(startPage + pagesPerGroup - 1, totalPages);
  const pageNumbers = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

  return (
    <>
      {paginatedData.length > 0 ? (
        <PostCard posts={paginatedData} />
      ) : (
        <p>{'검색결과가 없습니다.'}</p>
      )}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        pageNumbers={pageNumbers}
        setCurrentPage={setCurrentPage}
      />
    </>
  );
};

export default PostList;
