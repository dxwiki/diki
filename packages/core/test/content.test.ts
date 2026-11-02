import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { TermData } from '../src/types';
import {
  ContentVersion,
  validateContentVersion,
  validateTermsPayload,
  VERSION_CHECK_INTERVAL_MS,
  shouldCheckVersion,
  pickInitialContent,
  syncContent,
} from '../src/content';

const repoRoot = path.resolve(__dirname, '../../../..');
const BASE = 'https://example.test';

const makeTerm = (id: number): TermData => ({
  id,
  url: `/posts/term-${ id }`,
  title: { ko: `용어${ id }`, en: `term${ id }` },
} as TermData);

const makeTerms = (n: number) => Array.from({ length: n }, (_, i) => makeTerm(i + 1));

const makeVersion = (contentVersion: string, generatedAt: string, termCount: number): ContentVersion => ({
  contentVersion,
  generatedAt,
  termCount,
  minAppVersion: '1.0.0',
});

const bundledVersion = makeVersion('bundled0000000000', '2026-10-01T00:00:00.000Z', 3);
const bundled = { terms: makeTerms(3), version: bundledVersion };

interface FakeOptions {
  version?: unknown;
  terms?: unknown;
  versionError?: boolean;
  termsError?: boolean;
  saveError?: boolean;
}

const fake = (opts: FakeOptions) => {
  const calls: string[] = [];
  const saved: { terms: TermData[]; version: ContentVersion }[] = [];
  const fetchJson = async (url: string): Promise<unknown> => {
    calls.push(url);
    if (url === `${ BASE }/data/version.json`) {
      if (opts.versionError) throw new Error('network');
      return opts.version;
    }
    if (url === `${ BASE }/data/terms.json`) {
      if (opts.termsError) throw new Error('download');
      return opts.terms;
    }
    throw new Error(`unexpected url ${ url }`);
  };
  const saveContent = async (terms: TermData[], version: ContentVersion) => {
    if (opts.saveError) throw new Error('disk full');
    saved.push({ terms, version });
  };
  return { calls, saved, fetchJson, saveContent };
};

test('VERSION_CHECK_INTERVAL_MS 는 1시간이다', () => {
  assert.equal(VERSION_CHECK_INTERVAL_MS, 3600000);
});

test('launch 는 첫 확인이면 항상 확인한다', () => {
  assert.equal(shouldCheckVersion('launch', null, 1000), true);
  assert.equal(shouldCheckVersion('launch', 1000, 1000), true);
});

test('foreground 는 1시간 미만이면 확인하지 않고 이상이면 확인한다', () => {
  const last = 10_000_000;
  assert.equal(shouldCheckVersion('foreground', last, last + VERSION_CHECK_INTERVAL_MS - 1), false);
  assert.equal(shouldCheckVersion('foreground', last, last + 1000), false);
  assert.equal(shouldCheckVersion('foreground', last, last + VERSION_CHECK_INTERVAL_MS), true);
  assert.equal(shouldCheckVersion('foreground', last, last + VERSION_CHECK_INTERVAL_MS * 2), true);
  assert.equal(shouldCheckVersion('foreground', null, last), true);
});

test('validateContentVersion 은 올바른 형식만 받는다', () => {
  assert.deepEqual(validateContentVersion(bundledVersion), bundledVersion);
  assert.equal(validateContentVersion(null), null);
  assert.equal(validateContentVersion([]), null);
  assert.equal(validateContentVersion('x'), null);
  assert.equal(validateContentVersion({ ...bundledVersion, contentVersion: '' }), null);
  assert.equal(validateContentVersion({ ...bundledVersion, generatedAt: 'not-a-date' }), null);
  assert.equal(validateContentVersion({ ...bundledVersion, termCount: '3' }), null);
  assert.equal(validateContentVersion({ ...bundledVersion, termCount: -1 }), null);
  assert.equal(validateContentVersion({ ...bundledVersion, termCount: 1.5 }), null);
  const { minAppVersion: _omit, ...noMin } = bundledVersion;
  assert.equal(validateContentVersion(noMin), null);
});

