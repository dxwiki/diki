import type { AiProviderId } from '@diki/core';

export interface PublicKeyState {
  providers: { id: AiProviderId; masked: string; model: string; addedAt: number }[];
  active: AiProviderId | null;
  expiresAt: number | null;
}

export const EMPTY_PUBLIC_STATE: PublicKeyState = { providers: [], active: null, expiresAt: null };

export const AI_ERROR_MESSAGES: Record<string, string> = {
  forbidden: '요청이 거부됐어요. 페이지를 새로고침해 주세요.',
  bad_request: '입력값을 확인해 주세요.',
  rate_limited: '요청이 많아요. 1분 뒤 다시 시도해 주세요.',
  unavailable: '지금은 AI 피드백을 사용할 수 없어요.',
  no_key: '먼저 API 키를 등록해 주세요.',
  invalid_key: 'API 키가 올바르지 않아요. 키를 다시 확인해 주세요.',
  permission: '이 키로 사용할 수 있는 모델이 없거나 권한이 부족해요.',
  provider_rate_limited: 'AI 회사의 사용 한도에 걸렸어요. 한도나 결제 상태를 확인해 주세요.',
  refused: 'AI가 이 요청에 답하지 않았어요. 자가 점검으로 진행해 주세요.',
  bad_output: 'AI 응답 형식이 올바르지 않았어요. 다시 시도해 주세요.',
  timeout: 'AI 응답이 너무 오래 걸렸어요. 다시 시도해 주세요.',
  upstream: 'AI 서비스와 연결하지 못했어요. 잠시 뒤 다시 시도해 주세요.',
};

export class AiClientError extends Error {
  constructor(public readonly code: string) {
    super(AI_ERROR_MESSAGES[code] ?? AI_ERROR_MESSAGES.upstream);
  }
}

// 키 쿠키는 httpOnly 라 이 코드도 읽을 수 없다. 서버가 쿠키를 보고 처리한다
export async function aiFetch<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const headers: Record<string, string> = { 'x-diki-ai': '1' };
  if (init.body !== undefined) headers['content-type'] = 'application/json';
  let response: Response;
  try {
    response = await fetch(`/api/ai${ path }`, {
      method: init.method ?? 'GET',
      headers,
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
      credentials: 'same-origin',
      cache: 'no-store',
    });
  } catch {
    throw new AiClientError('upstream');
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new AiClientError(typeof data?.error === 'string' ? data.error : 'upstream');
  return data as T;
}
