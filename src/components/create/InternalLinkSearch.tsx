'use client';

import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { searchTerms } from '@/utils/search';
import { TermData } from '@/types';

interface InternalLinkSearchProps {
  onSelect: (url: string, title: string)=> void;
  refocus?: boolean; // 선택 후 다시 포커스할지 여부
}

const InternalLinkSearch = ({ onSelect, refocus = false }: InternalLinkSearchProps) => {
  const { terms } = useSelector((state: RootState) => state.terms);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [placeholder, setPlaceholder] = useState('검색어 입력해주세요');
  const [recommendedTerms, setRecommendedTerms] = useState<TermData[]>([]);
  const debounceDelay = 300;
  let searchTimeout: NodeJS.Timeout;

  useEffect(() => {
    setPlaceholder(terms.length ? `Diki 내 ${ terms.length }개의 포스트 검색` : '검색어 입력해주세요');
  }, [terms.length]);

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setTimeout(() => {
      if (!e.relatedTarget || !(e.relatedTarget as HTMLElement).closest('.suggestions-modal')) {
        setIsModalOpen(false);
      }
    }, 0);
  };

  const handleClickX = () => {
    inputRef.current?.focus();
    setSearchQuery('');
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);

    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      const results = searchTerms(query, terms);
      setRecommendedTerms(results);
    }, debounceDelay);
  };

  // 태그 선택 후 처리하는 함수
  const resetSearchAndRefocus = () => {
    setSearchQuery('');
    setRecommendedTerms([]);
    setIsModalOpen(false);

    if (refocus) {
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          setIsModalOpen(true);
        }
      }, 50);
    } else {
      // 선택 후 blur 처리
      if (inputRef.current) {
        inputRef.current.blur();
      }
    }
  };

  const handleSuggestionClick = (term: TermData) => {
    const title = term.title?.ko || term.title?.en || '';
    if (term.url) {
      onSelect(term.url, title);
      resetSearchAndRefocus();
    }
  };

  return (
    <div className="w-full">
      <div className="w-full p-2 border border-gray4 rounded-md focus-within:border-primary bg-white dark:bg-background">
        <div className="flex items-center">
          <Search className="text-primary size-5 shrink-0 mr-2" />
          <input
            type="text"
            ref={inputRef}
            value={searchQuery}
            placeholder={placeholder}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => setIsModalOpen(true)}
            onBlur={handleBlur}
            className="w-full outline-none text-main"
          />
          {searchQuery && (
            <X
              className="text-main size-5 cursor-pointer hover:text-primary rounded-full shrink-0"
              onClick={handleClickX}
            />
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="w-full suggestions-modal absolute top-10 z-10 bg-gray5 border border-gray4 rounded-md mt-1 shadow-md">
          {searchQuery ? (
            recommendedTerms.length > 0 ? (
              <div className="flex flex-col max-h-60 overflow-y-auto">
                {recommendedTerms.map((term) => (
                  <div
                    key={term.id}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSuggestionClick(term);
                    }}
                    className="flex items-center px-4 py-2 hover:bg-gray4 cursor-pointer"
                  >
                    <Search className="text-gray1 size-4 mr-2 shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-sub text-sm">
                        {term.title?.ko || term.title?.en}
                      </span>
                      {term.description?.short && (
                        <span className="text-[13px] text-gray1 line-clamp-1">
                          {term.description.short}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center px-4 py-10 text-sub">
                {'검색 결과가 없습니다.'}
              </div>
            )
          ) : (
            <div className="p-4 border-t border-gray4">
              <p className="text-gray1 text-sm mb-2">{'검색 팁'}</p>
              <ul className="text-sm text-gray2 space-y-1">
                <li>{'• '}{'정확한 키워드로 검색해보세요'}</li>
                <li>{'• '}{'관련 내부 페이지를 링크할 수 있습니다'}</li>
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InternalLinkSearch;