test('validateTermsPayload 는 배열 아님·길이 불일치·필수 필드 누락을 거부한다', () => {
  const v = makeVersion('a', '2026-10-02T00:00:00.000Z', 2);
  assert.deepEqual(validateTermsPayload(makeTerms(2), v), makeTerms(2));
  assert.equal(validateTermsPayload({ 0: makeTerm(1) }, v), null);
  assert.equal(validateTermsPayload(null, v), null);
  assert.equal(validateTermsPayload(makeTerms(3), v), null);
  assert.equal(validateTermsPayload(makeTerms(1), v), null);
  const noId = { url: '/posts/x', title: { ko: 'x', en: 'x' } };
  const strId = { id: '1', url: '/posts/x', title: { ko: 'x', en: 'x' } };
  const noUrl = { id: 1, title: { ko: 'x', en: 'x' } };
  const noTitle = { id: 1, url: '/posts/x' };
  const noKo = { id: 1, url: '/posts/x', title: { en: 'x' } };
  const noEn = { id: 1, url: '/posts/x', title: { ko: 'x' } };
  for (const bad of [noId, strId, noUrl, noTitle, noKo, noEn, null, 'x']) {
    assert.equal(validateTermsPayload([makeTerm(1), bad], v), null, JSON.stringify(bad));
  }
});

test('공개 데이터 public/data 가 있으면 형식 검사를 통과한다', (t) => {
  const versionPath = path.join(repoRoot, 'public', 'data', 'version.json');
  const termsPath = path.join(repoRoot, 'public', 'data', 'terms.json');
  if (!fs.existsSync(versionPath) || !fs.existsSync(termsPath)) {
    t.skip('public/data 가 없다');
    return;
  }
  const version = validateContentVersion(JSON.parse(fs.readFileSync(versionPath, 'utf8')));
  assert.ok(version);
  const terms = validateTermsPayload(JSON.parse(fs.readFileSync(termsPath, 'utf8')), version);
  assert.ok(terms);
  assert.equal(terms.length, version.termCount);
});

test('syncContent: 같은 버전이면 terms 를 받지 않고 up-to-date', async () => {
  const f = fake({ version: bundledVersion });
  const result = await syncContent({ baseUrl: BASE, current: bundledVersion, fetchJson: f.fetchJson, saveContent: f.saveContent });
  assert.equal(result.status, 'up-to-date');
  assert.deepEqual(f.calls, [`${ BASE }/data/version.json`]);
  assert.equal(f.saved.length, 0);
});

test('syncContent: 새 버전이면 terms 를 받아 검사 후 저장하고 updated', async () => {
  const next = makeVersion('next000000000000', '2026-10-10T00:00:00.000Z', 4);
  const nextTerms = makeTerms(4);
  const f = fake({ version: next, terms: nextTerms });
  const result = await syncContent({ baseUrl: `${ BASE }/`, current: bundledVersion, fetchJson: f.fetchJson, saveContent: f.saveContent });
  assert.equal(result.status, 'updated');
  if (result.status !== 'updated') return;
  assert.deepEqual(result.version, next);
  assert.deepEqual(result.terms, nextTerms);
  assert.deepEqual(f.calls, [`${ BASE }/data/version.json`, `${ BASE }/data/terms.json`]);
  assert.equal(f.saved.length, 1);
  assert.deepEqual(f.saved[0].version, next);
  assert.deepEqual(f.saved[0].terms, nextTerms);
});

test('syncContent: current 가 없으면 새 콘텐츠를 받는다', async () => {
  const f = fake({ version: bundledVersion, terms: makeTerms(3) });
  const result = await syncContent({ baseUrl: BASE, current: null, fetchJson: f.fetchJson, saveContent: f.saveContent });
  assert.equal(result.status, 'updated');
});

test('syncContent: version 네트워크 오류면 failed 이고 throw 하지 않는다', async () => {
  const f = fake({ versionError: true });
  const result = await syncContent({ baseUrl: BASE, current: bundledVersion, fetchJson: f.fetchJson, saveContent: f.saveContent });
  assert.equal(result.status, 'failed');
  if (result.status === 'failed') assert.equal(result.stage, 'version-fetch');
  assert.equal(f.saved.length, 0);
});

test('syncContent: version 형식이 잘못되면 failed', async () => {
  const f = fake({ version: { contentVersion: 1 } });
  const result = await syncContent({ baseUrl: BASE, current: bundledVersion, fetchJson: f.fetchJson, saveContent: f.saveContent });
  assert.equal(result.status, 'failed');
  if (result.status === 'failed') assert.equal(result.stage, 'version-invalid');
  assert.deepEqual(f.calls, [`${ BASE }/data/version.json`]);
});

