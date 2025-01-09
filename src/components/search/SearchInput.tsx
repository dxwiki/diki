'use client';

import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import SearchTip from '@/components/search/SearchTip';

interface SearchInputProps {
  suggestions?: string[];
  tip?: boolean;
}

const SearchInput = ({ suggestions, tip = true }: SearchInputProps) => {
  const { terms } = useSelector((state: RootState) => state.terms);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const placeholder = terms.length ? `${ terms.length }개의 데이터 용어 검색` : '검색어 입력해주세요';

  const filteredSuggestions = suggestions?.filter((suggestion) =>
    suggestion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (!e.relatedTarget || !(e.relatedTarget as HTMLElement).closest('.suggestions-modal')) {
      setIsModalOpen(false);
    }
  };

  const redirect = (e: React.KeyboardEvent<HTMLInputElement>, term: string) => {
    if (e.key === 'Enter') {
      window.location.href = `/posts?q=${ term
        .trim()
        .split(' ')
        .join('+') }`;
    }
  };

  const handleClickX = () => {
    inputRef.current?.focus();
    setSearchTerm('');
  };

  return (
    <div className="relative w-full bg-background">
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
            value={searchTerm}
            placeholder={placeholder}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsModalOpen(true)}
            onBlur={handleBlur}
            onKeyDown={(e) => redirect(e, searchTerm)}
            className="w-full p-2 mr-2 outline-none text-main bg-background"
          />
          {searchTerm && (
            <X
              className="text-main size-5 cursor-pointer hover:text-primary rounded-full shrink-0"
              onClick={() => handleClickX()}
            />
          )}
        </div>

        {isModalOpen && (
          <div className="w-full overflow-y-auto suggestions-modal">
            {searchTerm ? (
              filteredSuggestions && filteredSuggestions.length > 0 ? (
                filteredSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setSearchTerm(suggestion);
                      setIsModalOpen(false);
                    }}
                  >
                    {suggestion}
                  </div>
                ))
              ) : (
                <div className="px-4 py-2 text-sub min-h-56">{'검색어 추천'}</div>
              )
            ) : (
              tip && <SearchTip />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchInput;

