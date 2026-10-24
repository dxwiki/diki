import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { TermData } from '../src/types';
import { transformToSlug } from '../src/slug';
import { getRecommendedTerms } from '../src/recommend';
import {
  DETAIL_SECTION_ORDER,
  findTermBySlug,
  slugFromUrl,
  classifyLink,
  getPrevNextTerms,
  getDetailSections,
} from '../src/detail';
import { legacyPrevNext, legacyLastTermId } from './legacy/prevNext';
import { legacyRecommend } from './legacy/recommend';

const repoRoot = path.resolve(__dirname, '../../../..');
const termsPath = path.join(repoRoot, 'public', 'data', 'terms.json');

const loadTerms = (): TermData[] => {
  if (!fs.existsSync(termsPath)) {
    throw new Error(`${ termsPath } 가 없다. 루트에서 npm run export-public-data 로 먼저 만든다.`);
  }
  return JSON.parse(fs.readFileSync(termsPath, 'utf8')) as TermData[];
};

const terms = loadTerms();
const ids = (list: TermData[]) => list.map((term) => term.id);
const WEB_ORIGINS = { webOrigins: ['https://www.diki.kr', 'https://diki.kr'] };

const fullTerm = (): TermData => ({
  id: 2,
  url: '/posts/full-term',
  title: { ko: '전체', en: 'Full Term', etc: ['별칭'] },
  description: { short: '짧은 설명', full: '본문' },
  difficulty: { level: 3, description: '난이도 설명' },
  relevance: {
    analyst: { score: 3, description: '분석가' },
    scientist: { score: 4, description: '과학자' },
    engineer: { score: 2, description: '엔지니어' },
  },
  tags: [{ name: '태그', internal_link: 'Some_Tag' }],
  terms: [{ term: '관련', description: '관련 설명', internal_link: 'Related_Term' }],
  usecase: { industries: ['금융'], description: '개요', example: '사례' },
  references: {
    tutorials: [{ title: '튜토리얼', external_link: 'https://example.com' }],
    books: [],
    academic: [],
    opensource: [],
  },
});

const sampleTerms = (): TermData[] => [
  { id: 1, url: '/posts/one', title: { ko: '하나', en: 'One' } },
  fullTerm(),
  { id: 3, url: '/posts/three', title: { ko: '셋', en: 'Three' } },
];

test('getDetailSections 는 웹 상세 순서를 내고 광고 섹션이 없다', () => {
  const list = sampleTerms();
  const types = getDetailSections(list[1], list).map((s) => s.type);
  assert.deepEqual(types, [
    'header', 'difficulty', 'description', 'relatedTerms', 'relevance', 'usecase', 'references', 'prevNext', 'recommendations',
  ]);
  assert.deepEqual(DETAIL_SECTION_ORDER, types);
  assert.ok(!(DETAIL_SECTION_ORDER as string[]).some((t) => ['ad', 'ads', 'advertisement'].includes(t)));
});

test('모든 실제 용어의 섹션은 DETAIL_SECTION_ORDER 순서를 지킨다', () => {
  terms.forEach((term) => {
    const types = getDetailSections(term, terms).map((s) => s.type);
    const positions = types.map((t) => DETAIL_SECTION_ORDER.indexOf(t));
    assert.ok(positions.every((p) => p >= 0), `${ term.id } 알 수 없는 섹션`);
    assert.deepEqual(positions, [...positions].sort((a, b) => a - b), `${ term.id } 순서`);
    assert.equal(types[0], 'header');
  });
});

