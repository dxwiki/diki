'use client';

import Link from 'next/link';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import ProfilePostCard from '@/components/profiles/ProfilePostCard';
import { TermData, Profile } from '@/types';
import ContactButtonWrapper from './ContactButtonWrapper';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import TooltipButton from '@/components/ui/TooltipButton';

interface ProfileClientProps {
  username: string;
  profile: Profile;
  isOwnProfile?: boolean;
  postsData: TermData[];
  contributesData: TermData[];
  allTermsData: TermData[];
}

const ProfileClient = ({
  username,
  profile,
  isOwnProfile = false,
  postsData,
  contributesData,
  allTermsData,
}: ProfileClientProps) => {
  const [activeTab, setActiveTab] = useState<'all' | 'posts' | 'contributes'>('all');
  const [terms, setTerms] = useState<TermData[]>([]);
  const [visibleTerms, setVisibleTerms] = useState<TermData[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef<HTMLDivElement>(null);
  const termsPerPage = 24;
  const [isCurrentUser, setIsCurrentUser] = useState(isOwnProfile);

  const { user } = useSelector((state: RootState) => state.auth);

  const sortByUpdatedAt = useCallback((data: TermData[]): TermData[] => {
    return [...data].sort((a, b) => {
      const dateA = a.metadata?.updated_at ? new Date(a.metadata.updated_at).getTime() : 0;
      const dateB = b.metadata?.updated_at ? new Date(b.metadata.updated_at).getTime() : 0;
      return dateB - dateA;
    });
  }, []);

  const sortedAllTermsData = useMemo(() => sortByUpdatedAt(allTermsData), [allTermsData, sortByUpdatedAt]);
  const sortedPostsData = useMemo(() => sortByUpdatedAt(postsData), [postsData, sortByUpdatedAt]);
  const sortedContributesData = useMemo(() => sortByUpdatedAt(contributesData), [contributesData, sortByUpdatedAt]);

  useEffect(() => {
    if (activeTab === 'all') {
      setTerms(sortedAllTermsData);
    } else if (activeTab === 'posts') {
      setTerms(sortedPostsData);
    } else {
      setTerms(sortedContributesData);
    }
  }, [activeTab, sortedAllTermsData, sortedPostsData, sortedContributesData]);

  useEffect(() => {
    // 초기 로딩 시 첫 페이지 표시
    setVisibleTerms(terms.slice(0, termsPerPage));
    setHasMore(terms.length > termsPerPage);
    setPage(1);
  }, [terms]);

  // 현재 로그인한 사용자와 프로필 소유자가 같은지 확인
  useEffect(() => {
    // 서버에서 전달받은 isOwnProfile 값이 있으면 사용
    if (isOwnProfile) {
      setIsCurrentUser(true);
      return;
    }

    // Redux 상태에서 사용자 정보 확인
    if (user && user.username === username) {
      setIsCurrentUser(true);
    }
  }, [username, isOwnProfile, user]);

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

  const handleTabChange = (tab: 'all' | 'posts' | 'contributes') => {
    setActiveTab(tab);
  };

  const postsCount = postsData.length;
  const contributeCount = contributesData.length;

  // 전체 글 수 계산 (중복 제거된 숫자)
  const allCount = allTermsData.length;

  // 프로필 아바타 컴포넌트
  const ProfileAvatar = ({ className = '' }: { className?: string }) => (
    <div
      className={`size-20 rounded-md ${ className }`}
      style={{
        backgroundImage: `url(${ profile.thumbnail })`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    />
  );

  // 프로필 이름 및 유저명 컴포넌트
  const ProfileName = () => (
    <h1 className="flex items-center text-xl sm:text-2xl font-bold">
      {profile.name}
      <span className='text-sub text-base sm:text-xl'>
        {'('}{profile.username}{') 님'}
      </span>
    </h1>
  );

  // 프로필 뱃지 컴포넌트 (rank, role)
  const ProfileBadges = () => (
    <div className='flex items-center gap-2'>
      {profile.rank !== undefined ? (
        <div className="flex flex-col">
          <TooltipButton
            tooltip={`포스트 ${ profile.rank.remainingForNextRank }개를 더 작성하면 Lv.${ profile.rank.current + 1 }로 승급합니다.`}
            className={`px-2 py-0.5 text-sm rounded-full text-white bg-level-${ profile.rank.current }`}
          >
            {'Lv.'}{profile.rank.current}
          </TooltipButton>
        </div>
      ) : (
        <div className="flex flex-col">
          <TooltipButton
            tooltip="포스트 1개를 작성하면 Lv.1로 승급합니다."
            className="px-2 py-0.5 text-sm rounded-full text-white bg-level-0"
          >
            {'Lv.0'}
          </TooltipButton>
        </div>
      )}
      {
        profile.role === 'owner' ? (
          <span className='px-2 py-0.5 text-sm rounded-full text-white bg-primary dark:bg-secondary'>
            {'Owner'}
          </span>
        ) : (
          <span className='px-2 py-0.5 text-sm rounded-full text-white bg-gray2'>
            {'Contributor'}
          </span>
        )
      }
    </div>
  );

  // 프로필 소개글 컴포넌트
  const ProfileIntro = () => (
    profile.intro && (
      <div className='text-gray0'>
        {profile.intro}
      </div>
    )
  );

  // 프로필 편집 버튼 컴포넌트
  const ProfileEditButton = () => (
    isCurrentUser && (
      <Link
        href={`/profiles/${ username }/edit`}
        className="text-sm w-[120px] text-center sm:w-auto px-3 py-1.5 rounded-md bg-primary dark:bg-secondary text-white hover:bg-accent dark:hover:bg-background-secondary"
      >
        {'프로필 편집'}
      </Link>
    )
  );

  // 프로필 액션 버튼 영역 (편집 + 연락처)
  const ProfileActions = () => (
    <div className='h-full shrink-0 sm:ml-3 flex justify-end items-start gap-3'>
      <ProfileEditButton />
      <ContactButtonWrapper
        email={profile.email}
        github={profile.social.github}
        linkedin={profile.social.linkedin}
      />
    </div>
  );

  return (
    <>
      <div className='flex flex-col gap-2'>
        <div className='flex flex-col sm:flex-row my-2 items-center justify-between gap-3 sm:gap-0 border-b border-gray4 pb-3'>
          <div className='flex flex-col sm:hidden items-center gap-1.5'>
            <ProfileAvatar />
            <ProfileName />
            <ProfileIntro />
            <div className={`flex items-center gap-1.5 ${ isCurrentUser ? 'flex-col gap-2' : 'justify-between' }`}>
              <ProfileBadges />
              <ProfileActions />
            </div>
          </div>

          <div className='hidden sm:flex items-center gap-2 justify-between w-full'>
            <div className='flex items-center gap-2'>
              <ProfileAvatar className="shrink-0" />
              <div className='flex flex-col gap-1'>
                <div className='flex flex-col sm:flex-row items-center gap-2'>
                  <ProfileName />
                  <ProfileBadges />
                </div>
                <ProfileIntro />
              </div>
            </div>
            <ProfileActions />
          </div>

        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => handleTabChange('all')}
            className={`text-sm sm:text-base px-3 py-1.5 sm:px-4 sm:py-2 rounded-md font-medium ${
              activeTab === 'all' ? 'bg-accent dark:bg-secondary text-white' : 'text-gray1 hover:bg-gray4 hover:text-sub'
            }`}
          >
            {'All'}
            {` (${ allCount })`}
          </button>
          <button
            onClick={() => handleTabChange('posts')}
            className={`text-sm sm:text-base px-3 py-1.5 sm:px-4 sm:py-2 rounded-md font-medium ${
              activeTab === 'posts' ? 'bg-accent dark:bg-secondary text-white' : 'text-gray1 hover:bg-gray4 hover:text-sub'
            }`}
          >
            {'Posts'}
            {` (${ postsCount })`}
          </button>
          <button
            onClick={() => handleTabChange('contributes')}
            className={`text-sm sm:text-base px-3 py-1.5 sm:px-4 sm:py-2 rounded-md font-medium ${
              activeTab === 'contributes' ? 'bg-accent dark:bg-secondary text-white' : 'text-gray1 hover:bg-gray4 hover:text-sub'
            }`}
          >
            {'Contributes'}
            {` (${ contributeCount })`}
          </button>
        </div>
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