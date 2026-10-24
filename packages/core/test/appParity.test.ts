import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { TermData } from '../src/types';
import { searchTerms } from '../src/search';
import { listTerms } from '../src/listing';
import { searchTerms as legacySearchTerms } from './legacy/search';

const repoRoot = path.resolve(__dirname, '../../../..');
const appTermsPath = path.join(repoRoot, 'public', 'data', 'terms.json');
const webTermsPath = path.join(repoRoot, 'src', 'data', 'terms.json');

const readJson = (file: string, hint: string): TermData[] => {
  if (!fs.existsSync(file)) throw new Error(`${ file } 가 없다. 루트에서 ${ hint } 를 먼저 실행한다.`);
  return JSON.parse(fs.readFileSync(file, 'utf8')) as TermData[];
};

const appTerms = readJson(appTermsPath, 'npm run export-public-data');
// 웹 fetchTermsData 와 같은 공개 필터
const webTerms = readJson(webTermsPath, 'npm run fetch-terms').filter((term) => term.publish !== false);
const ids = (list: TermData[]) => list.map((term) => term.id);

const QUERIES = [
  '데이터',
  '머신러닝',
  '딥러닝',
  '데이터 분석',
  '회귀',
  '임베딩',
  'data',
  'learning',
  'machine learning',
  'API',
  'ETL',
  'LLM',
  'pytorch',
  '파이프라인 data',
  '과대적합 overfitting',
  'A/B 테스트',
  'transfomer',
  'clasification',
  '모델',
  '데이',
];

test('앱 콘텐츠와 웹 콘텐츠의 공개 용어 id 집합·순서가 같다', () => {
  assert.ok(appTerms.length > 0);
  assert.deepEqual(ids(appTerms), ids(webTerms));
});

test(`앱(core searchTerms)과 웹(legacy) 검색 결과 id 순서가 같다 (검색어 ${ QUERIES.length }개)`, () => {
  assert.ok(QUERIES.length >= 12);
  let nonEmpty = 0;
  for (const query of QUERIES) {
    const app = ids(searchTerms(query, appTerms));
    const web = ids(legacySearchTerms(query, webTerms));
    if (web.length > 0) nonEmpty += 1;
    assert.deepEqual(app, web, `검색어 "${ query }"`);
  }
  assert.ok(nonEmpty >= 12, `결과가 있는 검색어가 12개 이상이어야 한다 (${ nonEmpty }개)`);
});

test('앱 listTerms 관련도 내림차순도 웹 검색 순서와 같다', () => {
  for (const query of QUERIES) {
    assert.deepEqual(
      ids(listTerms(appTerms, { query, sortType: 'relevance', sortDirection: 'desc' })),
      ids(legacySearchTerms(query, webTerms)),
      `검색어 "${ query }"`,
    );
  }
});
