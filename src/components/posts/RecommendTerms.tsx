'use client';

import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import Link from 'next/link';
import { TermData } from '@/types';
import { useEffect, useRef, useState } from 'react';

export default function RecommendTerms() {
  const { terms } = useSelector((state: RootState) => state.terms);
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleItems, setVisibleItems] = useState<TermData[]>([]);

  const recentTerms = [...terms]
    .sort((a, b) => new Date(b.metadata?.created_at ?? '').getTime() - new Date(a.metadata?.created_at ?? '').getTime())
    .slice(0, 10);

  useEffect(() => {
    const calculateVisibleItems = () => {
      if (!containerRef.current) return;

      const containerWidth = containerRef.current.offsetWidth;
      const gap = 8;
      const maxItems = Math.floor((containerWidth + gap) / (100 + gap));
      const itemWidth = Math.floor((containerWidth - ((maxItems - 1) * gap)) / maxItems);

      setVisibleItems((prev) => {
        const newItems = recentTerms
          .slice(0, maxItems)
          .sort((a, b) => {
            const dateA = new Date(a.metadata?.created_at ?? '').getTime();
            const dateB = new Date(b.metadata?.created_at ?? '').getTime();
            if (dateA === dateB) {
              return (b.id ?? 0) - (a.id ?? 0);
            }
            return 0;
          });

        if (prev.length !== newItems.length) return newItems;
        const hasChanged = newItems.some((item, index) => item.url !== prev[index].url);
        return hasChanged ? newItems : prev;
      });

      containerRef.current.style.setProperty('--item-width', `${ itemWidth }px`);
    };

    let timeoutId: NodeJS.Timeout;
    const debouncedCalculate = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(calculateVisibleItems, 100);
    };

    calculateVisibleItems();
    window.addEventListener('resize', debouncedCalculate);

    return () => {
      window.removeEventListener('resize', debouncedCalculate);
      clearTimeout(timeoutId);
    };
  }, [recentTerms]);

  return (
    <div className='space-y-1.5'>
      <h3 className='text-sub font-semibold'>{'최근 등록'}</h3>
      <div ref={containerRef} className='flex justify-between gap-2 overflow-hidden'>
        {visibleItems.map((term) => (
          <Link
            key={term.url}
            href={`${ term.url }`}
            className='py-1.5 flex justify-center items-center text-sub rounded-lg border border-light hover:bg-extreme-light hover:text-main transition-colors text-xs sm:text-sm shrink-0'
            style={{ width: 'var(--item-width)' }}
          >
            {term.title?.ko}
          </Link>
        ))}
      </div>
    </div>
  );
}