import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { TermData, SortType, SortDirection } from '../src/types';
import { searchTerms } from '../src/search';
import { parseFilterQuery, filterTerms, sortTerms } from '../src/listing';
import { getRecommendedTerms } from '../src/recommend';
import { splitBlockMath, isBlockMath, parseMarkdownSegment } from '../src/markdown';
import { transformToSlug } from '../src/slug';
import { searchTerms as legacySearchTerms } from './legacy/search';
import { legacyFilterTerms, legacySortTerms } from './legacy/postList';
import { legacyRecommend } from './legacy/recommend';
import { splitBlocks as legacySplitBlocks, isBlockMathBlock as legacyIsBlockMath, parseMarkdownSegment as legacyParseMarkdownSegment } from './legacy/markdown';
import { transformToSlug as legacyTransformToSlug } from './legacy/filters';

const repoRoot = path.resolve(__dirname, '../../../..');
const termsPath = path.join(repoRoot, 'src', 'data', 'terms.json');

const loadTerms = (): TermData[] => {
  if (!fs.existsSync(termsPath)) {
    throw new Error(`${ termsPath } 가 없다. 루트에서 npm run fetch-terms 로 정적 데이터를 먼저 만든다.`);
  }
  const raw = JSON.parse(fs.readFileSync(termsPath, 'utf8')) as TermData[];
  // 웹 fetchTermsData 와 같은 공개 필터
  return raw.filter((term) => term.publish !== false);
};

const terms = loadTerms();
const ids = (list: TermData[]) => list.map((term) => term.id);

const QUERIES = [
  '데이터',
  '데이터 분석',
  '머신러닝',
  '딥러닝',
  '신경망',
  '학습',
  '모델',
  '트랜스포머',
  '임베딩',
  '군집화',
  '회귀',
  'data',
  'Data Lake',
  'learning',
  'machine learning',
  'neural',
  'API',
  'ETL',
  'MLOps',
  'K-Means',
  'A/B',
  'pytorch',
  'tensorflow',
  'transfomer',
  'clasification',
  'LLM',
  'RAG',
  'GPU',
  '파이프라인 data',
  '과대적합 overfitting',
  '추천',
  '검색 증강 생성',
  '벡터',
  'SQL',
  '통계',
  '수식',
  'x',
  'zzzzqqq',
  '  ',
  '경사',
];

const SORT_TYPES: SortType[] = ['relevance', 'updated', 'difficulty', 'created'];
const SORT_DIRECTIONS: SortDirection[] = ['asc', 'desc'];

const LISTING_QUERIES = ['', '데이터', 'learning', '모델 학습', 'zzzzqqq'];
const FILTER_PARAMS = [
  '',
  'level-0-4',
  'level-0-1',
  'level-2-4',
  'level-1-1',
  'ds-3-4',
  'de-0-2',
  'da-2-4',
  'level-1-3_ds-2-4',
  'level-0-4_ds-0-4_de-0-4_da-0-4',
  'level-2-3_de-3-4_da-0-1',
  'unknown-0-1',
  'level',
  'LEVEL-1-2',
];
const DATE_PARAMS: Array<{ p?: string; m?: string }> = [
  {},
  { p: '20241027-20250601' },
  { p: '20241027-' },
  { p: '20241027' },
  { p: '20250101-20261231' },
  { m: '20251001-20261231' },
  { m: '20261004' },
  { p: '20241001-20251231', m: '20250101-20261231' },
  { p: '-20250101' },
  { p: '2024' },
  { m: 'abcdefgh-' },
];

test('terms.json 이 있고 용어가 있다', () => {
  assert.ok(terms.length > 0);
});

test(`검색 결과 id 순서가 legacy 와 같다 (검색어 ${ QUERIES.length }개)`, () => {
  assert.ok(QUERIES.length >= 20);
  for (const query of QUERIES) {
    assert.deepEqual(ids(searchTerms(query, terms)), ids(legacySearchTerms(query, terms)), `검색어 "${ query }"`);
  }
});

test('웹 PostList 처럼 복사본 배열로 검색해도 결과 id 순서가 같다', () => {
  for (const query of QUERIES) {
    assert.deepEqual(ids(searchTerms(query, [...terms])), ids(legacySearchTerms(query, [...terms])), `검색어 "${ query }"`);
  }
});

