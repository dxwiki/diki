import { NextRequest } from 'next/server';
import { isAiProviderId } from '@diki/core';
import { AiRequestError, assertRateLimit, assertSameOrigin, clientFingerprint, handleAiRoute, jsonResponse } from '@/lib/ai/guard';
import { PROVIDER_ADAPTERS } from '@/lib/ai/providers';
import { selectModels } from '@/lib/ai/providers/catalog';
import { loadKeyState, requireSecrets } from '@/lib/ai/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// 저장된 키로 쓸 수 있는 모델 목록 (모델 선택 화면용)
export function GET(request: NextRequest) {
  return handleAiRoute(async () => {
    assertSameOrigin(request);
    assertRateLimit('models', clientFingerprint(request), 20, 60_000);
    const secrets = requireSecrets();
    const provider = request.nextUrl.searchParams.get('provider');
    if (!isAiProviderId(provider)) throw new AiRequestError('bad_request');
    const stored = loadKeyState(request, secrets).state.keys[provider];
    if (!stored) throw new AiRequestError('no_key');
    const models = selectModels(provider, await PROVIDER_ADAPTERS[provider].listModels(stored.key));
    return jsonResponse({ provider, models, selected: stored.model });
  });
}
