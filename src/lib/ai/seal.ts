import 'server-only';
import { createCipheriv, createDecipheriv, hkdfSync, randomBytes } from 'node:crypto';

// 봉인 형식: v1.<키ID>.<iv>.<암호문>.<태그> (base64url). 키ID로 비밀값 교체 중에도 이전 쿠키를 연다
const VERSION = 'v1';
const IV_BYTES = 12;
const KEY_BYTES = 32;
const HKDF_INFO = 'diki-ai-key-cookie';

export interface SealSecret {
  id: string;
  key: Buffer;
}

export function parseSealSecrets(raw: string | undefined): SealSecret[] {
  if (!raw) return [];
  const secrets = raw.split(',').map((entry) => entry.trim()).filter(Boolean).map((entry) => {
    const index = entry.indexOf(':');
    const id = index > 0 ? entry.slice(0, index) : '';
    const material = Buffer.from(entry.slice(index + 1), 'base64');
    if (!/^[A-Za-z0-9_-]{1,32}$/.test(id) || material.length < KEY_BYTES) {
      throw new Error('AI_KEY_SEAL_SECRETS 형식이 잘못됐습니다 (<키ID>:<base64 32바이트 이상>).');
    }
    return { id, key: Buffer.from(hkdfSync('sha256', material, Buffer.alloc(0), HKDF_INFO, KEY_BYTES)) };
  });
  if (new Set(secrets.map((s) => s.id)).size !== secrets.length) throw new Error('AI_KEY_SEAL_SECRETS 키ID가 중복됩니다.');
  return secrets;
}

let cached: { raw: string; secrets: SealSecret[] } | null = null;

export function getSealSecrets(): SealSecret[] {
  const raw = process.env.AI_KEY_SEAL_SECRETS ?? '';
  if (cached?.raw !== raw) cached = { raw, secrets: parseSealSecrets(raw) };
  return cached.secrets;
}

const b64 = (buf: Buffer) => buf.toString('base64url');

export function seal(payload: unknown, secrets: SealSecret[], aad: string, expiresAt: number): string {
  const [current] = secrets;
  if (!current) throw new Error('봉인 비밀값이 없습니다.');
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv('aes-256-gcm', current.key, iv);
  cipher.setAAD(Buffer.from(`${ VERSION }|${ current.id }|${ aad }`));
  const body = Buffer.from(JSON.stringify({ exp: expiresAt, data: payload }), 'utf8');
  const encrypted = Buffer.concat([cipher.update(body), cipher.final()]);
  return [VERSION, current.id, b64(iv), b64(encrypted), b64(cipher.getAuthTag())].join('.');
}

// 형식·키ID·인증 태그·만료 중 하나라도 맞지 않으면 null (이유는 구분하지 않는다)
export function unseal<T>(token: string | undefined, secrets: SealSecret[], aad: string, now: number): T | null {
  if (!token || token.length > 8192) return null;
  const parts = token.split('.');
  if (parts.length !== 5 || parts[0] !== VERSION) return null;
  const [, id, ivText, dataText, tagText] = parts;
  const secret = secrets.find((s) => s.id === id);
  if (!secret) return null;
  try {
    const iv = Buffer.from(ivText, 'base64url');
    const tag = Buffer.from(tagText, 'base64url');
    if (iv.length !== IV_BYTES || tag.length !== 16) return null;
    const decipher = createDecipheriv('aes-256-gcm', secret.key, iv);
    decipher.setAAD(Buffer.from(`${ VERSION }|${ id }|${ aad }`));
    decipher.setAuthTag(tag);
    const body = Buffer.concat([decipher.update(Buffer.from(dataText, 'base64url')), decipher.final()]);
    const parsed = JSON.parse(body.toString('utf8')) as { exp?: unknown; data?: T };
    if (typeof parsed.exp !== 'number' || parsed.exp <= now) return null;
    return parsed.data ?? null;
  } catch {
    return null;
  }
}
