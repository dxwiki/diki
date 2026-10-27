import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { parseSealSecrets } from '../seal';
import { decodeKeyState, encodeKeyState, keyCookieOptions, KEY_COOKIE_MAX_AGE_SEC, normalizeApiKey, toPublicState, type KeyState } from '../keyStore';

const secrets = parseSealSecrets(`k1:${ randomBytes(32).toString('base64') }`);
const now = 1_700_000_000_000;
const anthropicKey = 'sk-ant-api03-ABCDEFGHIJKLMNOPQRSTUVWXYZ012345';
const state: KeyState = {
  keys: { anthropic: { key: anthropicKey, model: 'claude-opus-5-5', addedAt: now } },
  active: 'anthropic',
};

test('쿠키 상태를 봉인했다 풀면 같고, 30일 뒤에는 비어 있다', () => {
  const token = encodeKeyState(state, secrets, now);
  const decoded = decodeKeyState(token, secrets, now + 1000);
  assert.deepEqual(decoded.state, state);
  assert.equal(decoded.expiresAt, now + (KEY_COOKIE_MAX_AGE_SEC * 1000));
  assert.deepEqual(decodeKeyState(token, secrets, now + (KEY_COOKIE_MAX_AGE_SEC * 1000) + 1).state, { keys: {}, active: null });
});

test('공개 상태에는 키 원문이 없고 가린 값만 있다', () => {
  const pub = toPublicState(state, null);
  assert.ok(!JSON.stringify(pub).includes(anthropicKey));
  assert.equal(pub.providers[0].masked, 'sk-a…2345');
  assert.equal(pub.active, 'anthropic');
});

test('알 수 없는 회사·형식이 틀린 항목은 버리고, 없는 회사는 active 가 되지 않는다', () => {
  const token = encodeKeyState({
    keys: { anthropic: state.keys.anthropic, evil: { key: 'x', model: 'y', addedAt: 1 } } as unknown as KeyState['keys'],
    active: 'openai',
  }, secrets, now);
  const decoded = decodeKeyState(token, secrets, now);
  assert.deepEqual(Object.keys(decoded.state.keys), ['anthropic']);
  assert.equal(decoded.state.active, null);
});

test('키 입력 검사: 공백·제어문자·짧은 값·너무 긴 값 거부', () => {
  assert.equal(normalizeApiKey(`  ${ anthropicKey }  `), anthropicKey);
  assert.equal(normalizeApiKey('sk-short'), null);
  assert.equal(normalizeApiKey('sk-ant-api03-ABCDEF GHIJKLMNOPQRSTUVWX'), null);
  assert.equal(normalizeApiKey('sk-ant-api03-ABCDEFGHIJKLMNOPQRSTUV\nX'), null);
  assert.equal(normalizeApiKey('a'.repeat(513)), null);
  assert.equal(normalizeApiKey(123), null);
});

test('쿠키 옵션: httpOnly·SameSite=Strict·경로 제한', () => {
  const options = keyCookieOptions(true);
  assert.equal(options.httpOnly, true);
  assert.equal(options.secure, true);
  assert.equal(options.sameSite, 'strict');
  assert.equal(options.path, '/api/ai');
});
