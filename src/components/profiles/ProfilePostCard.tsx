'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TermData } from '@/types';
import { formatDate, getAuthorSlug } from '@/utils/filters';
import { ChevronRight } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

interface ProfilePostCardProps {
  term: TermData;
}

const ProfilePostCard = ({ term }: ProfilePostCardProps) => {
  const profiles = useSelector((state: RootState) => state.profiles.profiles);
  const [contributorSlugs, setContributorSlugs] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (profiles.length > 0 && term.metadata?.contributors) {
      const slugs: { [key: string]: string } = {};
      term.metadata.contributors.forEach((contributor) => {
        slugs[contributor] = getAuthorSlug(contributor);
      });
      setContributorSlugs(slugs);
    }
  }, [profiles, term.metadata?.contributors]);

  return (
    <Link
      href={term.url ?? 'not-found'}
      className="group size-full flex flex-col justify-between p-4 border border-light hover:border-primary rounded-md"
    >
      <div className="flex flex-col gap-2">
        <div className='flex flex-col gap-0.5'>
          <div className='flex justify-between items-center'>
            <span className="flex items-center gap-1 text-lg md:text-xl text-primary font-semibold py-1">
              {term.title?.ko}
              <ChevronRight className="animate-slideLeftToRight hidden group-hover:block size-5 text-primary" />
            </span>
            <Link
              href={`/posts/edit?id=${ term.id }`}
              className="sm:hidden group-hover:block text-sm text-gray2 rounded-full pl-3.5 pr-[13px] py-1 border border-gray2 hover:border-primary hover:text-primary hover:bg-gray5"
            >
              {'수정'}
            </Link>
          </div>
          <span className="text-sub text-sm truncate">{term.title?.en}</span>
          <span className="text-sub line-clamp-1 text-base">
            {term.description?.short}
          </span>
        </div>

        <div className='grid grid-cols-[auto_1fr] items-start justify-center gap-1'>
          <span className='flex justify-center rounded-lg text-sm text-sub pl-2.5 pr-[9px] bg-gray4 border border-gray5'>
            {'발행'}
          </span>
          <span className='text-sm text-gray1 mt-px'>
            {formatDate(term.metadata?.created_at || '')}
          </span>
          <span className='flex justify-center rounded-lg text-sm text-sub pl-2.5 pr-[9px] bg-gray4 border border-gray5'>
            {'수정'}
          </span>
          <span className='text-sm text-gray1 mt-px'>
            {formatDate(term.metadata?.updated_at || '')}
          </span>
          <span className='flex justify-center rounded-lg text-sm text-sub pl-2.5 pr-[9px] bg-gray4 border border-gray5'>
            {'편집자'}
          </span>
          <div className='flex mt-px'>
            {term.metadata?.contributors && term.metadata.contributors.length > 0 ? (
              term.metadata.contributors.map((contributor, index) => (
                <span key={contributor}>
                  <Link
                    href={`/profiles/${ contributorSlugs[contributor] || '' }`}
                    className="flex items-center text-primary text-sm hover:text-accent hover:underline underline-offset-2"
                  >
                    {contributor}
                  </Link>
                  {index < (term.metadata?.contributors?.length ?? 0) - 1 && ', '}
                </span>
              ))
            ) : (
              <span className="text-sm text-gray1">{'없음'}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProfilePostCard;
