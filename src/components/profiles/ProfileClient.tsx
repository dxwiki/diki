'use client';

import { useState, useEffect, useRef } from 'react';
import ProfilePostCard from '@/components/profiles/ProfilePostCard';
import { TermData, Profile } from '@/types';
import Link from 'next/link';
import ContactButtonWrapper from './ContactButtonWrapper';

interface ProfileClientProps {
  initialTerms: TermData[];
  username: string;
  activeTab: 'all' | 'posts' | 'contributes';
  postsCount?: number;
  contributeCount?: number;
  profile: Profile;
}

const ProfileClient = ({
  initialTerms,
  username,
  activeTab,
  postsCount = 0,
  contributeCount = 0,
  profile,
}: ProfileClientProps) => {
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

  // 전체 글 수 계산 (중복 제거된 숫자)
  const allCount = postsCount + contributeCount
    // 중복 카운트 처리 - 실제 전체 숫자가 있을 때만 사용
    - (activeTab === 'all' ? (initialTerms.length < postsCount + contributeCount
      ? postsCount + contributeCount - initialTerms.length : 0) : 0);

  return (
    <>
      <div className='flex gap-4 items-center'>
        <h1 className="text-xl sm:text-2xl font-bold">
          {profile.name}
          <span className='text-sub text-xl'>
            {'('}{profile.username}{') 님의 프로필'}
          </span>
        </h1>
        <ContactButtonWrapper
          email={profile.email}
          github={profile.social.github}
          linkedin={profile.social.linkedin}
        />
      </div>

      <div className="flex space-x-2">
        <Link
          href={`/profiles/${ username }`}
          className={`text-base px-3 py-1.5 sm:px-4 sm:py-2 rounded-md font-medium ${ activeTab === 'all' ? 'bg-accent dark:bg-secondary text-white' : 'text-gray1 hover:bg-gray4 hover:text-sub' }`}
        >
          {'All'}
          {` (${ allCount })`}
        </Link>
        <Link
          href={`/profiles/${ username }/posts`}
          className={`text-base px-3 py-1.5 sm:px-4 sm:py-2 rounded-md font-medium ${ activeTab === 'posts' ? 'bg-accent dark:bg-secondary text-white' : 'text-gray1 hover:bg-gray4 hover:text-sub' }`}
        >
          {'Posts'}
          {` (${ postsCount })`}
        </Link>
        <Link
          href={`/profiles/${ username }/contributes`}
          className={`text-base px-3 py-1.5 sm:px-4 sm:py-2 rounded-md font-medium ${ activeTab === 'contributes' ? 'bg-accent dark:bg-secondary text-white' : 'text-gray1 hover:bg-gray4 hover:text-sub' }`}
        >
          {'Contributes'}
          {` (${ contributeCount })`}
        </Link>
      </div>

      {terms.length > 0 ? (
        <div className="min-h-[calc(100vh-268px)]">
          <ul className="w-full grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {visibleTerms.map((term) => (
              <li key={term.id}>
                <ProfilePostCard term={term} />
              </li>
            ))}
          </ul>
          {hasMore && (
            <div ref={loaderRef} className="flex justify-center p-4">
              <div className="size-8 border-y-2 border-primary rounded-full animate-spin" />
            </div>
          )}
        </div>
      ) : (
        <p className="text-gray1 min-h-[calc(100vh-268px)]">
          {activeTab === 'posts' ? '작성한 글이 없습니다.'
            : activeTab === 'contributes' ? '기여한 글이 없습니다.'
              : '작성하거나 기여한 글이 없습니다.'}
        </p>
      )}
    </>
  );
};

export default ProfileClient;