import { randomBytes } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { isSecureRequest } from '@/lib/ai/guard';
import { CSRF_COOKIE_NAME, keyPageHeaders, KEY_FORM_PATH, pickProvider, renderKeyEntryPage, safeReturnPath } from '@/lib/ai/keyEntryPage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// 레이아웃(분석·광고 스크립트)을 거치지 않는 독립 HTML 로 키 입력 화면을 내보낸다
export function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const csrf = randomBytes(32).toString('base64url');
  const nonce = randomBytes(16).toString('base64');
  const html = renderKeyEntryPage({
    provider: pickProvider(params.get('provider')),
    returnTo: safeReturnPath(params.get('return')),
    error: params.get('error'),
    csrf,
    nonce,
  });
  const response = new NextResponse(html, { status: 200, headers: keyPageHeaders(nonce) });
  response.cookies.set(CSRF_COOKIE_NAME, csrf, {
    httpOnly: true,
    secure: isSecureRequest(request),
    sameSite: 'strict',
    path: KEY_FORM_PATH,
    maxAge: 600,
  });
  return response;
}