test('빈 섹션은 뺀다 (REQ-025)', () => {
  const list = sampleTerms();
  const base = fullTerm();
  const cases: Array<[string, Partial<TermData>]> = [
    ['difficulty', { difficulty: { level: 0, description: '설명' } }],
    ['description', { description: { short: '짧은', full: '  ' } }],
    ['relatedTerms', { terms: [] }],
    ['relevance', { relevance: {} }],
    ['usecase', { usecase: { industries: [], description: '', example: '' } }],
    ['references', { references: { tutorials: [], books: undefined, academic: [], opensource: [] } }],
  ];
  cases.forEach(([type, patch]) => {
    const term = { ...base, ...patch };
    const types = getDetailSections(term, [list[0], term, list[2]]).map((s) => s.type);
    assert.ok(!types.includes(type as never), `${ type } 가 빠져야 한다`);
    assert.equal(types.length, DETAIL_SECTION_ORDER.length - 1, `${ type } 만 빠져야 한다`);
  });

  const bare: TermData = { id: 9, title: { ko: '빈', en: 'Bare' } };
  // legacy 규칙대로 용어가 하나뿐이면 이전 용어가 자기 자신이다
  assert.deepEqual(getDetailSections(bare, [bare]).map((s) => s.type), ['header', 'prevNext']);
  assert.deepEqual(getDetailSections({ title: { ko: 'x' } }, []).map((s) => s.type), ['header']);
});

test('섹션 데이터: 태그·관련 용어 slug, 연관도 순서', () => {
  const list = sampleTerms();
  const sections = getDetailSections(list[1], list);
  const header = sections.find((s) => s.type === 'header');
  assert.ok(header && header.type === 'header');
  assert.deepEqual(header.tags, [{ name: '태그', slug: 'some-tag' }]);
  assert.equal(header.shortDescription, '짧은 설명');
  const related = sections.find((s) => s.type === 'relatedTerms');
  assert.ok(related && related.type === 'relatedTerms');
  assert.equal(related.items[0].slug, 'related-term');
  const relevance = sections.find((s) => s.type === 'relevance');
  assert.ok(relevance && relevance.type === 'relevance');
  assert.deepEqual(relevance.items.map((i) => i.role), ['analyst', 'scientist', 'engineer']);
});

test(`getPrevNextTerms 가 legacy PrevNextSection 과 같다 (용어 ${ terms.length }개)`, () => {
  const lastTermId = legacyLastTermId(terms);
  terms.forEach((term) => {
    const actual = getPrevNextTerms(term, terms);
    const expected = legacyPrevNext(terms, term.id as number, lastTermId);
    assert.equal(actual.prev?.id, expected.prevTerm?.id, `${ term.id } 이전`);
    assert.equal(actual.next?.id, expected.nextTerm?.id, `${ term.id } 다음`);
  });
  const list = sampleTerms();
  assert.deepEqual(ids([getPrevNextTerms(list[0], list).prev as TermData]), [3]);
  assert.deepEqual(ids([getPrevNextTerms(list[2], list).next as TermData]), [1]);
});

test(`getRecommendedTerms 와 recommendations 섹션이 legacy RecommendationSection 과 같다 (용어 ${ terms.length }개)`, () => {
  terms.forEach((term) => {
    const expected = ids(legacyRecommend(term, terms));
    assert.deepEqual(ids(getRecommendedTerms(term, terms)), expected, `${ term.id }`);
    const section = getDetailSections(term, terms).find((s) => s.type === 'recommendations');
    assert.ok(section && section.type === 'recommendations');
    assert.deepEqual(ids(section.terms), expected, `${ term.id } 섹션`);
    const prevNext = getDetailSections(term, terms).find((s) => s.type === 'prevNext');
    assert.ok(prevNext && prevNext.type === 'prevNext');
  });
});

test('findTermBySlug 는 웹 slug 로 찾고 없는 slug 에 null 을 준다 (REQ-024)', () => {
  terms.forEach((term) => {
    const slug = transformToSlug(term.title?.en ?? '');
    assert.equal(findTermBySlug(terms, slug)?.id, term.id, slug);
    assert.equal(findTermBySlug(terms, slugFromUrl(term.url)), term, term.url);
  });
  assert.equal(findTermBySlug(terms, 'no-such-term-slug'), null);
  assert.equal(findTermBySlug(terms, ''), null);
  assert.equal(findTermBySlug(terms, undefined), null);
  assert.equal(findTermBySlug([], 'ab-testing'), null);
});

