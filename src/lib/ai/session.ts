import 'server-only';
import type { NextRequest, NextResponse } from 'next/server';
import { AiRequestError, isSecureRequest } from './guard';
import { decodeKeyState, encodeKeyState, keyCookieOptions, KEY_COOKIE_NAME, type KeyState } from './keyStore';
import { getSealSecrets, type SealSecret } from './seal';

// 비밀값이 없거나 형식이 틀리면 기능 전체를 끈다
export function requireSecrets(): SealSecret[] {
  let secrets: SealSecret[];
  try {
    secrets = getSealSecrets();
  } catch {
    throw new AiRequestError('unavailable');
  }
  if (!secrets.length) throw new AiRequestError('unavailable');
  return secrets;
}

export function loadKeyState(request: NextRequest, secrets: SealSecret[], now = Date.now()) {
  return decodeKeyState(request.cookies.get(KEY_COOKIE_NAME)?.value, secrets, now);
}

export function saveKeyState(response: NextResponse, request: NextRequest, state: KeyState, secrets: SealSecret[], now = Date.now()): void {
  const options = keyCookieOptions(isSecureRequest(request));
  if (!Object.keys(state.keys).length) {
    response.cookies.set(KEY_COOKIE_NAME, '', { ...options, maxAge: 0 });
    return;
  }
  response.cookies.set(KEY_COOKIE_NAME, encodeKeyState(state, secrets, now), options);
}
