import { timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { isAiProviderId } from '@diki/core';
import { AiRequestError, assertFormOrigin, assertRateLimit, clientFingerprint, isSecureRequest } from '@/lib/ai/guard';
import { CSRF_COOKIE_NAME, KEY_FORM_PATH, KEY_PAGE_PATH, pickProvider, safeReturnPath } from '@/lib/ai/keyEntryPage';
import { normalizeApiKey, type KeyState } from '@/lib/ai/keyStore';
import { PROVIDER_ADAPTERS } from '@/lib/ai/providers';
import { selectModels } from '@/lib/ai/providers/catalog';
import { loadKeyState, requireSecrets, saveKeyState } from '@/lib/ai/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_FORM_BYTES = 4096;

const sameToken = (a: string, b: string) => {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && left.length > 0 && timingSafeEqual(left, right);
};

function redirect(request: NextRequest, path: string): NextResponse {
  const response = NextResponse.redirect(new URL(path, request.url), 303);
  response.headers.set('Cache-Control', 'no-store, max-age=0');
  response.headers.set('Referrer-Policy', 'no-referrer');
  response.cookies.set(CSRF_COOKIE_NAME, '', { httpOnly: true, secure: isSecureRequest(request), sameSite: 'strict', path: KEY_FORM_PATH, maxAge: 0 });
  return response;
}

// 키 등록 화면의 폼만 받는다: Origin 일치 + 1회용 CSRF 토큰 + 회사 API 확인 후 봉인
export async function POST(request: NextRequest) {
  let provider = pickProvider(null);
  let returnTo = safeReturnPath(null);
  try {
    assertFormOrigin(request);
    assertRateLimit('keys-write', clientFingerprint(request), 10, 60_000);
    const secrets = requireSecrets();
    if (!(request.headers.get('content-type') ?? '').startsWith('application/x-www-form-urlencoded')) throw new AiRequestError('bad_request');
    const raw = await request.text();
    if (Buffer.byteLength(raw) > MAX_FORM_BYTES) throw new AiRequestError('bad_request');
    const form = new URLSearchParams(raw);
    provider = pickProvider(form.get('provider'));
    returnTo = safeReturnPath(form.get('return'));

    if (!sameToken(form.get('csrf') ?? '', request.cookies.get(CSRF_COOKIE_NAME)?.value ?? '')) {
      return redirect(request, `${ KEY_PAGE_PATH }?provider=${ provider }&return=${ encodeURIComponent(returnTo) }&error=expired`);
    }
    const apiKey = normalizeApiKey(form.get('apiKey'));
    if (!isAiProviderId(form.get('provider')) || !apiKey) throw new AiRequestError('bad_request');

    const models = selectModels(provider, await PROVIDER_ADAPTERS[provider].listModels(apiKey));
    if (!models.length) throw new AiRequestError('permission');

    const { state } = loadKeyState(request, secrets);
    const next: KeyState = {
      keys: { ...state.keys, [provider]: { key: apiKey, model: models[0], addedAt: Date.now() } },
      active: provider,
    };
    const response = redirect(request, `${ returnTo }?ai=saved`);
    saveKeyState(response, request, next, secrets);
    return response;
  } catch (error) {
    const code = error instanceof AiRequestError ? error.code : 'upstream';
    if (!(error instanceof AiRequestError)) console.error('[ai] key form error:', error instanceof Error ? error.name : typeof error);
    if (code === 'forbidden') return new NextResponse(null, { status: 403, headers: { 'Cache-Control': 'no-store' } });
    return redirect(request, `${ KEY_PAGE_PATH }?provider=${ provider }&return=${ encodeURIComponent(returnTo) }&error=${ code }`);
  }
}
