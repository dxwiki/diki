'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
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

const adConfig = {
  slots: ['4398375581', '3085293912', '4461288480', '3148206813'],
  heightThresholds: {
    fourAds: 2800,
    threeAds: 2300,
    twoAds: 1300,
  },
  initialMeasurementDelay: 500,
} as const;

const PostDetailClient = ({ title, children, term, slug }: Props) => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [visibleAdCount, setVisibleAdCount] = useState(1);
  const contentRef = useRef<HTMLDivElement>(null);

  const determineAdCount = useCallback((height: number) => {
    const { heightThresholds } = adConfig;

    if (height > heightThresholds.fourAds) return 4;
    if (height > heightThresholds.threeAds) return 3;
    if (height > heightThresholds.twoAds) return 2;
    return 1;
  }, []);

  useEffect(() => {
    if (!contentRef.current) return;

    const updateAdCount = () => {
      if (!contentRef.current) return;
      const contentHeight = contentRef.current.offsetHeight;
      setVisibleAdCount(determineAdCount(contentHeight));
    };

    const resizeObserver = new ResizeObserver(updateAdCount);
    resizeObserver.observe(contentRef.current);

    setTimeout(updateAdCount, adConfig.initialMeasurementDelay);

    return () => resizeObserver.disconnect();
  }, [determineAdCount]);

  const handleShare = useCallback(() => {
    setIsShareModalOpen(true);
  }, []);

  return (
    <div className='prose block md:grid md:grid-cols-[minmax(0,176px)_5fr]'>
      <TableOfContents
        title={title}
        term={term}
        slug={slug}
      />
      <div className='md:grid md:grid-cols-[minmax(0,720px)_minmax(0,1fr)]'>
        <div className='text-justify' ref={contentRef}>
          <PostHeader term={term} onShare={handleShare} />
          <div className='animate-introSecond sm:ml-5 flex flex-col gap-16'>
            {children}
          </div>
        </div>
        <div className='hidden lg:flex flex-col ml-4'>
          <div className='w-full h-[128px]' />
          <div className='flex flex-col justify-between' style={{ height: `calc(${ contentRef.current?.offsetHeight }px - 352px)` }}>
            {adConfig.slots.slice(0, visibleAdCount).map((slot) => (
              <AdContainer
                key={slot}
                slot={slot}
                format="auto"
                containerClassName="flex justify-end"
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
