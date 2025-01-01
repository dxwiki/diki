'use client';

import { useState, useCallback } from 'react';
import TableOfContents from '@/components/common/TableOfContents';
import ShareModal from '@/components/common/ShareModal';
import AdContainer from '@/components/common/AdContainer';
import PostHeader from './sections/PostHeader';
import { TermData } from '@/types';

interface Props {
  title: string;
  children: React.ReactNode;
  term: TermData;
  slug: string;
}

const PostDetailClient = ({ title, children, term, slug }: Props) => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const handleShare = useCallback(() => {
    setIsShareModalOpen(true);
  }, []);

  return (
    <div className='prose block md:grid md:grid-cols-[1fr_5fr]'>
      <TableOfContents
        title={title}
        term={term}
        slug={slug}
      />
      <div className='md:grid md:grid-cols-[minmax(0,768px)_minmax(0,1fr)]'>
        <div className='text-justify'>
          <PostHeader term={term} onShare={handleShare} />
          <div className='animate-introSecond sm:ml-5'>
            {children}
          </div>
        </div>
        <div className='hidden md:flex flex-col ml-4'>
          <div className='w-full h-[135px]' />
          <AdContainer
            slot="5547328424"
            format="mcrspv"
            className="w-40 min-h-[600px]"
          />
          <AdContainer
            slot="2422471637"
            format="mcrspv"
            className="w-40 min-h-[600px]"
          />
        </div>
      </div>

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </div>
  );
};

export default PostDetailClient;