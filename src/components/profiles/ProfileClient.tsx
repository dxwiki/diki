'use client';

import { useState, useEffect, useRef } from 'react';
import ProfilePostCard from '@/components/profiles/ProfilePostCard';
import { TermData } from '@/types';

interface ProfileClientProps {
  initialTerms: TermData[];
}

const ProfileClient = ({ initialTerms }: ProfileClientProps) => {
  const [terms] = useState(initialTerms);
  const [visibleTerms, setVisibleTerms] = useState<TermData[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef<HTMLDivElement>(null);
  const termsPerPage = 24;

  useEffect(() => {
    // 초기 로딩 시 첫 페이지 표시
    setVisibleTerms(terms.slice(0, termsPerPage));
    setHasMore(terms.length > termsPerPage);
  }, [terms]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasMore) {
          loadMoreItems();
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = loaderRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, page]);

  const loadMoreItems = () => {
    const nextPage = page + 1;
    const startIndex = (nextPage - 1) * termsPerPage;
    const endIndex = nextPage * termsPerPage;

    if (startIndex < terms.length) {
      setVisibleTerms((prev) => [...prev, ...terms.slice(startIndex, endIndex)]);
      setPage(nextPage);
      setHasMore(endIndex < terms.length);
    } else {
      setHasMore(false);
    }
  };

  return (
    <>
      <ul className="w-full grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {visibleTerms.map((term) => (
          <li key={term.id}>
            <ProfilePostCard term={term} />
          </li>
        ))}
      </ul>
      {hasMore && (
        <div ref={loaderRef} className="flex justify-center p-4">
          <div className="size-8 border-y-2 border-gray1 rounded-full animate-spin" />
        </div>
      )}
    </>
  );
};

export default ProfileClient;