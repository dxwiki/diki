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

const adSlots = ['5547328424', '2422471637', '7215138470', '7150455642'];

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
      <div className='md:grid md:grid-cols-[minmax(0,768px)_minmax(0,1fr)] overflow-x-hidden'>
        <div className='text-justify'>
          <PostHeader term={term} onShare={handleShare} />
          <div className='animate-introSecond sm:ml-5'>
            {children}
          </div>
        </div>
        <div className='hidden md:flex flex-col ml-4'>
          <div className='w-full h-[135px]' />
          <div className='flex flex-col gap-4'>
            {adSlots.map((slot) => (
              <AdContainer
                key={slot}
                slot={slot}
                format="mcrspv"
                className="w-[122px] min-h-[600px]"
              />
            ))}
          </div>
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