test('slugFromUrl 은 /posts/<slug> 경로만 받는다', () => {
  assert.equal(slugFromUrl('/posts/ab-testing'), 'ab-testing');
  assert.equal(slugFromUrl('/posts/ab-testing/'), 'ab-testing');
  assert.equal(slugFromUrl('/posts/ab-testing?x=1#top'), 'ab-testing');
  assert.equal(slugFromUrl('https://www.diki.kr/posts/ab-testing'), 'ab-testing');
  assert.equal(slugFromUrl('/posts/%ED%95%9C%EA%B8%80'), '한글');
  assert.equal(slugFromUrl('/posts/'), null);
  assert.equal(slugFromUrl('/posts/a/b'), null);
  assert.equal(slugFromUrl('/about'), null);
  assert.equal(slugFromUrl(''), null);
  assert.equal(slugFromUrl(undefined), null);
});

test('classifyLink 는 내부·외부 링크를 나눈다 (REQ-023)', () => {
  assert.deepEqual(classifyLink('/posts/ab-testing', WEB_ORIGINS), { type: 'internal', slug: 'ab-testing' });
  assert.deepEqual(classifyLink('https://www.diki.kr/posts/ab-testing', WEB_ORIGINS), { type: 'internal', slug: 'ab-testing' });
  assert.deepEqual(classifyLink('https://diki.kr/posts/ab-testing/', WEB_ORIGINS), { type: 'internal', slug: 'ab-testing' });
  assert.deepEqual(classifyLink('HTTPS://WWW.DIKI.KR/posts/ab-testing', WEB_ORIGINS), { type: 'internal', slug: 'ab-testing' });
  assert.deepEqual(classifyLink('model-evaluation-metrics', WEB_ORIGINS), { type: 'internal', slug: 'model-evaluation-metrics' });
  assert.deepEqual(classifyLink('./overfitting', WEB_ORIGINS), { type: 'internal', slug: 'overfitting' });
  assert.deepEqual(classifyLink('../posts/overfitting', WEB_ORIGINS), { type: 'internal', slug: 'overfitting' });
  assert.deepEqual(classifyLink('/posts/ab-testing'), { type: 'internal', slug: 'ab-testing' });

  assert.deepEqual(classifyLink('https://example.com/posts/ab-testing', WEB_ORIGINS), { type: 'external', url: 'https://example.com/posts/ab-testing' });
  assert.deepEqual(classifyLink('http://incompleteideas.net/book', WEB_ORIGINS), { type: 'external', url: 'http://incompleteideas.net/book' });
  assert.deepEqual(classifyLink('https://www.diki.kr/', WEB_ORIGINS), { type: 'external', url: 'https://www.diki.kr/' });
  assert.deepEqual(classifyLink('https://diki.kr.evil.com/posts/x', WEB_ORIGINS), { type: 'external', url: 'https://diki.kr.evil.com/posts/x' });
  assert.deepEqual(classifyLink('/about', WEB_ORIGINS), { type: 'external', url: 'https://www.diki.kr/about' });

  assert.deepEqual(classifyLink('#section', WEB_ORIGINS), { type: 'none' });
  assert.deepEqual(classifyLink('', WEB_ORIGINS), { type: 'none' });
  assert.deepEqual(classifyLink(undefined, WEB_ORIGINS), { type: 'none' });
  assert.deepEqual(classifyLink('javascript:alert(1)', WEB_ORIGINS), { type: 'none' });
});

test('실제 데이터의 url·관련 용어·태그 링크는 internal, 참고 자료는 external 이다', () => {
  terms.forEach((term) => {
    const target = classifyLink(term.url, WEB_ORIGINS);
    assert.equal(target.type, 'internal', term.url);
    [...(term.terms ?? []), ...(term.tags ?? [])].forEach((item) => {
      if (!item.internal_link) return;
      const linkTarget = classifyLink(transformToSlug(item.internal_link), WEB_ORIGINS);
      assert.equal(linkTarget.type, 'internal', item.internal_link);
    });
    const refs = term.references;
    [...(refs?.tutorials ?? []), ...(refs?.books ?? []), ...(refs?.academic ?? []), ...(refs?.opensource ?? [])].forEach((ref) => {
      if (!ref.external_link || ref.external_link === '#') return;
      assert.equal(classifyLink(ref.external_link, WEB_ORIGINS).type, 'external', ref.external_link);
    });
  });
});
