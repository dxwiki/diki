import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { TermData } from '../src/types';
import {
  applyAttempt,
  buildCourseTermMap,
  buildLesson,
  computePhaseStates,
  EMPTY_PROGRESS,
  getEarlierTerms,
  getStageSummaries,
  getUnlockedStages,
  learnStages,
  parseProgress,
  stepKey,
} from '../src/course';

const repoRoot = path.resolve(__dirname, '../../../..');
const termsPath = path.join(repoRoot, 'public', 'data', 'terms.json');

const loadTerms = (): TermData[] => {
  if (!fs.existsSync(termsPath)) {
    throw new Error(`${ termsPath } 가 없다. 루트에서 npm run export-public-data 로 먼저 만든다.`);
  }
  return JSON.parse(fs.readFileSync(termsPath, 'utf8')) as TermData[];
};

const termMap = buildCourseTermMap(loadTerms());
const stages = getStageSummaries(termMap);

test('학습 코스의 모든 Step 용어가 콘텐츠에 있다', () => {
  const missing = learnStages.flatMap((s) => s.phases.flatMap((p) => p.steps)).filter((slug) => !termMap.has(slug));
  assert.deepEqual(missing, []);
});

test('모든 Step에서 카드로 시작하고 문제가 1개 이상인 레슨을 만든다', () => {
  for (const stage of stages) {
    for (const phase of stage.phases) {
      for (const step of phase.steps) {
        const lesson = buildLesson(termMap.get(step.id)!, getEarlierTerms(stages, step.id, termMap));
        assert.equal(lesson[0].kind, 'card', `${ step.id } 첫 항목`);
        const ids = lesson.map((item) => item.id);
        assert.equal(new Set(ids).size, ids.length, `${ step.id } 항목 id 중복`);
        if (step.id !== stages[0].phases[0].steps[0].id) {
          assert.ok(lesson.some((item) => item.kind !== 'card'), `${ step.id } 문제 없음`);
        }
      }
    }
  }
});

test('같은 용어로 만든 레슨은 항상 같다', () => {
  const step = stages[1].phases[0].steps[0].id;
  const earlier = getEarlierTerms(stages, step, termMap);
  assert.deepEqual(buildLesson(termMap.get(step)!, earlier), buildLesson(termMap.get(step)!, earlier));
});

test('첫 Step만 열려 있고, 완료하면 다음 Step이 열린다', () => {
  const stage = stages[0];
  const first = stage.phases[0].steps[0].id;
  const before = computePhaseStates(stage.phases, stage.id, EMPTY_PROGRESS.learn);
  assert.equal(before[0].steps[0].status, 'available');
  assert.equal(before[0].steps[1].status, 'locked');
  assert.equal(before[1].locked, true);

  const progress = applyAttempt(EMPTY_PROGRESS, 'learn', stepKey(stage.id, stage.phases[0].id, first), { completed: true, review: false }, '2026-10-23T00:00:00.000Z');
  const after = computePhaseStates(stage.phases, stage.id, progress.learn);
  assert.equal(after[0].steps[0].status, 'completed');
  assert.equal(after[0].steps[1].status, 'available');
});

test('앞 단계를 모두 완료해야 다음 단계가 열린다', () => {
  assert.deepEqual(getUnlockedStages(stages, {}).slice(0, 2), [true, false]);
  const records = Object.fromEntries(stages[0].phases.flatMap((p) => p.steps.map((s) => [stepKey(stages[0].id, p.id, s.id), { completed: true, review: false }])));
  assert.deepEqual(getUnlockedStages(stages, records).slice(0, 3), [true, true, false]);
});

test('다시 풀어도 완료는 유지하고 복습 표시와 시도 횟수는 갱신한다', () => {
  const key = 'beginner/p/s';
  const once = applyAttempt(EMPTY_PROGRESS, 'learn', key, { completed: true, review: true }, 't1');
  assert.deepEqual(once.learn[key], { completed: true, review: true, attempts: 1, firstTryCorrect: false, updatedAt: 't1' });
  const twice = applyAttempt(once, 'learn', key, { completed: false, review: false }, 't2');
  assert.deepEqual(twice.learn[key], { completed: true, review: false, attempts: 2, firstTryCorrect: false, updatedAt: 't2' });
  assert.deepEqual(EMPTY_PROGRESS.learn, {});
});

test('깨진 저장값은 빈 진도로 읽는다', () => {
  assert.deepEqual(parseProgress(null), EMPTY_PROGRESS);
  assert.deepEqual(parseProgress('{oops'), EMPTY_PROGRESS);
  assert.deepEqual(parseProgress('[1,2]'), EMPTY_PROGRESS);
  assert.deepEqual(parseProgress('{"learn":{"a":{"completed":true}},"interview":3}').interview, {});
});
