import 'server-only';
import { AI_PROVIDERS, isAiProviderId, type AiProviderId } from '@diki/core';

export const CSRF_COOKIE_NAME = 'diki_ai_csrf';
export const KEY_FORM_PATH = '/api/ai/keys/form';
export const KEY_PAGE_PATH = '/ai/keys';
const DEFAULT_RETURN = '/interview';

const KEY_PAGES: Record<AiProviderId, string> = {
  anthropic: 'https://console.anthropic.com/settings/keys',
  openai: 'https://platform.openai.com/api-keys',
  google: 'https://aistudio.google.com/apikey',
};

const ERROR_TEXT: Record<string, string> = {
  invalid_key: 'API 키가 올바르지 않아요. 키를 다시 확인해 주세요.',
  permission: '이 키로 사용할 수 있는 모델이 없거나 권한이 부족해요.',
  provider_rate_limited: 'AI 회사의 사용 한도에 걸렸어요. 한도나 결제 상태를 확인해 주세요.',
  rate_limited: '요청이 많아요. 1분 뒤 다시 시도해 주세요.',
  bad_request: '입력값을 확인해 주세요.',
  expired: '페이지가 만료됐어요. 다시 입력해 주세요.',
  unavailable: '지금은 키를 등록할 수 없어요.',
  upstream: 'AI 서비스와 연결하지 못했어요. 잠시 뒤 다시 시도해 주세요.',
  timeout: 'AI 서비스 응답이 너무 늦어요. 다시 시도해 주세요.',
};

// 같은 사이트의 상대 경로만 돌아갈 곳으로 허용한다 (//host, 역슬래시, 스킴 차단)
export function safeReturnPath(raw: unknown): string {
  if (typeof raw !== 'string' || raw.length > 200) return DEFAULT_RETURN;
  if (!/^\/[A-Za-z0-9\-_/]*$/.test(raw) || raw.startsWith('//')) return DEFAULT_RETURN;
  return raw;
}

export const pickProvider = (raw: unknown): AiProviderId => (isAiProviderId(raw) ? raw : 'anthropic');

const escapeHtml = (text: string) => text
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

export function keyPageHeaders(nonce: string): Record<string, string> {
  return {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-store, max-age=0',
    'Content-Security-Policy': [
      'default-src \'none\'',
      `style-src 'nonce-${ nonce }'`,
      'img-src \'none\'',
      'form-action \'self\'',
      'frame-ancestors \'none\'',
      'base-uri \'none\'',
    ].join('; '),
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
  };
}

interface KeyPageOptions {
  provider: AiProviderId;
  returnTo: string;
  csrf: string;
  nonce: string;
  error?: string | null;
}

// 외부 스크립트·Next 번들 없이 순수 HTML 폼만 내보낸다. 입력한 키는 이 문서와 서버 사이에서만 오간다
export function renderKeyEntryPage({ provider, returnTo, csrf, nonce, error }: KeyPageOptions): string {
  const errorText = error ? ERROR_TEXT[error] ?? ERROR_TEXT.upstream : '';
  const options = AI_PROVIDERS.map((p) => `
        <label class="option">
          <input type="radio" name="provider" value="${ p.id }"${ p.id === provider ? ' checked' : '' }>
          <span>${ escapeHtml(p.label) }</span>
        </label>`).join('');
  const links = AI_PROVIDERS.map((p) => `<a href="${ KEY_PAGES[p.id] }" target="_blank" rel="noopener noreferrer">${ escapeHtml(p.label) }</a>`).join(' · ');

  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>AI API 키 등록 · Diki</title>
<style nonce="${ nonce }">
  :root { --bg: #f8f8f8; --text: rgb(5, 5, 5); --sub: rgb(95, 95, 95); --border: #cccccc; --soft: #efefef; --primary: #0099cc; --on-primary: #f8f8f8; --error: #e60000; }
  @media (prefers-color-scheme: dark) {
    :root { --bg: #121212; --text: rgb(251, 251, 251); --sub: rgb(165, 165, 165); --border: #666666; --soft: #1f1f1f; --primary: #33cfff; --on-primary: #121212; --error: #ff4d4d; }
  }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--text); font-family: -apple-system, BlinkMacSystemFont, "Pretendard", "Apple SD Gothic Neo", sans-serif; }
  main { max-width: 480px; margin: 0 auto; padding: 48px 20px; }
  h1 { font-size: 24px; margin: 0 0 8px; }
  p { color: var(--sub); font-size: 14px; line-height: 1.6; margin: 0; }
  form { margin-top: 28px; display: grid; gap: 16px; }
  fieldset { border: 0; padding: 0; margin: 0; display: flex; gap: 8px; }
  legend { font-size: 14px; color: var(--sub); margin-bottom: 8px; }
  .option { flex: 1; }
  .option input { position: absolute; opacity: 0; }
  .option span { display: block; text-align: center; padding: 10px; border: 1px solid var(--border); border-radius: 999px; font-size: 14px; cursor: pointer; }
  .option input:checked + span { border-color: var(--primary); color: var(--primary); font-weight: 600; }
  .option input:focus-visible + span { outline: 2px solid var(--primary); }
  label.field { display: grid; gap: 8px; font-size: 14px; color: var(--sub); }
  input[type=password] { width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); color: var(--text); font-size: 15px; }
  input[type=password]:focus { outline: none; border-color: var(--primary); }
  button { padding: 12px; border: 0; border-radius: 10px; background: var(--primary); color: var(--on-primary); font-size: 15px; font-weight: 600; cursor: pointer; }
  .error { color: var(--error); font-size: 14px; }
  .notes { margin-top: 28px; padding-top: 20px; border-top: 1px solid var(--border); display: grid; gap: 6px; }
  .notes p { font-size: 13px; }
  a { color: var(--primary); }
  .back { display: inline-block; margin-top: 20px; font-size: 14px; }
</style>
</head>
<body>
<main>
  <h1>AI API 키 등록</h1>
  <p>면접 답변 AI 피드백에 쓸 본인 API 키를 등록해요. 이 페이지에는 분석·광고 스크립트를 포함한 어떤 스크립트도 실행되지 않아요.</p>
  <form method="post" action="${ KEY_FORM_PATH }" autocomplete="off">
    <input type="hidden" name="csrf" value="${ escapeHtml(csrf) }">
    <input type="hidden" name="return" value="${ escapeHtml(returnTo) }">
    <fieldset>
      <legend>AI 회사</legend>${ options }
    </fieldset>
    <label class="field">
      API 키
      <input type="password" name="apiKey" required minlength="20" maxlength="512" autocomplete="off" autocapitalize="off" spellcheck="false" data-1p-ignore data-lpignore="true">
    </label>
    ${ errorText ? `<p class="error" role="alert">${ escapeHtml(errorText) }</p>` : '' }
    <button type="submit">확인 후 저장</button>
  </form>
  <div class="notes">
    <p>· 서버가 키를 해당 회사 API로 확인한 뒤 암호화해 이 브라우저의 보안 쿠키(30일)에 넣어요. 페이지 스크립트로는 읽을 수 없고, Diki DB에는 저장하지 않아요.</p>
    <p>· 답변은 선택한 AI 회사로 전송되고, 사용료는 본인 계정에 청구돼요.</p>
    <p>· 사용 한도를 낮게 정한 전용 키를 권장해요. 공용 PC에서는 사용 후 키를 삭제해 주세요.</p>
    <p>· 키 발급: ${ links }</p>
  </div>
  <a class="back" href="${ escapeHtml(returnTo) }">면접 화면으로 돌아가기</a>
</main>
</body>
</html>`;
}
