import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  buildSearchIndex,
  DEFAULT_LISTING,
  isFilterActive,
  listTerms,
  updatedPeriodRange,
  type ListingOptions,
  type NumberRange,
  type SortDirection,
  type SortType,
  type TermData,
  type TermFilter,
  type UpdatedPeriod,
} from '@diki/core';

export const SEARCH_DEBOUNCE_MS = 300;

export const FULL_LEVEL_RANGE: NumberRange = { min: 1, max: 5 };

const hasText = (value: string) => value.trim().length > 0;

export interface TermListingFilterState {
  level: NumberRange;
  period: UpdatedPeriod;
}

const DEFAULT_FILTER_STATE: TermListingFilterState = { level: FULL_LEVEL_RANGE, period: 'all' };

export function useTermListing(terms: TermData[]) {
  const [input, setInput] = useState(DEFAULT_LISTING.query);
  const [query, setQuery] = useState(DEFAULT_LISTING.query);
  const [sortType, setSortType] = useState<SortType>(DEFAULT_LISTING.sortType);
  const [sortDirection, setSortDirection] = useState<SortDirection>(DEFAULT_LISTING.sortDirection);
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
      // 검색어가 새로 생기면 관련도 내림차순이 기본값이 된다
      if (!had && has) {
        setSortType('relevance');
        setSortDirection('desc');
      }
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [input]);

  // 검색어가 없어지면 관련도 정렬을 기본 정렬로 되돌린다
  useEffect(() => {
    if (!hasText(query) && sortType === 'relevance') {
      setSortType(DEFAULT_LISTING.sortType);
      setSortDirection(DEFAULT_LISTING.sortDirection);
    }
  }, [query, sortType]);

  const filter = useMemo<TermFilter>(() => {
    const next: TermFilter = {};
    const { level, period } = filterState;
    if (level.min > FULL_LEVEL_RANGE.min || level.max < FULL_LEVEL_RANGE.max) next.ranges = { LEVEL: level };
    const updated = updatedPeriodRange(period);
    if (updated) next.updated = updated;
    return next;
  }, [filterState]);

  const options = useMemo<ListingOptions>(() => ({
    ...DEFAULT_LISTING,
    query,
    filter,
    sortType,
    sortDirection,
  }), [query, filter, sortType, sortDirection]);

  const results = useMemo(() => listTerms(terms, options), [terms, options]);

  const changeSort = useCallback((type: SortType, direction: SortDirection) => {
    if (type === 'relevance' && !hasText(queryRef.current)) return;
    setSortType(type);
    setSortDirection(direction);
  }, []);

  const reset = useCallback(() => {
    queryRef.current = DEFAULT_LISTING.query;
    setInput(DEFAULT_LISTING.query);
    setQuery(DEFAULT_LISTING.query);
    setSortType(DEFAULT_LISTING.sortType);
    setSortDirection(DEFAULT_LISTING.sortDirection);
    setFilterState(DEFAULT_FILTER_STATE);
  }, []);

  return {
    input,
    setInput,
    query,
    hasQuery: hasText(query),
    sortType,
    sortDirection,
    changeSort,
    filterState,
    setFilterState,
    filterActive: isFilterActive(filter),
    results,
    reset,
  };
}
