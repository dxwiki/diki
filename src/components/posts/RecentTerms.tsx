'use client';

import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import Link from 'next/link';
import { TermData } from '@/types';
import { useEffect, useRef, useState } from 'react';
import { Rocket } from 'lucide-react';

const skeleton_count = 5;
const skeleton_width = 110;

const SkeletonItem = () => (
  <div
    style={{ width: `${ skeleton_width }px` }}
    className="py-1.5 px-2.5 flex justify-center items-center rounded-lg border border-light shrink-0 bg-background animate-pulse"
  >
    <div className="h-[18px] w-3/4 bg-gray-200 rounded" />
  </div>
);

export default function RecentTerms() {
  const { terms, isLoading } = useSelector((state: RootState) => state.terms);
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleItems, setVisibleItems] = useState<TermData[]>([]);

  const recentTerms = [...terms]
    .sort((a, b) => {
      const dateA = new Date(a.metadata?.created_at ?? '').getTime();
      const dateB = new Date(b.metadata?.created_at ?? '').getTime();

      if (dateB === dateA) {
        return (b.id ?? 0) - (a.id ?? 0);
      }
      return dateB - dateA;
    })
    .slice(0, 10);

  useEffect(() => {
    const calculateVisibleItems = () => {
      if (!containerRef.current) return;

      const containerWidth = containerRef.current.offsetWidth;
      const gap = 8;

      const desiredItemWidth = 116; // 7글자와 padding을 포함한 너비
      const maxItems = Math.floor((containerWidth + gap) / (desiredItemWidth + gap));
      const calculatedItemWidth = Math.floor((containerWidth - ((maxItems - 1) * gap)) / maxItems);

      setVisibleItems((prev) => {
        const newItems = recentTerms.slice(0, maxItems);

        if (prev.length !== newItems.length) return newItems;
        const hasChanged = newItems.some((item, index) => item.url !== prev[index].url);
        return hasChanged ? newItems : prev;
      });

      containerRef.current.style.setProperty('--item-width', `${ calculatedItemWidth }px`);
    };

    // Initial calculation
    calculateVisibleItems();

    window.addEventListener('resize', calculateVisibleItems);

    return () => {
      window.removeEventListener('resize', calculateVisibleItems);
    };
  }, [recentTerms]);

  const isLocalLoading = isLoading || (terms.length === 0);

  return (
    <div className='w-full space-y-1.5'>
      <div className='flex items-center gap-1 sm:gap-1.5'>
        <Rocket className='size-4' />
        <h3 className='text-base text-sub font-semibold'>{'최신 포스트'}</h3>
      </div>
      <div ref={containerRef} className='flex justify-between gap-2 overflow-hidden'>
        {isLocalLoading ? (
          Array(skeleton_count).fill(0).map((_, index) => (
            <SkeletonItem key={`skeleton-${ index }`} />
          ))
        ) : (
          visibleItems.map((term) => (
            <Link
              key={term.url}
              href={`${ term.url }`}
              style={{ width: 'var(--item-width)' }}
              className='py-1.5 px-2.5 flex justify-center items-center text-sub rounded-lg border border-light hover:border-primary hover:text-primary hover:font-semibold transition-colors text-[13px] md:text-sm shrink-0 bg-background'
            >
              <span className="overflow-hidden text-nowrap text-ellipsis">
                {term.title?.ko}
              </span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}