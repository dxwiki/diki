import 'server-only';
import { isAiProviderId, maskApiKey, type AiProviderId } from '@diki/core';
import { seal, unseal, type SealSecret } from './seal';

export const KEY_COOKIE_NAME = 'diki_ai_keys';
export const KEY_COOKIE_PATH = '/api/ai';
export const KEY_COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 30;
const COOKIE_AAD = 'ai-keys';
const MAX_KEY_CHARS = 512;

export interface StoredProviderKey {
  key: string;
  model: string;
  addedAt: number;
}

export interface KeyState {
  keys: Partial<Record<AiProviderId, StoredProviderKey>>;
  active: AiProviderId | null;
}

export interface PublicKeyState {
  providers: { id: AiProviderId; masked: string; model: string; addedAt: number }[];
  active: AiProviderId | null;
  expiresAt: number | null;
}

export const EMPTY_KEY_STATE: KeyState = { keys: {}, active: null };

// 키는 출력 가능한 ASCII만, 길이 제한. 공백·줄바꿈이 섞인 붙여넣기는 거부한다
export function normalizeApiKey(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const key = raw.trim();
  if (key.length < 20 || key.length > MAX_KEY_CHARS || !/^[\x21-\x7e]+$/.test(key)) return null;
  return key;
}

function isStoredKey(value: unknown): value is StoredProviderKey {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return typeof v.key === 'string' && typeof v.model === 'string' && typeof v.addedAt === 'number';
}

export function decodeKeyState(token: string | undefined, secrets: SealSecret[], now: number): { state: KeyState; expiresAt: number | null } {
  const data = unseal<{ keys?: unknown; active?: unknown; exp?: unknown }>(token, secrets, COOKIE_AAD, now);
  if (!data || !data.keys || typeof data.keys !== 'object') return { state: EMPTY_KEY_STATE, expiresAt: null };
  const keys: KeyState['keys'] = {};
  for (const [id, value] of Object.entries(data.keys as Record<string, unknown>)) {
    if (isAiProviderId(id) && isStoredKey(value)) keys[id] = value;
  }
  const active = isAiProviderId(data.active) && keys[data.active] ? data.active : null;
  return { state: { keys, active }, expiresAt: typeof data.exp === 'number' ? data.exp : null };
}

// 봉인 안에도 만료 시각을 넣어, 쿠키 Max-Age 를 조작해도 서버가 만료를 강제한다
export function encodeKeyState(state: KeyState, secrets: SealSecret[], now: number): string {
  const exp = now + (KEY_COOKIE_MAX_AGE_SEC * 1000);
  return seal({ keys: state.keys, active: state.active, exp }, secrets, COOKIE_AAD, exp);
}

export function toPublicState(state: KeyState, expiresAt: number | null): PublicKeyState {
  const providers = (Object.entries(state.keys) as [AiProviderId, StoredProviderKey][])
    .map(([id, value]) => ({ id, masked: maskApiKey(value.key), model: value.model, addedAt: value.addedAt }));
  return { providers, active: state.active, expiresAt };
}

export function keyCookieOptions(secure: boolean) {
  return {
    httpOnly: true,
    secure,
    sameSite: 'strict' as const,
    path: KEY_COOKIE_PATH,
    maxAge: KEY_COOKIE_MAX_AGE_SEC,
  };
}
