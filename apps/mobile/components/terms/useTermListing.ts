import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  buildSearchIndex,
  DEFAULT_LISTING,
  listTerms,
  type ListingOptions,
  type NumberRange,
  type RangeKey,
  type SortDirection,
  type SortType,
  type TermData,
  type TermFilter,
} from '@diki/core';

export const SEARCH_DEBOUNCE_MS = 300;

export const FULL_RANGE: NumberRange = { min: 1, max: 5 };

export type SortOption = 'relevance' | 'createdDesc' | 'createdAsc' | 'levelDesc' | 'levelAsc';

export const SORT_OPTIONS: Record<SortOption, { label: string; type: SortType; direction: SortDirection }> = {
  relevance: { label: '관련도순', type: 'relevance', direction: 'desc' },
  createdDesc: { label: '발행일 최신순', type: 'created', direction: 'desc' },
  createdAsc: { label: '발행일 과거순', type: 'created', direction: 'asc' },
  levelDesc: { label: '높은 난이도순', type: 'difficulty', direction: 'desc' },
  levelAsc: { label: '낮은 난이도순', type: 'difficulty', direction: 'asc' },
};

export const DEFAULT_SORT: SortOption = 'createdDesc';

export type RelevanceKey = Exclude<RangeKey, 'LEVEL'>;

export interface DateSelection {
  start: string | null;
  end: string | null;
}

export interface TermListingFilterState {
  level: NumberRange;
  relevance: Record<RelevanceKey, NumberRange>;
  created: DateSelection;
}

export const DEFAULT_FILTER_STATE: TermListingFilterState = {
  level: FULL_RANGE,
  relevance: { DA: FULL_RANGE, DS: FULL_RANGE, DE: FULL_RANGE },
  created: { start: null, end: null },
};

const hasText = (value: string) => value.trim().length > 0;

export const isFullRange = (range: NumberRange) => range.min <= FULL_RANGE.min && range.max >= FULL_RANGE.max;

// 'YYYY-MM-DD' 를 기기 시간대의 그날 0시로 바꾼다
export const parseDay = (day: string): Date => {
  const [y, m, d] = day.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const endOfDay = (day: string): Date => {
  const date = parseDay(day);
  date.setHours(23, 59, 59, 999);
  return date;
};

export function useTermListing(terms: TermData[]) {
  const [input, setInput] = useState(DEFAULT_LISTING.query);
  const [query, setQuery] = useState(DEFAULT_LISTING.query);
  const [sort, setSort] = useState<SortOption>(DEFAULT_SORT);
  const [filterState, setFilterState] = useState<TermListingFilterState>(DEFAULT_FILTER_STATE);
  const queryRef = useRef(query);

  // 콘텐츠가 바뀔 때 한 번, 상호작용이 끝난 뒤 검색 인덱스를 만든다
  useEffect(() => {
    const handle = requestIdleCallback(() => {
      buildSearchIndex(terms);
    });
    return () => cancelIdleCallback(handle);
  }, [terms]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const next = hasText(input) ? input : '';
      const had = hasText(queryRef.current);
      const has = hasText(next);
      queryRef.current = next;
      setQuery(next);
      // 검색어가 새로 생기면 관련도순이 기본값이 된다
      if (!had && has) setSort('relevance');
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [input]);

  // 검색어가 없어지면 관련도순을 기본 정렬로 되돌린다
  useEffect(() => {
    if (!hasText(query) && sort === 'relevance') setSort(DEFAULT_SORT);
  }, [query, sort]);

  const filter = useMemo<TermFilter>(() => {
    const next: TermFilter = {};
    const { level, relevance, created } = filterState;
    const ranges: TermFilter['ranges'] = {};
    if (!isFullRange(level)) ranges.LEVEL = level;
    (Object.keys(relevance) as RelevanceKey[]).forEach((key) => {
      if (!isFullRange(relevance[key])) ranges[key] = relevance[key];
    });
    if (Object.keys(ranges).length) next.ranges = ranges;
    // 시작일만 있으면 core 가 그 하루만 거른다
    if (created.start) next.created = { start: parseDay(created.start), end: created.end ? endOfDay(created.end) : null };
    return next;
  }, [filterState]);

  const options = useMemo<ListingOptions>(() => ({
    ...DEFAULT_LISTING,
    query,
    filter,
    sortType: SORT_OPTIONS[sort].type,
    sortDirection: SORT_OPTIONS[sort].direction,
  }), [query, filter, sort]);

  const results = useMemo(() => listTerms(terms, options), [terms, options]);

  const changeSort = useCallback((next: SortOption) => {
    if (next === 'relevance' && !hasText(queryRef.current)) return;
    setSort(next);
  }, []);

  // 검색어는 두고 정렬·필터만 처음 상태로 되돌린다
  const resetFilters = useCallback(() => {
    setSort(hasText(queryRef.current) ? 'relevance' : DEFAULT_SORT);
    setFilterState(DEFAULT_FILTER_STATE);
  }, []);

  const reset = useCallback(() => {
    queryRef.current = DEFAULT_LISTING.query;
    setInput(DEFAULT_LISTING.query);
    setQuery(DEFAULT_LISTING.query);
    setSort(DEFAULT_SORT);
    setFilterState(DEFAULT_FILTER_STATE);
  }, []);

  return {
    input,
    setInput,
    query,
    hasQuery: hasText(query),
    sort,
    changeSort,
    filterState,
    setFilterState,
    filtered: sort !== (hasText(query) ? 'relevance' : DEFAULT_SORT) || Object.keys(filter).length > 0,
    results,
    reset,
    resetFilters,
  };
}
