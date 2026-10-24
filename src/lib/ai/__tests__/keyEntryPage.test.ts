import { test } from 'node:test';
import assert from 'node:assert/strict';
import { keyPageHeaders, pickProvider, renderKeyEntryPage, safeReturnPath } from '../keyEntryPage';

test('돌아갈 경로는 같은 사이트 상대 경로만 허용한다', () => {
  assert.equal(safeReturnPath('/interview/ds/ml-fundamentals/machine-learning'), '/interview/ds/ml-fundamentals/machine-learning');
  for (const bad of ['//evil.example', 'https://evil.example', '/\\evil.example', 'javascript:alert(1)', '/a?b=1', '/a#x', '', null, 'x'.repeat(201)]) {
    assert.equal(safeReturnPath(bad), '/interview', String(bad));
  }
});

test('알 수 없는 회사는 Claude 로 둔다', () => {
  assert.equal(pickProvider('google'), 'google');
  assert.equal(pickProvider('evil'), 'anthropic');
});

test('페이지에는 스크립트가 없고 값은 이스케이프된다', () => {
  const html = renderKeyEntryPage({ provider: 'openai', returnTo: '/interview', csrf: '"><script>alert(1)</script>', nonce: 'n0nce', error: 'invalid_key' });
  assert.ok(!/<script/i.test(html));
  assert.ok(html.includes('&quot;&gt;&lt;script&gt;'));
  assert.ok(html.includes('value="openai" checked'));
  assert.ok(html.includes('type="password" name="apiKey"'));
  assert.ok(html.includes('action="/api/ai/keys/form"'));
  assert.ok(html.includes('API 키가 올바르지 않아요'));
});

test('보안 헤더: 스크립트 금지·프레임 금지·캐시 금지', () => {
  const headers = keyPageHeaders('abc');
  assert.match(headers['Content-Security-Policy'], /default-src 'none'/);
  assert.match(headers['Content-Security-Policy'], /frame-ancestors 'none'/);
  assert.match(headers['Content-Security-Policy'], /form-action 'self'/);
  assert.ok(!/script-src/.test(headers['Content-Security-Policy']));
  assert.equal(headers['X-Frame-Options'], 'DENY');
  assert.match(headers['Cache-Control'], /no-store/);
});
