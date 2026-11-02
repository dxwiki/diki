import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isMockEnabled, mockEvaluate, mockFollowUp } from '../mock';

const env = process.env as Record<string, string | undefined>;
const content = {
  question: 'Q',
  items: [{ label: '정의', detail: '학습 데이터에만 맞춰진 상태임을 설명했는가' }, { label: '실무 맥락', detail: '서비스에서 왜 중요한지 언급했는가' }],
  commonMisses: [],
  followUps: ['꼬리1', '꼬리2'],
  curated: false,
};

test('테스트 모드는 운영 빌드에서 AI_MOCK=1 이어도 꺼진다', () => {
  const saved = { node: env.NODE_ENV, mock: env.AI_MOCK };
  env.AI_MOCK = '1';
  env.NODE_ENV = 'production';
  assert.equal(isMockEnabled(), false);
  env.NODE_ENV = 'development';
  assert.equal(isMockEnabled(), true);
  env.AI_MOCK = '0';
  assert.equal(isMockEnabled(), false);
  env.NODE_ENV = saved.node;
  env.AI_MOCK = saved.mock;
});

test('가짜 평가는 항목 수를 지키고 테스트 응답임을 밝힌다', async () => {
  const result = await mockEvaluate(content, '과대적합은 학습 데이터에만 맞춰진 상태입니다.');
  assert.equal(result.items.length, 2);
  assert.equal(result.items[1].verdict, 'missing');
  assert.match(result.summary, /테스트 응답/);
  assert.equal(result.followUp, '꼬리1');
});

test('가짜 꼬리 질문은 마지막 차례에 다음 질문이 없다', async () => {
  const turn = { question: 'q', answer: '열 글자가 넘는 답변입니다' };
  assert.equal((await mockFollowUp(content, [turn], true)).nextQuestion, '꼬리2');
  assert.equal((await mockFollowUp(content, [turn, turn, turn], false)).nextQuestion, null);
});