test('syncContent: terms 다운로드 실패면 failed 이고 저장하지 않는다', async () => {
  const next = makeVersion('next', '2026-10-10T00:00:00.000Z', 2);
  const f = fake({ version: next, termsError: true });
  const result = await syncContent({ baseUrl: BASE, current: bundledVersion, fetchJson: f.fetchJson, saveContent: f.saveContent });
  assert.equal(result.status, 'failed');
  if (result.status === 'failed') assert.equal(result.stage, 'terms-fetch');
  assert.equal(f.saved.length, 0);
});

test('syncContent: terms 형식 검사 실패(배열 아님·길이 불일치·필수 필드 누락)면 failed', async () => {
  const next = makeVersion('next', '2026-10-10T00:00:00.000Z', 2);
  const cases: unknown[] = [
    { terms: makeTerms(2) },
    makeTerms(3),
    [makeTerm(1), { id: 2, url: '/posts/b' }],
  ];
  for (const terms of cases) {
    const f = fake({ version: next, terms });
    const result = await syncContent({ baseUrl: BASE, current: bundledVersion, fetchJson: f.fetchJson, saveContent: f.saveContent });
    assert.equal(result.status, 'failed');
    if (result.status === 'failed') assert.equal(result.stage, 'terms-invalid');
    assert.equal(f.saved.length, 0);
  }
});

test('syncContent: 저장 실패면 failed', async () => {
  const next = makeVersion('next', '2026-10-10T00:00:00.000Z', 2);
  const f = fake({ version: next, terms: makeTerms(2), saveError: true });
  const result = await syncContent({ baseUrl: BASE, current: bundledVersion, fetchJson: f.fetchJson, saveContent: f.saveContent });
  assert.equal(result.status, 'failed');
  if (result.status === 'failed') assert.equal(result.stage, 'save');
});

test('syncContent: 주입 함수가 동기로 throw 해도 failed 로 반환한다', async () => {
  const result = await syncContent({
    baseUrl: BASE,
    current: bundledVersion,
    fetchJson: () => {
      throw new Error('sync throw');
    },
    saveContent: async () => undefined,
  });
  assert.equal(result.status, 'failed');
  const broken = await syncContent({
    baseUrl: undefined as unknown as string,
    current: bundledVersion,
    fetchJson: async () => bundledVersion,
    saveContent: async () => undefined,
  });
  assert.equal(broken.status, 'failed');
});

test('pickInitialContent: 저장본이 없으면 설치본', () => {
  const picked = pickInitialContent(bundled, null);
  assert.equal(picked.source, 'bundled');
  assert.equal(picked.terms, bundled.terms);
  assert.equal(picked.version, bundled.version);
});

test('pickInitialContent: 저장본이 깨졌으면 설치본', () => {
  const newer = makeVersion('newer', '2026-10-10T00:00:00.000Z', 2);
  const brokenCases = [
    { terms: makeTerms(2), version: null },
    { terms: makeTerms(2), version: { contentVersion: 'x' } },
    { terms: 'garbage', version: newer },
    { terms: makeTerms(5), version: newer },
    { terms: [makeTerm(1), { id: 2 }], version: newer },
    { terms: undefined, version: undefined },
  ];
  for (const stored of brokenCases) {
    assert.equal(pickInitialContent(bundled, stored).source, 'bundled', JSON.stringify(stored).slice(0, 80));
  }
});

test('pickInitialContent: 저장본이 설치본보다 새로우면 저장본, 같거나 오래되면 설치본', () => {
  const newer = makeVersion('newer', '2026-10-10T00:00:00.000Z', 2);
  const picked = pickInitialContent(bundled, { terms: makeTerms(2), version: newer });
  assert.equal(picked.source, 'downloaded');
  assert.equal(picked.terms.length, 2);
  assert.deepEqual(picked.version, newer);

  const same = makeVersion('same', bundledVersion.generatedAt, 2);
  assert.equal(pickInitialContent(bundled, { terms: makeTerms(2), version: same }).source, 'bundled');
  const older = makeVersion('older', '2026-09-01T00:00:00.000Z', 2);
  assert.equal(pickInitialContent(bundled, { terms: makeTerms(2), version: older }).source, 'bundled');
});
