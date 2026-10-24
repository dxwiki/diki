import 'server-only';
import { createHash } from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';

export const AI_REQUEST_HEADER = 'x-diki-ai';
const MAX_BODY_BYTES = 16 * 1024;

export type AiErrorCode =
  | 'forbidden'
  | 'bad_request'
  | 'rate_limited'
  | 'unavailable'
  | 'no_key'
  | 'invalid_key'
  | 'permission'
  | 'provider_rate_limited'
  | 'refused'
  | 'bad_output'
  | 'timeout'
  | 'upstream';

const STATUS: Record<AiErrorCode, number> = {
  forbidden: 403,
  bad_request: 400,
  rate_limited: 429,
  unavailable: 503,
  no_key: 409,
  invalid_key: 401,
  permission: 403,
  provider_rate_limited: 429,
  refused: 422,
  bad_output: 502,
  timeout: 504,
  upstream: 502,
};

const NO_STORE = { 'Cache-Control': 'no-store, max-age=0', 'X-Content-Type-Options': 'nosniff' };

export function jsonResponse(body: unknown, status = 200): NextResponse {
  return NextResponse.json(body, { status, headers: NO_STORE });
}

export function errorResponse(code: AiErrorCode): NextResponse {
  return jsonResponse({ error: code }, STATUS[code]);
}

export class AiRequestError extends Error {
  constructor(public readonly code: AiErrorCode) {
    super(code);
  }
}

function allowedHosts(request: NextRequest): string[] {
  const hosts = [request.headers.get('host')];
  const base = process.env.NEXT_PUBLIC_BASE_URL;
  if (base) {
    try {
      hosts.push(new URL(base).host);
    } catch {
      // 잘못된 설정값은 무시한다
    }
  }
  return hosts.filter((h): h is string => !!h);
}

// 같은 출처의 fetch 만 통과시킨다: 사용자 지정 헤더(교차 출처면 사전 요청에서 막힘) + Origin 일치
export function assertSameOrigin(request: NextRequest): void {
  if (request.headers.get(AI_REQUEST_HEADER) !== '1') throw new AiRequestError('forbidden');
  const origin = request.headers.get('origin');
  if (request.method !== 'GET' && !origin) throw new AiRequestError('forbidden');
  if (origin) {
    let host: string;
    try {
      host = new URL(origin).host;
    } catch {
      throw new AiRequestError('forbidden');
    }
    if (!allowedHosts(request).includes(host)) throw new AiRequestError('forbidden');
  }
  const site = request.headers.get('sec-fetch-site');
  if (site && site !== 'same-origin') throw new AiRequestError('forbidden');
}

export async function readJsonBody(request: NextRequest): Promise<Record<string, unknown>> {
  if (!(request.headers.get('content-type') ?? '').startsWith('application/json')) throw new AiRequestError('bad_request');
  const declared = Number(request.headers.get('content-length') ?? '0');
  if (declared > MAX_BODY_BYTES) throw new AiRequestError('bad_request');
  const text = await request.text();
  if (Buffer.byteLength(text) > MAX_BODY_BYTES) throw new AiRequestError('bad_request');
  try {
    const parsed = JSON.parse(text);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('not object');
    return parsed as Record<string, unknown>;
  } catch {
    throw new AiRequestError('bad_request');
  }
}

export function isSecureRequest(request: NextRequest): boolean {
  if (process.env.NODE_ENV === 'production') return true;
  return (request.headers.get('x-forwarded-proto') ?? new URL(request.url).protocol.replace(':', '')) === 'https';
}

// 서버 보호용 빈도 제한. 인스턴스 메모리 기준이라 인스턴스가 여러 개면 느슨해진다
const buckets = new Map<string, number[]>();

export function clientFingerprint(request: NextRequest): string {
  const ip = (request.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || request.headers.get('x-real-ip') || 'unknown';
  return createHash('sha256').update(ip).digest('base64url').slice(0, 22);
}

export function assertRateLimit(scope: string, fingerprint: string, limit: number, windowMs: number, now = Date.now()): void {
  const key = `${ scope }:${ fingerprint }`;
  const recent = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    buckets.set(key, recent);
    throw new AiRequestError('rate_limited');
  }
  recent.push(now);
  buckets.set(key, recent);
  if (buckets.size > 5000) {
    Array.from(buckets.entries()).forEach(([k, times]) => {
      if (times.every((t) => now - t >= windowMs)) buckets.delete(k);
    });
  }
}

// 라우트 공통 처리: 예상한 오류는 코드로, 그 밖의 오류는 내용 없이 upstream 으로 바꾼다 (키가 섞인 메시지를 내보내지 않음)
export async function handleAiRoute(handler: ()=> Promise<NextResponse>): Promise<NextResponse> {
  try {
    return await handler();
  } catch (error) {
    if (error instanceof AiRequestError) return errorResponse(error.code);
    console.error('[ai] unexpected error:', error instanceof Error ? error.name : typeof error);
    return errorResponse('upstream');
  }
}
