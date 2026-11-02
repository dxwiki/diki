import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { parseSealSecrets, seal, unseal } from '../seal';

const secretText = (id: string) => `${ id }:${ randomBytes(32).toString('base64') }`;
const now = 1_700_000_000_000;
const later = now + 60_000;

test('봉인 후 같은 비밀값·용도로 열면 원래 값이 나온다', () => {
  const secrets = parseSealSecrets(secretText('k1'));
  const token = seal({ key: 'sk-test-123' }, secrets, 'ai-keys', later);
  assert.deepEqual(unseal(token, secrets, 'ai-keys', now), { key: 'sk-test-123' });
});

test('봉인값에는 원문이 보이지 않고, 같은 값도 매번 다르게 봉인된다', () => {
  const secrets = parseSealSecrets(secretText('k1'));
  const a = seal({ key: 'sk-visible-secret' }, secrets, 'ai-keys', later);
  const b = seal({ key: 'sk-visible-secret' }, secrets, 'ai-keys', later);
  assert.ok(!a.includes('sk-visible-secret'));
  assert.ok(!Buffer.from(a.split('.')[3], 'base64url').toString('utf8').includes('sk-visible'));
  assert.notEqual(a, b);
});

test('한 글자라도 바꾸면 열리지 않는다', () => {
  const secrets = parseSealSecrets(secretText('k1'));
  const token = seal({ key: 'x' }, secrets, 'ai-keys', later);
  const parts = token.split('.');
  for (const index of [2, 3, 4]) {
    const tampered = [...parts];
    const chars = tampered[index].split('');
    chars[0] = chars[0] === 'A' ? 'B' : 'A';
    tampered[index] = chars.join('');
    assert.equal(unseal(tampered.join('.'), secrets, 'ai-keys', now), null, `part ${ index }`);
  }
  assert.equal(unseal(`v2.${ parts.slice(1).join('.') }`, secrets, 'ai-keys', now), null);
});

test('다른 용도(AAD)·다른 비밀값·만료된 봉인은 열리지 않는다', () => {
  const secrets = parseSealSecrets(secretText('k1'));
  const token = seal({ key: 'x' }, secrets, 'ai-keys', later);
  assert.equal(unseal(token, secrets, 'other-purpose', now), null);
  assert.equal(unseal(token, parseSealSecrets(secretText('k1')), 'ai-keys', now), null);
  assert.equal(unseal(token, secrets, 'ai-keys', later + 1), null);
  assert.equal(unseal(undefined, secrets, 'ai-keys', now), null);
  assert.equal(unseal('a'.repeat(9000), secrets, 'ai-keys', now), null);
});

test('비밀값 교체: 새 값으로 봉인하고 이전 값으로 봉인된 것도 연다', () => {
  const oldText = secretText('k1');
  const oldSecrets = parseSealSecrets(oldText);
  const oldToken = seal({ v: 'old' }, oldSecrets, 'ai-keys', later);
  const rotated = parseSealSecrets(`${ secretText('k2') },${ oldText }`);
  assert.deepEqual(unseal(oldToken, rotated, 'ai-keys', now), { v: 'old' });
  assert.equal(seal({ v: 'new' }, rotated, 'ai-keys', later).split('.')[1], 'k2');
  assert.equal(unseal(oldToken, parseSealSecrets(secretText('k2')), 'ai-keys', now), null);
});

test('비밀값 형식 검사: 짧은 값·중복 키ID·잘못된 키ID 거부', () => {
  assert.deepEqual(parseSealSecrets(undefined), []);
  assert.throws(() => parseSealSecrets(`k1:${ randomBytes(16).toString('base64') }`));
  assert.throws(() => parseSealSecrets(`${ secretText('k1') },${ secretText('k1') }`));
  assert.throws(() => parseSealSecrets(`bad id:${ randomBytes(32).toString('base64') }`));
  assert.throws(() => seal({}, [], 'ai-keys', later));
});
