import { NextRequest } from 'next/server';
import {
  buildFollowUpPrompt,
  FOLLOW_UP_SCHEMA,
  MAX_FOLLOW_UP_TURNS,
  normalizeAnswer,
  parseFollowUp,
  parseFollowUpTurns,
} from '@diki/core';
import {
  AiRequestError,
  assertRateLimit,
  assertSameOrigin,
  clientFingerprint,
  handleAiRoute,
  jsonResponse,
  readJsonBody,
} from '@/lib/ai/guard';
import { activeProvider, loadInterviewStep } from '@/lib/ai/interview';
import { loadKeyState, requireSecrets } from '@/lib/ai/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// 마지막 turn 의 답변을 평가하고, 한도 전이면 다음 꼬리 질문을 만든다 (한도는 서버가 강제)
export function POST(request: NextRequest) {
  return handleAiRoute(async () => {
    assertSameOrigin(request);
    assertRateLimit('follow-up', clientFingerprint(request), 15, 60_000);
    const secrets = requireSecrets();
    const body = await readJsonBody(request);
    const answer = normalizeAnswer(body.answer);
    const turns = parseFollowUpTurns(body.turns);
    if (!answer || !turns) throw new AiRequestError('bad_request');
    const { input } = loadInterviewStep(body);
    const { adapter, stored, provider } = activeProvider(loadKeyState(request, secrets).state);

    const allowNext = turns.length < MAX_FOLLOW_UP_TURNS;
    const prompt = buildFollowUpPrompt(input, answer, turns, allowNext);
    const { data, usage } = await adapter.generateJson({
      apiKey: stored.key,
      model: stored.model,
      system: prompt.system,
      user: prompt.user,
      schema: FOLLOW_UP_SCHEMA,
      schemaName: 'interview_follow_up',
      maxOutputTokens: 8000,
    });
    const result = parseFollowUp(data, allowNext);
    if (!result) throw new AiRequestError('bad_output');
    return jsonResponse({ ...result, provider, model: stored.model, usage });
  });
}
