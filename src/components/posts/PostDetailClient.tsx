'use client';

import { useState, useCallback } from 'react';
import TableOfContents from '@/components/common/TableOfContents';
import ShareModal from '@/components/common/ShareModal';

interface Props {
  title: string;
  children: React.ReactNode;
}

const PostDetailClient = ({ title, children }: Props) => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const handleShare = useCallback(() => {
    setIsShareModalOpen(true);
  }, []);

  return (
    <div className='prose block md:grid md:grid-cols-[1fr_5fr]'>
      <TableOfContents 
        title={title}
        onShare={handleShare}
      />
      <div className='lg:mr-40 text-justify'>
        {children}
      </div>

      <ShareModal 
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </div>
  );
};

export default PostDetailClient;