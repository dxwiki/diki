'use client';

import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useState, useEffect, useRef, KeyboardEvent, RefObject } from 'react';
import { Search, X } from 'lucide-react';
import { searchTerms } from '@/utils/search';
import { TermData } from '@/types';

interface InternalLinkSearchProps {
  onSelect: (url: string, title: string)=> void;
  refocus?: boolean;
  inputRef?: RefObject<HTMLInputElement>;
}

const InternalLinkSearch = ({ onSelect, refocus = false, inputRef }: InternalLinkSearchProps) => {
  const { terms } = useSelector((state: RootState) => state.terms);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const internalInputRef = useRef<HTMLInputElement>(null);
  const suggestionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [placeholder, setPlaceholder] = useState('검색어 입력해주세요');
  const [recommendedTerms, setRecommendedTerms] = useState<TermData[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const debounceDelay = 300;
  let searchTimeout: NodeJS.Timeout;
  const finalInputRef = inputRef || internalInputRef;

  useEffect(() => {
    setPlaceholder(terms.length ? `Diki 내 ${ terms.length }개의 포스트 검색` : '검색어 입력해주세요');
  }, [terms.length]);

  useEffect(() => {
    setSelectedIndex(-1);
  }, [searchQuery]);

  useEffect(() => {
    if (selectedIndex >= 0 && suggestionRefs.current[selectedIndex] && containerRef.current) {
      const selectedElement = suggestionRefs.current[selectedIndex];
      const container = containerRef.current;

      const selectedRect = selectedElement.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      if (selectedRect.top < containerRect.top) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
      else if (selectedRect.bottom > containerRect.bottom) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);

  useEffect(() => {
    suggestionRefs.current = suggestionRefs.current.slice(0, recommendedTerms.length);
  }, [recommendedTerms]);

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setTimeout(() => {
      if (!e.relatedTarget || !(e.relatedTarget as HTMLElement).closest('.suggestions-modal')) {
        setIsModalOpen(false);
      }
    }, 0);
  };

  const handleClickX = () => {
    if (finalInputRef.current) {
      finalInputRef.current.focus();
    }
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
        if (finalInputRef.current) {
          finalInputRef.current.focus();
          setIsModalOpen(true);
        }
      }, 50);
    } else {
      // 선택 후 blur 처리
      if (finalInputRef.current) {
        finalInputRef.current.blur();
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

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!searchQuery || recommendedTerms.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < recommendedTerms.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : recommendedTerms.length - 1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      const selectedTerm = recommendedTerms[selectedIndex];
      handleSuggestionClick(selectedTerm);
    }
  };

  return (
    <div className="w-full">
      <div className="w-full p-2 border border-gray4 rounded-md focus-within:border-primary bg-white dark:bg-gray5">
        <div className="flex items-center">
          <Search className="text-primary size-5 shrink-0 mr-2" />
          <input
            type="text"
            ref={finalInputRef}
            value={searchQuery}
            placeholder={placeholder}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => setIsModalOpen(true)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="w-full outline-none text-main bg-white dark:bg-gray5"
            data-search-input
          />
          {searchQuery && (
            <X
              className="text-main size-5 cursor-pointer hover:text-primary rounded-full shrink-0"
              onClick={handleClickX}
            />
          )}
        </div>
      </div>

      {isModalOpen && searchQuery && (
        recommendedTerms.length > 0 ? (
          <div className="w-full suggestions-modal top-10 bg-gray5 border border-gray4 rounded-md mt-1 shadow-md">
            <div ref={containerRef} className="flex flex-col max-h-60 overflow-y-auto">
              {recommendedTerms.map((term, index) => (
                <div
                  key={term.id}
                  ref={(el) => {
                    suggestionRefs.current[index] = el;
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSuggestionClick(term);
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center px-4 py-2 hover:bg-gray4 cursor-pointer ${ selectedIndex === index ? 'bg-gray4' : '' }`}
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
          </div>
        ) : (
          <div className="w-full suggestions-modal top-10 bg-gray5 border border-gray4 rounded-md mt-1 shadow-md">
            <div className="flex items-center px-4 py-10 text-sub">
              {'검색 결과가 없습니다.'}
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default InternalLinkSearch;