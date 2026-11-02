import { test } from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import { AiRequestError, assertRateLimit, assertSameOrigin, readJsonBody } from '../guard';

const request = (headers: Record<string, string>, method = 'POST', body?: string) =>
  new NextRequest('https://www.diki.kr/api/ai/keys', { method, headers: { host: 'www.diki.kr', ...headers }, body });

const code = (fn: ()=> unknown) => {
  try {
    fn();
    return null;
  } catch (error) {
    return error instanceof AiRequestError ? error.code : 'other';
  }
};

test('같은 출처 + 전용 헤더만 통과한다', () => {
  assert.equal(code(() => assertSameOrigin(request({ origin: 'https://www.diki.kr', 'x-diki-ai': '1', 'sec-fetch-site': 'same-origin' }))), null);
  assert.equal(code(() => assertSameOrigin(request({ origin: 'https://www.diki.kr' }))), 'forbidden');
  assert.equal(code(() => assertSameOrigin(request({ origin: 'https://evil.example', 'x-diki-ai': '1' }))), 'forbidden');
  assert.equal(code(() => assertSameOrigin(request({ 'x-diki-ai': '1' }))), 'forbidden');
  assert.equal(code(() => assertSameOrigin(request({ origin: 'https://www.diki.kr', 'x-diki-ai': '1', 'sec-fetch-site': 'cross-site' }))), 'forbidden');
  assert.equal(code(() => assertSameOrigin(request({ 'x-diki-ai': '1' }, 'GET'))), null);
});

test('JSON 본문: 형식·크기 제한', async () => {
  const ok = await readJsonBody(request({ 'content-type': 'application/json' }, 'POST', '{"a":1}'));
  assert.deepEqual(ok, { a: 1 });
  await assert.rejects(readJsonBody(request({ 'content-type': 'text/plain' }, 'POST', '{}')), AiRequestError);
  await assert.rejects(readJsonBody(request({ 'content-type': 'application/json' }, 'POST', '[1]')), AiRequestError);
  await assert.rejects(readJsonBody(request({ 'content-type': 'application/json' }, 'POST', `{"a":"${ 'x'.repeat(17000) }"}`)), AiRequestError);
});

test('빈도 제한: 창 안에서 한도를 넘으면 막고 창이 지나면 풀린다', () => {
  const now = 1_000_000;
  for (let i = 0; i < 3; i++) assertRateLimit('t', 'fp', 3, 60_000, now + i);
  assert.equal(code(() => assertRateLimit('t', 'fp', 3, 60_000, now + 10)), 'rate_limited');
  assert.equal(code(() => assertRateLimit('t', 'other', 3, 60_000, now + 10)), null);
  assert.equal(code(() => assertRateLimit('t', 'fp', 3, 60_000, now + 60_010)), null);
});