test('검색·필터·정렬 조합 결과 id 순서가 legacy PostList 와 같다', () => {
  let combos = 0;
  for (const q of LISTING_QUERIES) {
    for (const f of FILTER_PARAMS) {
      for (const { p, m } of DATE_PARAMS) {
        const params = new URLSearchParams();
        if (q) params.set('q', q);
        if (f) params.set('f', f);
        if (p) params.set('p', p);
        if (m) params.set('m', m);

        const legacy = legacyFilterTerms(terms, params);
        assert.equal(legacy.sortTypeOverride, q ? 'relevance' : null);

        const searched = q ? searchTerms(q, terms) : terms;
        const filtered = filterTerms(searched, parseFilterQuery({ f: params.get('f'), p: params.get('p'), m: params.get('m') }));
        const label = `q="${ q }" ${ params.toString() }`;
        assert.deepEqual(ids(filtered), ids(legacy.filteredTerms), `필터 ${ label }`);

        for (const sortType of SORT_TYPES) {
          for (const sortDirection of SORT_DIRECTIONS) {
            assert.deepEqual(
              ids(sortTerms(filtered, sortType, sortDirection)),
              ids(legacySortTerms(legacy.filteredTerms, sortType, sortDirection)),
              `정렬 ${ sortType } ${ sortDirection } ${ label }`,
            );
            combos += 1;
          }
        }
      }
    }
  }
  assert.ok(combos > 0);
});

test('필터 결과가 비어 있지 않은 조합이 실제로 검사된다', () => {
  const nonEmpty = FILTER_PARAMS.filter((f) => f && filterTerms(terms, parseFilterQuery({ f })).length > 0);
  assert.ok(nonEmpty.length >= 5);
  const narrowed = FILTER_PARAMS.filter((f) => {
    const count = filterTerms(terms, parseFilterQuery({ f })).length;
    return f && count > 0 && count < terms.length;
  });
  assert.ok(narrowed.length >= 3);
  const dated = DATE_PARAMS.filter(({ p, m }) => {
    const count = filterTerms(terms, parseFilterQuery({ p, m })).length;
    return (p || m) && count > 0 && count < terms.length;
  });
  assert.ok(dated.length >= 3);
});

test('모든 용어의 추천 결과 id 순서가 legacy 와 같다', () => {
  for (const term of terms) {
    assert.deepEqual(ids(getRecommendedTerms(term, terms)), ids(legacyRecommend(term, terms)), `용어 ${ term.id }`);
  }
});

test('transformToSlug 결과가 legacy 와 같다', () => {
  const inputs = [
    'Hello World',
    'snake_case_text',
    '  여러   공백  ',
    'Mixed_Case Value\tTab',
    ...terms.flatMap((term) => [
      term.title?.en ?? '',
      term.title?.ko ?? '',
      ...(term.tags ?? []).map((tag) => tag.internal_link ?? ''),
      ...(term.terms ?? []).map((t) => t.internal_link ?? ''),
    ]),
  ];
  for (const input of inputs) {
    assert.equal(transformToSlug(input), legacyTransformToSlug(input), `입력 "${ input }"`);
  }
});

test('마크다운 블록 분리와 변환 결과가 legacy 와 같다', () => {
  const texts = terms.flatMap((term) => [
    term.description?.full,
    term.description?.short,
    term.difficulty?.description,
    term.usecase?.description,
    term.usecase?.example,
    term.relevance?.analyst?.description,
    term.relevance?.engineer?.description,
    term.relevance?.scientist?.description,
    ...(term.terms ?? []).map((t) => t.description),
  ]).filter((text): text is string => typeof text === 'string');
  texts.push(
    '| a | b |\n|---|---|\n| 1 | 2 |',
    '> 인용 1\n> 인용 2',
    '1. 하나\n2. 둘\n- 가\n- 나',
    '![그림](https://example.com/a.png)\n**굵게** *기울임* `코드` [링크](/posts/a) \\"따옴표\\"',
    '앞 $x$ 뒤\n$$\na^2 + b^2\n$$\n끝',
  );
  for (const text of texts) {
    const blocks = splitBlockMath(text);
    assert.deepEqual(blocks, legacySplitBlocks(text));
    for (const block of blocks) {
      assert.equal(isBlockMath(block), legacyIsBlockMath(block));
      assert.equal(parseMarkdownSegment(block), legacyParseMarkdownSegment(block));
    }
  }
});

test('검색 캐시: 길이가 같은 다른 배열이면 인덱스를 다시 만든다', () => {
  const marker = '캐시검증용고유단어';
  const changed = terms.map((term, i) => (i === 0 ? { ...term, title: { ...term.title, ko: marker } } : term));
  assert.equal(changed.length, terms.length);
  searchTerms('데이터', terms);
  const found = searchTerms(marker, changed);
  assert.equal(found[0]?.title?.ko, marker);
  assert.deepEqual(ids(searchTerms('데이터', terms)), ids(legacySearchTerms('데이터', terms)));
});
