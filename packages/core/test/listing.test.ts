import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { TermData, SortType, SortDirection } from '../src/types';
import { searchTerms } from '../src/search';
import {
  filterTerms,
  sortTerms,
  listTerms,
  isFilterActive,
  DEFAULT_LISTING,
  updatedPeriodRange,
  UPDATED_PERIODS,
  ListingOptions,
} from '../src/listing';

const repoRoot = path.resolve(__dirname, '../../../..');
const termsPath = path.join(repoRoot, 'public', 'data', 'terms.json');

const loadTerms = (): TermData[] => {
  if (!fs.existsSync(termsPath)) {
    throw new Error(`${ termsPath } 가 없다. 루트에서 npm run export-public-data 로 먼저 만든다.`);
  }
  return JSON.parse(fs.readFileSync(termsPath, 'utf8')) as TermData[];
};

const realTerms = loadTerms();
const ids = (list: TermData[]) => list.map((term) => term.id);

const NOW = new Date('2026-10-19T00:00:00.000Z');
const daysAgo = (days: number) => new Date(NOW.getTime() - days * 24 * 60 * 60 * 1000).toISOString();

const makeTerm = (id: number, level: number, createdDaysAgo: number, updatedDaysAgo: number, ko: string, en: string): TermData => ({
  id,
  url: `/posts/${ en.toLowerCase().replace(/\s+/g, '-') }`,
  title: { ko, en },
  description: { short: `${ ko } 설명`, full: `${ ko } ${ en } 본문` },
  difficulty: { level, description: '' },
  metadata: { created_at: daysAgo(createdDaysAgo), updated_at: daysAgo(updatedDaysAgo) },
} as TermData);

const TERMS: TermData[] = [
  makeTerm(1, 1, 400, 3, '데이터 레이크', 'Data Lake'),
  makeTerm(2, 3, 300, 20, '데이터 웨어하우스', 'Data Warehouse'),
  makeTerm(3, 5, 200, 60, '머신러닝', 'Machine Learning'),
  makeTerm(4, 2, 100, 200, '딥러닝', 'Deep Learning'),
  makeTerm(5, 4, 50, 500, '데이터 파이프라인', 'Data Pipeline'),
  makeTerm(6, 3, 10, 1, '회귀 분석', 'Regression'),
];

const byCreated = (list: TermData[], dir: SortDirection) => [...list].sort((a, b) => {
  const diff = new Date(a.metadata!.created_at!).getTime() - new Date(b.metadata!.created_at!).getTime();
  return dir === 'asc' ? diff : -diff;
});

test('검색어가 없으면 전체 목록을 등록일 내림차순으로 돌려준다', () => {
  const result = listTerms(realTerms);
  assert.equal(result.length, realTerms.length);
  assert.deepEqual(ids(result), ids(sortTerms(realTerms, 'created', 'desc')));
  assert.deepEqual(ids(listTerms(TERMS)), [6, 5, 4, 3, 2, 1]);
  assert.deepEqual(ids(listTerms(TERMS, { sortType: 'relevance', sortDirection: 'asc' })), [6, 5, 4, 3, 2, 1]);
  assert.deepEqual(ids(byCreated(TERMS, 'desc')), [6, 5, 4, 3, 2, 1]);
});

test('검색어가 없을 때 수정일·난이도·등록일 오름·내림 정렬은 sortTerms 와 같다', () => {
  const types: SortType[] = ['updated', 'difficulty', 'created'];
  const dirs: SortDirection[] = ['asc', 'desc'];
  for (const sortType of types) {
    for (const sortDirection of dirs) {
      assert.deepEqual(
        ids(listTerms(realTerms, { sortType, sortDirection })),
        ids(sortTerms(realTerms, sortType, sortDirection)),
        `${ sortType } ${ sortDirection }`,
      );
    }
  }
  assert.deepEqual(ids(listTerms(TERMS, { sortType: 'updated', sortDirection: 'desc' })), [6, 1, 2, 3, 4, 5]);
  assert.deepEqual(ids(listTerms(TERMS, { sortType: 'updated', sortDirection: 'asc' })), [5, 4, 3, 2, 1, 6]);
  assert.deepEqual(ids(listTerms(TERMS, { sortType: 'difficulty', sortDirection: 'asc' })), [1, 4, 2, 6, 5, 3]);
  assert.deepEqual(ids(listTerms(TERMS, { sortType: 'difficulty', sortDirection: 'desc' })), [3, 5, 6, 2, 4, 1]);
  assert.deepEqual(ids(listTerms(TERMS, { sortType: 'created', sortDirection: 'asc' })), [1, 2, 3, 4, 5, 6]);
  assert.deepEqual(ids(listTerms(TERMS, { sortType: 'created', sortDirection: 'desc' })), [6, 5, 4, 3, 2, 1]);
});

test('검색어가 있으면 4개 정렬 기준 × 오름·내림이 검색 → 필터 → 정렬 순서로 계산된다', () => {
  const queries = ['데이터', 'learning', 'data'];
  const types: SortType[] = ['relevance', 'updated', 'difficulty', 'created'];
  const dirs: SortDirection[] = ['asc', 'desc'];
  for (const query of queries) {
    const searched = searchTerms(query, realTerms);
    assert.ok(searched.length > 1, `${ query } 검색 결과가 2개 이상이어야 한다`);
    for (const sortType of types) {
      for (const sortDirection of dirs) {
        const result = ids(listTerms(realTerms, { query, sortType, sortDirection }));
        let expected: (number | undefined)[];
        if (sortType === 'relevance') {
          expected = sortDirection === 'desc' ? ids(searched) : ids(searched).reverse();
        } else {
          expected = ids(sortTerms(searched, sortType, sortDirection));
        }
        assert.deepEqual(result, expected, `${ query } ${ sortType } ${ sortDirection }`);
      }
    }
  }
});

