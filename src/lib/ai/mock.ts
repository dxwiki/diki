import 'server-only';
import type { AiEvaluation, AiFollowUp, AiItemFeedback, FollowUpTurn, InterviewContent } from '@diki/core';

// 개발 환경에서 AI_MOCK=1 일 때만 켠다. 운영 빌드(NODE_ENV=production)에서는 항상 꺼진다
export function isMockEnabled(): boolean {
  return process.env.NODE_ENV !== 'production' && process.env.AI_MOCK === '1';
}

export const MOCK_MODEL = 'mock (테스트 응답)';
export const MOCK_USAGE = { inputTokens: 0, outputTokens: 0 };

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const sentencesOf = (text: string) => text.split(/(?<=[.!?다요])\s+|\n+/).map((s) => s.trim()).filter(Boolean);

// 평가 항목 설명에서 두 글자 이상 단어를 뽑아 답변에 몇 개나 나오는지로 대략 판정한다
function judge(item: InterviewContent['items'][number], answer: string): AiItemFeedback {
  const words = Array.from(new Set(`${ item.label } ${ item.detail }`.split(/[^가-힣A-Za-z0-9]+/).filter((w) => w.length >= 2)));
  const hits = words.filter((w) => answer.includes(w));
  const ratio = words.length ? hits.length / words.length : 0;
  const verdict = ratio >= 0.25 ? 'met' : ratio > 0 ? 'partial' : 'missing';
  const evidence = hits.length ? sentencesOf(answer).find((s) => hits.some((w) => s.includes(w))) ?? '' : '';
  const tip = verdict === 'met' ? `${ item.label }을(를) 잘 다뤘어요. 구체적인 수치나 사례를 더하면 좋아요.` : `${ item.detail.replace(/했는가$/, '하면 좋아요.') }`;
  return { verdict, evidence, tip };
}

export async function mockEvaluate(content: InterviewContent, answer: string): Promise<AiEvaluation> {
  await wait(700);
  const items = content.items.map((item) => judge(item, answer));
  const met = items.filter((i) => i.verdict === 'met').length;
  return {
    items,
    summary: `[테스트 응답] ${ content.items.length }개 항목 중 ${ met }개를 충족한 것으로 보여요. 실제 AI가 아니라 평가 항목 단어가 답변에 있는지로 만든 가짜 결과예요.`,
    improvedAnswer: content.sampleAnswer ?? content.items.map((item) => `${ item.label }: ${ item.detail }`).join('\n'),
    followUp: content.followUps[0] ?? `'${ content.items[0]?.label ?? '핵심 개념' }'을(를) 실제 업무에서 적용한 사례를 들어 주세요.`,
  };
}

export async function mockFollowUp(content: InterviewContent, turns: FollowUpTurn[], allowNext: boolean): Promise<AiFollowUp> {
  await wait(500);
  const last = turns[turns.length - 1];
  const nextQuestion = allowNext ? content.followUps[turns.length] ?? '방금 답변에서 가장 중요한 근거 하나를 더 구체적으로 설명해 주세요.' : null;
  return {
    feedback: `[테스트 응답] ${ last.answer.length }자로 답했어요. 실제 AI 평가가 아닌 화면 확인용 응답이에요.${ allowNext ? '' : ' 꼬리 질문 연습을 모두 마쳤어요.' }`,
    nextQuestion,
  };
}
