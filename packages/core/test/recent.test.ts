import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TermData } from '../src/types';
import { RECENT_TERMS_LIMIT, addRecentTermId, resolveRecentTerms, parseRecentIds } from '../src/recent';

const makeTerm = (id: number): TermData => ({ id, url: `/posts/term-${ id }`, title: { ko: `용어${ id }`, en: `term${ id }` } } as TermData);

test('새 id 는 맨 앞에 추가된다', () => {
  assert.deepEqual(addRecentTermId([], 3), [3]);
  assert.deepEqual(addRecentTermId([3, 2], 5), [5, 3, 2]);
});

test('이미 있는 id 는 중복 없이 맨 앞으로 옮긴다', () => {
  assert.deepEqual(addRecentTermId([1, 2, 3], 3), [3, 1, 2]);
  assert.deepEqual(addRecentTermId([1, 2, 3], 1), [1, 2, 3]);
});

test('최대 20개만 남기고 오래된 것부터 버린다', () => {
  assert.equal(RECENT_TERMS_LIMIT, 20);
  let list: number[] = [];
  for (let id = 1; id <= 25; id += 1) list = addRecentTermId(list, id);
  assert.equal(list.length, 20);
  assert.equal(list[0], 25);
  assert.equal(list[19], 6);
  assert.deepEqual(addRecentTermId(list, 10).slice(0, 2), [10, 25]);
  assert.equal(addRecentTermId(list, 10).length, 20);
});

test('현재 콘텐츠에 없는 id 는 빼고 저장 순서를 지킨다', () => {
  const terms = [makeTerm(1), makeTerm(2), makeTerm(3)];
  assert.deepEqual(resolveRecentTerms([3, 99, 1, 42], terms).map((term) => term.id), [3, 1]);
  assert.deepEqual(resolveRecentTerms([], terms), []);
  assert.deepEqual(resolveRecentTerms([5], []), []);
});

test('깨진 저장값은 빈 목록이 된다', () => {
  assert.deepEqual(parseRecentIds(null), []);
  assert.deepEqual(parseRecentIds(undefined), []);
  assert.deepEqual(parseRecentIds(''), []);
  assert.deepEqual(parseRecentIds('{not json'), []);
  assert.deepEqual(parseRecentIds('{"a":1}'), []);
  assert.deepEqual(parseRecentIds('"3"'), []);
  assert.deepEqual(parseRecentIds('null'), []);
  assert.deepEqual(parseRecentIds('[3,"x",null,1.5,2,3]'), [3, 2]);
  assert.deepEqual(parseRecentIds(JSON.stringify([5, 4, 1])), [5, 4, 1]);
  const many = Array.from({ length: 30 }, (_, i) => i + 1);
  assert.equal(parseRecentIds(JSON.stringify(many)).length, 20);
});
