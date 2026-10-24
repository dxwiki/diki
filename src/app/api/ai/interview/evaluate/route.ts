import { NextRequest } from 'next/server';
import { buildEvaluationPrompt, evaluationSchema, normalizeAnswer, parseEvaluation } from '@diki/core';
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
import { isMockEnabled, mockEvaluate, MOCK_MODEL, MOCK_USAGE } from '@/lib/ai/mock';
import { loadKeyState, requireSecrets } from '@/lib/ai/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export function POST(request: NextRequest) {
  return handleAiRoute(async () => {
    assertSameOrigin(request);
    assertRateLimit('evaluate', clientFingerprint(request), 10, 60_000);
    const secrets = requireSecrets();
    const body = await readJsonBody(request);
    const answer = normalizeAnswer(body.answer);
    if (!answer) throw new AiRequestError('bad_request');
    const { input, content } = loadInterviewStep(body);
    const { state } = loadKeyState(request, secrets);
    if (!state.active && isMockEnabled()) {
      return jsonResponse({ evaluation: await mockEvaluate(content, answer), provider: 'mock', model: MOCK_MODEL, usage: MOCK_USAGE });
    }
    const { adapter, stored, provider } = activeProvider(state);

    const prompt = buildEvaluationPrompt(input, answer);
    const { data, usage } = await adapter.generateJson({
      apiKey: stored.key,
      model: stored.model,
      system: prompt.system,
      user: prompt.user,
      schema: evaluationSchema(content.items.length),
      schemaName: 'interview_evaluation',
      maxOutputTokens: 16000,
    });
    const evaluation = parseEvaluation(data, content.items.length);
    if (!evaluation) throw new AiRequestError('bad_output');
    return jsonResponse({ evaluation, provider, model: stored.model, usage });
  });
}
