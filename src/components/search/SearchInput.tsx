'use client';

import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { setSearchQuery, resetSearchState } from '@/store/searchSlice';
import { setCurrentPage, setSortType } from '@/store/pageSlice';
import { useState, useEffect, useRef, KeyboardEvent as ReactKeyboardEvent } from 'react';
import { Search, X } from 'lucide-react';
import SearchTip from '@/components/search/SearchTip';
import { useRouter } from 'next/navigation';
import { searchTerms } from '@/utils/search';
import { setSearchedTerms } from '@/store/termsSlice';
import { TermData } from '@/types';

const SearchInput = () => {
  const dispatch = useDispatch();
  const { terms } = useSelector((state: RootState) => state.terms);
  const { searchQuery } = useSelector((state: RootState) => state.search);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [placeholder, setPlaceholder] = useState('검색어 입력해주세요');
  const router = useRouter();
  const [recommendedTerms, setRecommendedTerms] = useState<TermData[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const suggestionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const SUGGESTION_COUNT = 6;
  const debounceDelay = 300;
  let searchTimeout: NodeJS.Timeout;

  useEffect(() => {
    dispatch(resetSearchState());
    dispatch(setCurrentPage(1));
    dispatch(setSortType('created'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setPlaceholder(terms.length ? `${ terms.length }개의 데이터 용어 검색` : '검색어 입력해주세요');
  }, [terms.length]);

  useEffect(() => {
    setSelectedIndex(-1);
  }, [searchQuery]);

  useEffect(() => {
    suggestionRefs.current = suggestionRefs.current.slice(0, recommendedTerms.length);
  }, [recommendedTerms]);

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
    const handleGlobalKeyDown = (e: globalThis.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isModalOpen) {
          setIsModalOpen(false);
        } else {
          inputRef.current?.focus();
          setIsModalOpen(true);
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isModalOpen]);

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setTimeout(() => {
      if (!e.relatedTarget || !(e.relatedTarget as HTMLElement).closest('.suggestions-modal')) {
        setIsModalOpen(false);
      }
    }, 0);
  };

  const handleKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (!searchQuery || recommendedTerms.length === 0) {
      if (e.key === 'Enter') {
        dispatch(setSearchQuery(searchQuery));
        router.push(`/posts?q=${ searchQuery.trim().split(' ').join('+') }`);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < recommendedTerms.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : recommendedTerms.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0) {
        const selectedTerm = recommendedTerms[selectedIndex];
        handleSuggestionClick(selectedTerm);
      } else {
        dispatch(setSearchQuery(searchQuery));
        router.push(`/posts?q=${ searchQuery.trim().split(' ').join('+') }`);
      }
    }
  };

  const handleClickX = () => {
    inputRef.current?.focus();
    dispatch(setSearchQuery(''));
  };

  const handleSearch = (query: string) => {
    dispatch(setSearchQuery(query));

    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      const results = searchTerms(query, terms);
      dispatch(setSearchedTerms(results));
      setRecommendedTerms(results.slice(0, SUGGESTION_COUNT));
    }, debounceDelay);
  };

  const handleSuggestionClick = (term: TermData) => {
    const query = term.title?.ko || term.title?.en || '';
    dispatch(setSearchQuery(query));
    dispatch(setSearchedTerms([term]));
    setIsModalOpen(false);
    router.push(term.url ?? '/not-found');
  };

  return (
    <div className="relative w-full">
      <div
        className={`flex flex-col ${
          isModalOpen ? 'border border-light rounded-[21px] bg-background focus-within:border-primary' : ''
        }`}
      >
        <div className={`flex items-center px-3 ${
          isModalOpen
            ? ''
            : 'border border-light rounded-full'
        }`}
        >
          <Search className="text-main size-5 shrink-0" />
          <input
            type="text"
            ref={inputRef}
            value={searchQuery}
            placeholder={placeholder}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => setIsModalOpen(true)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="w-full p-2 mr-2 outline-none text-main bg-background"
          />
          {searchQuery && (
            <X
              className="text-main size-5 cursor-pointer hover:text-primary rounded-full shrink-0"
              onClick={handleClickX}
            />
          )}
        </div>

        {isModalOpen && (
          <div className="w-full suggestions-modal">
            {searchQuery ? (
              recommendedTerms.length > 0 ? (
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
                      className={`
                        flex items-center px-4 py-2 hover:bg-gray4 cursor-pointer
                        ${ index === recommendedTerms.length - 1 ? 'rounded-b-[21px]' : '' }
                        ${ selectedIndex === index ? 'bg-gray4' : '' }
                      `}
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
              <SearchTip />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchInput;

