import { NextRequest } from 'next/server';
import { isAiProviderId, type AiProviderId } from '@diki/core';
import {
  AiRequestError,
  assertRateLimit,
  assertSameOrigin,
  clientFingerprint,
  handleAiRoute,
  jsonResponse,
  readJsonBody,
} from '@/lib/ai/guard';
import { toPublicState, type KeyState } from '@/lib/ai/keyStore';
import { PROVIDER_ADAPTERS } from '@/lib/ai/providers';
import { isModelId, selectModels } from '@/lib/ai/providers/catalog';
import { isMockEnabled } from '@/lib/ai/mock';
import { loadKeyState, requireSecrets, saveKeyState } from '@/lib/ai/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MINUTE = 60_000;

function guard(request: NextRequest, scope: string, limit: number) {
  assertSameOrigin(request);
  assertRateLimit(scope, clientFingerprint(request), limit, MINUTE);
  return requireSecrets();
}

export function GET(request: NextRequest) {
  return handleAiRoute(async () => {
    const secrets = guard(request, 'keys-read', 60);
    const { state, expiresAt } = loadKeyState(request, secrets);
    return jsonResponse({ ...toPublicState(state, expiresAt), mock: isMockEnabled() });
  });
}

// 사용할 회사 또는 모델을 바꾼다. 모델은 그 키로 실제 쓸 수 있는 목록에 있을 때만 허용
export function PATCH(request: NextRequest) {
  return handleAiRoute(async () => {
    const secrets = guard(request, 'keys-write', 20);
    const body = await readJsonBody(request);
    const { state } = loadKeyState(request, secrets);
    const next: KeyState = { keys: { ...state.keys }, active: state.active };

    if (body.active !== undefined) {
      if (!isAiProviderId(body.active) || !next.keys[body.active]) throw new AiRequestError('bad_request');
      next.active = body.active;
    }
    if (body.model !== undefined) {
      const provider = body.provider;
      if (!isAiProviderId(provider) || !isModelId(body.model)) throw new AiRequestError('bad_request');
      const stored = next.keys[provider];
      if (!stored) throw new AiRequestError('no_key');
      const models = selectModels(provider, await PROVIDER_ADAPTERS[provider].listModels(stored.key));
      if (!models.includes(body.model)) throw new AiRequestError('bad_request');
      next.keys[provider] = { ...stored, model: body.model };
    }

    const response = jsonResponse(toPublicState(next, null));
    saveKeyState(response, request, next, secrets);
    return response;
  });
}

// ?provider= 가 있으면 그 회사 키만, 없으면 전체를 지운다
export function DELETE(request: NextRequest) {
  return handleAiRoute(async () => {
    const secrets = guard(request, 'keys-write', 20);
    const target = request.nextUrl.searchParams.get('provider');
    const { state } = loadKeyState(request, secrets);
    const next: KeyState = { keys: { ...state.keys }, active: state.active };
    if (target === null) {
      next.keys = {};
    } else {
      if (!isAiProviderId(target)) throw new AiRequestError('bad_request');
      delete next.keys[target];
    }
    const remaining = Object.keys(next.keys) as AiProviderId[];
    if (!next.active || !next.keys[next.active]) next.active = remaining[0] ?? null;
    const response = jsonResponse(toPublicState(next, null));
    saveKeyState(response, request, next, secrets);
    return response;
  });
}
