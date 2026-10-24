import { TermData, SortType, SortDirection } from './types';
import { searchTerms } from './search';

export type RangeKey = 'LEVEL' | 'DS' | 'DE' | 'DA';

export interface NumberRange {
  min: number;
  max: number;
}

export interface DateRange {
  start: Date;
  end: Date | null;
}

export interface TermFilter {
  ranges?: Partial<Record<RangeKey, NumberRange>>;
  created?: DateRange;
  updated?: DateRange;
}

export interface FilterQuery {
  f?: string | null;
  p?: string | null;
  m?: string | null;
}

const RANGE_KEYS: RangeKey[] = ['LEVEL', 'DS', 'DE', 'DA'];

const isRangeKey = (key: string): key is RangeKey => (RANGE_KEYS as string[]).includes(key);

const parseRanges = (filterParam: string): Partial<Record<RangeKey, NumberRange>> => {
  return filterParam.split('_').reduce((acc, curr) => {
    const [key, min, max] = curr.split('-');
    const upperKey = key.toUpperCase();
    if (!isRangeKey(upperKey)) return acc;
    // 쿼리 값 0~4 를 1~5 로 바꾼다
    return { ...acc, [upperKey]: { min: Number(min) + 1, max: Number(max) + 1 } };
  }, {} as Partial<Record<RangeKey, NumberRange>>);
};

const parseDateStr = (dateStr: string) => {
  if (dateStr === '') return null;
  const year = dateStr.slice(0, 4);
  const month = dateStr.slice(4, 6);
  const day = dateStr.slice(6, 8);
  return new Date(`${ year }-${ month }-${ day }`);
};

const parseDateRange = (dateParam: string): DateRange | undefined => {
  const [start, end] = dateParam.split('-').map((d) => d ? parseDateStr(d) : null);
  if (!start) return undefined;
  return { start, end: end ?? null };
};

export function parseFilterQuery({ f, p, m }: FilterQuery): TermFilter {
  const filter: TermFilter = {};
  if (f) filter.ranges = parseRanges(f);
  if (p) {
    const created = parseDateRange(p);
    if (created) filter.created = created;
  }
  if (m) {
    const updated = parseDateRange(m);
    if (updated) filter.updated = updated;
  }
  return filter;
}

const RANGE_VALUE: Record<RangeKey, (term: TermData) => number | undefined> = {
  LEVEL: (term) => term.difficulty?.level,
  DS: (term) => term.relevance?.scientist?.score,
  DE: (term) => term.relevance?.engineer?.score,
  DA: (term) => term.relevance?.analyst?.score,
};

const matchesRanges = (term: TermData, ranges: Partial<Record<RangeKey, NumberRange>>) => {
  return RANGE_KEYS.every((key) => {
    const range = ranges[key];
    if (!range) return true;
    const value = RANGE_VALUE[key](term);
    if (value === undefined) return false;
    return !(value < range.min || value > range.max);
  });
};

const matchesDate = (term: TermData, range: DateRange, dateField: 'created_at' | 'updated_at') => {
  const termDate = term.metadata?.[dateField];
  if (!termDate) return false;

  const termDateTime = new Date(termDate).getTime();

  if (!range.end) {
    // 시작일만 있으면 그 하루만 포함한다
    const startDate = new Date(range.start);
    const nextDay = new Date(range.start);
    nextDay.setDate(nextDay.getDate() + 1);

    return termDateTime >= startDate.getTime() && termDateTime < nextDay.getTime();
  }

  return termDateTime >= range.start.getTime() && termDateTime <= range.end.getTime();
};

export function filterTerms(terms: TermData[], filter: TermFilter): TermData[] {
  const { ranges, created, updated } = filter;
  return terms.filter((term) => {
    if (ranges && !matchesRanges(term, ranges)) return false;
    if (created && !matchesDate(term, created, 'created_at')) return false;
    if (updated && !matchesDate(term, updated, 'updated_at')) return false;
    return true;
  });
}

export function sortTerms(terms: TermData[], sortType: SortType, sortDirection: SortDirection): TermData[] {
  return [...terms].sort((a, b) => {
    const multiplier = sortDirection === 'asc' ? 1 : -1;

    switch (sortType) {
      case 'difficulty': {
        const difficultyCompare = multiplier * ((a.difficulty?.level || 0) - (b.difficulty?.level || 0));
        return difficultyCompare === 0 ? multiplier * ((a.id || 0) - (b.id || 0)) : difficultyCompare;
      }
      case 'updated': {
        const dateCompare = multiplier * ((new Date(a.metadata?.updated_at || 0)).getTime()
          - (new Date(b.metadata?.updated_at || 0)).getTime());
        return dateCompare === 0 ? multiplier * ((a.id || 0) - (b.id || 0)) : dateCompare;
      }
      case 'created': {
        const dateCompare = multiplier * ((new Date(a.metadata?.created_at || 0)).getTime()
          - (new Date(b.metadata?.created_at || 0)).getTime());
        return dateCompare === 0 ? multiplier * ((a.id || 0) - (b.id || 0)) : dateCompare;
      }
      default:
        return 0;
    }
  });
}

export type UpdatedPeriod = 'all' | '7d' | '30d' | '90d' | '1y';

export const UPDATED_PERIODS: UpdatedPeriod[] = ['all', '7d', '30d', '90d', '1y'];

const UPDATED_PERIOD_DAYS: Record<Exclude<UpdatedPeriod, 'all'>, number> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
  '1y': 365,
};

const DAY_MS = 24 * 60 * 60 * 1000;

export function updatedPeriodRange(period: UpdatedPeriod, now: Date = new Date()): DateRange | undefined {
  if (period === 'all') return undefined;
  const days = UPDATED_PERIOD_DAYS[period];
  return { start: new Date(now.getTime() - (days * DAY_MS)), end: new Date(now.getTime()) };
}

export interface ListingOptions {
  query: string;
  filter: TermFilter;
  sortType: SortType;
  sortDirection: SortDirection;
}

export const DEFAULT_LISTING: ListingOptions = Object.freeze({
  query: '',
  filter: Object.freeze({}) as TermFilter,
  sortType: 'created',
  sortDirection: 'desc',
}) as ListingOptions;

const FULL_RANGE: NumberRange = { min: 1, max: 5 };

const isRangeActive = (range: NumberRange | undefined) => {
  if (!range) return false;
  return range.min > FULL_RANGE.min || range.max < FULL_RANGE.max;
};

export function isFilterActive(filter: TermFilter): boolean {
  const ranges = filter.ranges ?? {};
  if (RANGE_KEYS.some((key) => isRangeActive(ranges[key]))) return true;
  return Boolean(filter.created || filter.updated);
}

export function listTerms(terms: TermData[], options: Partial<ListingOptions> = {}): TermData[] {
  const { query, filter, sortType, sortDirection } = { ...DEFAULT_LISTING, ...options };
  if (!query.trim()) {
    const filtered = filterTerms(terms, filter);
    // 검색어가 없으면 관련도 대신 기본 정렬(등록일 내림차순)을 쓴다
    if (sortType === 'relevance') return sortTerms(filtered, DEFAULT_LISTING.sortType, DEFAULT_LISTING.sortDirection);
    return sortTerms(filtered, sortType, sortDirection);
  }

  const filtered = filterTerms(searchTerms(query, terms), filter);
  if (sortType === 'relevance') return sortDirection === 'asc' ? [...filtered].reverse() : filtered;
  return sortTerms(filtered, sortType, sortDirection);
}
