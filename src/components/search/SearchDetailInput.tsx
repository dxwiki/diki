'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Filter, ChevronLeft } from 'lucide-react';
import TooltipButton from '@/components/ui/TooltipButton';

interface SearchDetailInputProps {
  termsLength?: number;
  filter?: boolean;
  goBack?: boolean;
}

const SearchDetailInput = ({ termsLength, filter = true, goBack = true }: SearchDetailInputProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterActive, setIsFilterActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const placeholder = termsLength ? `${ termsLength }개의 데이터 용어 검색` : '검색어 입력해주세요';
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (windowWidth >= 640) {
      const timeoutId = setTimeout(() => {
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [windowWidth]);

  const redirect = (e: React.KeyboardEvent<HTMLInputElement>, term: string) => {
    if (e.key === 'Enter') {
      window.location.href = `/posts?q=${ term
        .trim()
        .split(' ')
        .join('+') }`;
    }
  };

  return (
    <div className="relative w-full">
      <div className="grid grid-cols-[36px_minmax(0,1fr)] p-4 border border-extreme-light rounded-2xl hover:bg-extreme-light items-center gap-2">
        {goBack && (
          <TooltipButton
            isLink
            href="/"
            tooltip="홈으로"
            className='p-2'
          >
            <ChevronLeft className='size-4' />
          </TooltipButton>
        )}
        <div className="w-full px-3 flex items-center border border-light rounded-full focus-within:border-accent bg-background">
          <Search className="text-main size-4" />
          <input
            type="text"
            ref={inputRef}
            value={searchTerm}
            placeholder={placeholder}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => redirect(e, searchTerm)}
            className="w-full p-2 mr-2 bg-background outline-none text-main rounded-md"
          />
        </div>
        {filter && (
          <TooltipButton
            onClick={() => setIsFilterActive(!isFilterActive)}
            tooltip="필터"
            className='p-2'
          >
            <Filter className='size-4' />
          </TooltipButton>
        )}
        {filter && (
          <div className={`opacity-0 text-sub ${ isFilterActive ? 'opacity-100' : '' }`}>
            {'필터:'}
          </div>
        )}
      </div>
      {/* ... existing modal code ... */}
    </div>
  );
};

export default SearchDetailInput;