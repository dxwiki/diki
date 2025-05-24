'use client';

import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { useEffect, useRef, useState } from 'react';
import { Search, ChevronLeft } from 'lucide-react';
import 'react-datepicker/dist/react-datepicker.css';
import {
  setActiveModal,
  setSearchQuery,
  setComplexRange,
  setPublishedDateRange,
  setModifiedDateRange,
} from '@/store/searchSlice';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import ComplexityFilter from './ComplexityFilter';
import PublishedDateFilter from './PublishedDateFilter';
import ModifiedDateFilter from './ModifiedDateFilter';
interface ComplexRange {
  level: [number, number];
  DS: [number, number];
  DE: [number, number];
  DA: [number, number];
}

const SearchDetailInput = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { terms } = useSelector((state: RootState) => state.terms);
  const {
    searchQuery,
    activeModal,
    complexRange,
    publishedDateRange,
    modifiedDateRange,
    hasInteractedPublished,
    hasInteractedModified,
    hasInteractedComplex,
  } = useSelector((state: RootState) => state.search);
  const dispatch = useDispatch();

  const inputRef = useRef<HTMLInputElement>(null);
  const query = searchParams.get('q') || '';
  const [placeholder, setPlaceholder] = useState('검색어 입력해주세요');

  useEffect(() => {
    setPlaceholder(terms.length ? `${ terms.length }개의 데이터 용어 검색` : '검색어 입력해주세요');
  }, [terms.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    dispatch(setSearchQuery(query));

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch, query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        activeModal
        && !(e.target as Element).closest('.filter-modal')
        && !(e.target as Element).closest('[class*="group flex"]')
      ) {
        dispatch(setActiveModal(null));
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeModal, dispatch]);

  const redirect = (e: React.KeyboardEvent<HTMLInputElement>, term: string) => {
    if (e.key === 'Enter') {
      router.push(`/posts?q=${ term.trim().split(' ').join('+') }`);
    }
  };

  const handleFilterClick = (modalName: string | null) => {
    if( modalName === null ) {
      requestAnimationFrame(() => {
        dispatch(setActiveModal(null));
      });
    } else {
      dispatch(setActiveModal(modalName));
    }

    if (modalName === 'searchQuery' && activeModal === modalName) {
      inputRef.current?.blur();
    }
  };

  const handleComplexRangeChange = (type: keyof ComplexRange, newRange: [number, number]) => {
    dispatch(setComplexRange({ type, newRange }));

    // 현재 변경된 range를 포함한 모든 range가 전체 범위(0-4)인지 확인
    // const updatedComplexRange = {
    //   ...complexRange,
    //   [type]: newRange,
    // };
  };

  const handleDateChange = (dates: [Date | null, Date | null], type: 'published' | 'modified') => {
    // Date 객체를 ISO 문자열로 변환
    const serializedDates: [string | null, string | null] = [
      dates[0] ? dates[0].toISOString() : null,
      dates[1] ? dates[1].toISOString() : null,
    ];

    if (type === 'published') {
      dispatch(setPublishedDateRange(serializedDates));
    } else {
      dispatch(setModifiedDateRange(serializedDates));
    }
  };

  const formatDateRange = (range: [string | null, string | null]) => {
    if (!range[0]) return '전체 기간';

    // 문자열을 Date 객체로 변환
    const startDate = new Date(range[0]);

    const formatDate = (date: Date) => {
      const year = date.getFullYear().toString();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${ year }.${ month }.${ day }`;
    };

    if (!range[1]) {
      return formatDate(startDate);
    }

    const endDate = new Date(range[1]);
    if (startDate.getTime() === endDate.getTime()) {
      return formatDate(startDate);
    }

    return `${ formatDate(startDate) } - ${ formatDate(endDate) }`;
  };

  const formatComplexRange = () => {
    const isDefault = Object.values(complexRange).every(
      (range) => range[0] === 0 && range[1] === 4
    );

    if (isDefault) return '전체';
    return '복합적';
  };

  const formatDateParam = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${ year }${ month }${ day }`;
  };

  const buildSearchUrl = () => {
    const params = new URLSearchParams();

    // q 있으면 추가
    if (searchQuery.trim()) {
      params.append('q', searchQuery.trim());
    }

    const isAllSelected = (range: [number, number]) => range[0] === 0 && range[1] === 4;

    if (!Object.values(complexRange).every(isAllSelected)) {
      const complexParams = Object.entries(complexRange)
        .filter(([, range]) => !isAllSelected(range))
        .map(([key, range]) => {
          return `${ key.toLowerCase() }-${ range[0] }-${ range[1] }`;
        })
        .join('_');
      if (complexParams) {
        params.append('f', complexParams);
      }
    }

    if (publishedDateRange[0] || publishedDateRange[1]) {
      const publishedParam = `${ formatDateParam(publishedDateRange[0]) }-${ formatDateParam(publishedDateRange[1]) }`;
      params.append('p', publishedParam);
    }

    if (modifiedDateRange[0] || modifiedDateRange[1]) {
      const modifiedParam = `${ formatDateParam(modifiedDateRange[0]) }-${ formatDateParam(modifiedDateRange[1]) }`;
      params.append('m', modifiedParam);
    }

    const queryString = params.toString();
    return `/posts${ queryString ? `?${ queryString }` : '' }`;
  };

  const handleSearch = () => {
    const searchUrl = buildSearchUrl();
    router.push(searchUrl);
  };

  return (
    <>
      {/* <div className='flex flex-col gap-1'>
        <div>{'searchQuery: '}{searchQuery}</div>
        <div>{'activeModal: '}{activeModal}</div>
        <div>{'hasInteractedComplex: '}{hasInteractedComplex}</div>
        <div>{'selectedQuickSelect: '}{selectedQuickSelect}</div>
        <div>{'selectedModifiedQuickSelect: '}{selectedModifiedQuickSelect}</div>
        <div>{'complexRange: '}{JSON.stringify(complexRange)}</div>
        <div>{'publishedDateRange: '}{JSON.stringify(publishedDateRange)}</div>
        <div>{'modifiedDateRange: '}{JSON.stringify(modifiedDateRange)}</div>
        <div>{'selectedComplexQuickSelect: '}{selectedComplexQuickSelect}</div>
      </div> */}
      <div className="relative w-full mt-2 mb-10">
        <div className={`w-full flex items-center border border-light rounded-full shadow-md dark:shadow-gray4 bg-background ${ activeModal ? 'border-primary' : '' }`}>
          <div className='ml-3'>
            <Link
              href="/"
              className='flex items-center justify-center size-11 rounded-full hover:bg-gray3'
            >
              <ChevronLeft className='size-5' aria-label='이전 페이지로 이동' />
            </Link>
          </div>
          <div className="w-full grid grid-cols-[3fr_1fr] lg:grid-cols-[3.5fr_1.6fr_2fr_2.5fr] items-center">
            {/* 검색어 */}
            <div
              onClick={() => handleFilterClick('searchQuery')}
              className='peer/search group flex flex-col py-3 px-4 rounded-full'
            >
              <label htmlFor="searchQuery" className={`text-[13px] text-main group-hover:cursor-pointer group-hover:text-primary ${ activeModal === 'searchQuery' ? 'text-primary' : '' }`}>
                {'검색어'}
              </label>
              <input
                id="searchQuery"
                type="text"
                value={searchQuery}
                onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                onKeyDown={(e) => redirect(e, searchQuery)}
                placeholder={placeholder}
                className="bg-transparent focus:outline-none placeholder:text-gray1 text-main"
              />
            </div>

            {/* 난이도 / 연관도 */}
            <ComplexityFilter
              activeModal={activeModal}
              handleFilterClick={handleFilterClick}
              complexRange={complexRange}
              hasInteractedComplex={hasInteractedComplex}
              handleComplexRangeChange={handleComplexRangeChange}
              formatComplexRange={formatComplexRange}
            />

            {/* 발행일 */}
            <PublishedDateFilter
              activeModal={activeModal}
              handleFilterClick={handleFilterClick}
              publishedDateRange={publishedDateRange}
              hasInteractedPublished={hasInteractedPublished}
              handleDateChange={handleDateChange}
              formatDateRange={formatDateRange}
            />

            {/* 수정일 */}
            <ModifiedDateFilter
              activeModal={activeModal}
              handleFilterClick={handleFilterClick}
              modifiedDateRange={modifiedDateRange}
              hasInteractedModified={hasInteractedModified}
              handleDateChange={handleDateChange}
              formatDateRange={formatDateRange}
            />

            {/* 검색 버튼 */}
            <div className='absolute right-3 top-1/2 -translate-y-1/2'>
              <button
                onClick={handleSearch}
                className="flex items-center justify-center size-11 rounded-full hover:bg-[#03537f] bg-primary"
              >
                <Search className="text-white size-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SearchDetailInput;