test('관련도 내림차순은 검색 순서, 오름차순은 그 역순이다', () => {
  const searched = ids(searchTerms('데이터', TERMS));
  assert.ok(searched.length >= 3);
  assert.deepEqual(ids(listTerms(TERMS, { query: '데이터', sortType: 'relevance', sortDirection: 'desc' })), searched);
  assert.deepEqual(ids(listTerms(TERMS, { query: '데이터', sortType: 'relevance', sortDirection: 'asc' })), [...searched].reverse());
});

test('난이도 범위 필터', () => {
  const filter = { ranges: { LEVEL: { min: 2, max: 4 } } };
  const result = listTerms(TERMS, { filter, sortType: 'created', sortDirection: 'asc' });
  assert.deepEqual(ids(result), [2, 4, 5, 6]);
  assert.ok(result.every((term) => (term.difficulty?.level ?? 0) >= 2 && (term.difficulty?.level ?? 0) <= 4));
  assert.deepEqual(ids(listTerms(TERMS, { filter: { ranges: { LEVEL: { min: 5, max: 5 } } } })), [3]);
  assert.deepEqual(ids(listTerms(realTerms, { filter })), ids(sortTerms(filterTerms(realTerms, filter), 'created', 'desc')));
});

test('수정일 기간 프리셋', () => {
  assert.deepEqual(UPDATED_PERIODS, ['all', '7d', '30d', '90d', '1y']);
  assert.equal(updatedPeriodRange('all', NOW), undefined);

  const range7 = updatedPeriodRange('7d', NOW)!;
  assert.equal(range7.end!.getTime(), NOW.getTime());
  assert.equal(NOW.getTime() - range7.start.getTime(), 7 * 24 * 60 * 60 * 1000);
  assert.equal(NOW.getTime() - updatedPeriodRange('1y', NOW)!.start.getTime(), 365 * 24 * 60 * 60 * 1000);

  const expected: Record<string, number[]> = {
    all: [6, 5, 4, 3, 2, 1],
    '7d': [6, 1],
    '30d': [6, 2, 1],
    '90d': [6, 3, 2, 1],
    '1y': [6, 4, 3, 2, 1],
  };
  for (const period of UPDATED_PERIODS) {
    const updated = updatedPeriodRange(period, NOW);
    const filter = updated ? { updated } : {};
    assert.deepEqual(ids(listTerms(TERMS, { filter })), expected[period], period);
  }
});

test('검색 + 필터 + 정렬 조합', () => {
  const filter = { ranges: { LEVEL: { min: 1, max: 4 } }, updated: updatedPeriodRange('1y', NOW)! };
  const result = listTerms(TERMS, { query: '데이터', filter, sortType: 'difficulty', sortDirection: 'desc' });
  assert.deepEqual(ids(result), [2, 1]);

  const realFilter = { ranges: { LEVEL: { min: 2, max: 4 } } };
  for (const query of ['데이터', 'model']) {
    const expected = sortTerms(filterTerms(searchTerms(query, realTerms), realFilter), 'updated', 'asc');
    assert.deepEqual(ids(listTerms(realTerms, { query, filter: realFilter, sortType: 'updated', sortDirection: 'asc' })), ids(expected), query);
  }
});

test('결과 0개', () => {
  assert.deepEqual(listTerms(TERMS, { filter: { ranges: { LEVEL: { min: 5, max: 5 } }, updated: updatedPeriodRange('7d', NOW)! } }), []);
  assert.deepEqual(listTerms(TERMS, { query: '데이터', filter: { ranges: { LEVEL: { min: 5, max: 5 } } } }), []);
  assert.deepEqual(listTerms(realTerms, { query: 'zzqqxxkkwwvv' }), []);
});

test('isFilterActive 와 DEFAULT_LISTING 초기화', () => {
  assert.equal(isFilterActive({}), false);
  assert.equal(isFilterActive({ ranges: {} }), false);
  assert.equal(isFilterActive({ ranges: { LEVEL: { min: 1, max: 5 } } }), false);
  assert.equal(isFilterActive({ ranges: { LEVEL: { min: 2, max: 5 } } }), true);
  assert.equal(isFilterActive({ ranges: { LEVEL: { min: 1, max: 4 } } }), true);
  assert.equal(isFilterActive({ updated: updatedPeriodRange('30d', NOW)! }), true);

  assert.deepEqual(DEFAULT_LISTING, { query: '', filter: {}, sortType: 'created', sortDirection: 'desc' });
  assert.equal(isFilterActive(DEFAULT_LISTING.filter), false);

  const narrowed: ListingOptions = {
    query: '데이터',
    filter: { ranges: { LEVEL: { min: 5, max: 5 } } },
    sortType: 'relevance',
    sortDirection: 'asc',
  };
  assert.equal(listTerms(TERMS, narrowed).length, 0);
  const reset: ListingOptions = { ...DEFAULT_LISTING };
  assert.deepEqual(ids(listTerms(TERMS, reset)), [6, 5, 4, 3, 2, 1]);
  assert.deepEqual(ids(listTerms(realTerms, reset)), ids(listTerms(realTerms)));
});

test('낱자모만 입력하면 전체가 아니라 실제로 포함한 용어만 찾는다', () => {
  assert.equal(searchTerms('ㅇㅁㅅㅁ', TERMS).length, 0);
  assert.equal(searchTerms('ㄷ', TERMS).length, 0);
  assert.ok(searchTerms('데이터', TERMS).length >= 3);
});
