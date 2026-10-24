import { splitBlockMath, isBlockMath, parseMarkdownSegment } from './markdown';

// 웹 MathJaxProvider.tsx 와 같은 설정
export const MATHJAX_TEX_CONFIG = {
  loader: { load: ['[tex]/html'] },
  tex: {
    packages: { '[+]': ['html'] },
    inlineMath: [
      ['$', '$'],
      ['\\(', '\\)'],
    ],
    displayMath: [
      ['$$', '$$'],
      ['\\[', '\\]'],
    ],
  },
};

export type ArticleMessage =
  | { type: 'height'; height: number }
  | { type: 'link'; href: string };

export interface BuildArticleHtmlOptions {
  content: string;
  colors: Record<string, string>;
  mathJaxScript: string;
}

const escapeHtml = (text: string): string => text
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;');

// 웹 MarkdownContent 와 같은 블록 분리·변환 결과 (블록 수식은 React 텍스트처럼 이스케이프)
export function renderArticleBody(content: string): string {
  return splitBlockMath(content)
    .map((block) => (isBlockMath(block)
      ? `<div class="markdown-math-block">${ escapeHtml(block) }</div>`
      : `<span class="break-all">${ parseMarkdownSegment(block) }</span>`))
    .join('');
}

const cssVariables = (colors: Record<string, string>): string => Object.entries(colors)
  .filter(([name, value]) => /^[a-z0-9-]+$/i.test(name) && !/[;{}<>]/.test(value))
  .map(([name, value]) => `--${ name }: ${ value };`)
  .join(' ');

const inlineScript = (script: string): string => script.replace(/<\/script/gi, '<\\/script');

const ARTICLE_CSS = `
html, body { margin: 0; padding: 0; background: transparent; }
body { color: var(--text-secondary); font-family: -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Noto Sans KR', 'Segoe UI', Roboto, sans-serif; font-size: 16px; line-height: 1.75; -webkit-text-size-adjust: 100%; word-break: keep-all; overflow-wrap: break-word; }
#article { overflow: hidden; }
strong { color: var(--text); font-weight: 600; }
p, span, li { color: var(--text-secondary); }
p { margin-top: 0; margin-bottom: 0.75rem; line-height: 1.7; }
a { color: var(--accent); text-decoration: none; font-weight: bold; }
code { padding: 0.25rem 0.4rem; border-radius: 0.25rem; color: var(--primary); background-color: var(--gray4); font-size: 0.875em; font-weight: 600; }
ol, ul { margin: 0.4rem 0; padding-left: 1.625em; }
ol > li::marker, ul > li::marker { color: var(--gray1); }
.list-decimal, .list-disc { margin: 0.2rem 0; padding-left: 0.2rem; }
.list-decimal { list-style-type: decimal; }
.list-disc { list-style-type: disc; }
.break-all { word-break: break-all; }
.br-gap { margin-bottom: 0.75rem; }
.markdown-math-block { color: var(--text) !important; overflow-x: auto; overflow-y: hidden; }
.markdown-math-inline { color: var(--text) !important; }
mjx-container { color: var(--text); }
mjx-container[display="true"] { overflow-x: auto; overflow-y: hidden; max-width: 100%; }
.markdown-blockquote { background-color: var(--gray5); border-left: 4px solid var(--primary); padding: 0.5rem 1rem; margin: 0.5rem 0; border-radius: 0.25rem 0 0 0.25rem; color: var(--gray0); font-style: normal; }
.font-tinos { font-family: 'Tinos', 'Times New Roman', serif; }
.font-semibold { font-weight: 600; }
.markdown-table { border-collapse: collapse; width: 100%; margin: 0.8rem 0; table-layout: auto; font-size: 0.875em; line-height: 1.7; }
.markdown-table th, .markdown-table td { border: 1px solid var(--gray3); padding: 0.5rem; text-align: left; color: var(--text-secondary); }
.markdown-table th:first-child, .markdown-table td:first-child { width: 1%; padding: 0 1.5rem; min-width: 100px; text-align: center; white-space: nowrap; }
.markdown-table th:not(:first-child), .markdown-table td:not(:first-child) { width: auto; padding-left: 1.5rem; }
.markdown-table th { border: 0; font-weight: 600; color: var(--text); }
.flex { display: flex; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.my-1\\.5 { margin-top: 0.375rem; margin-bottom: 0.375rem; }
.w-full { width: 100%; }
.rounded-lg { border-radius: 0.5rem; }
.m-0 { margin: 0; }
.mt-1 { margin-top: 0.25rem; }
.text-gray1 { color: var(--gray1); }
.text-center { text-align: center; }
.text-sm { font-size: 0.875rem; line-height: 1.25rem; }
img { max-width: 100%; height: auto; }
`;

// 높이·링크를 RN WebView 로 보낸다 (메시지는 ArticleMessage JSON 문자열)
const BRIDGE_SCRIPT = `
(function () {
  var post = function (message) {
    if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
      window.ReactNativeWebView.postMessage(JSON.stringify(message));
    }
  };
  var lastHeight = -1;
  var sendHeight = function () {
    var el = document.getElementById('article');
    var height = Math.ceil(el ? el.getBoundingClientRect().height : document.body.scrollHeight);
    if (height !== lastHeight) {
      lastHeight = height;
      post({ type: 'height', height: height });
    }
  };
  window.__dikiSendHeight = sendHeight;
  document.addEventListener('click', function (event) {
    var node = event.target;
    while (node && node.nodeName !== 'A') node = node.parentNode;
    if (!node) return;
    event.preventDefault();
    post({ type: 'link', href: node.getAttribute('href') || '' });
  }, true);
  window.addEventListener('load', sendHeight);
  window.addEventListener('resize', sendHeight);
  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(sendHeight).observe(document.getElementById('article') || document.body);
  }
  Array.prototype.forEach.call(document.images, function (img) {
    img.addEventListener('load', sendHeight);
    img.addEventListener('error', sendHeight);
  });
  sendHeight();
})();
`;

const mathJaxConfigScript = (): string => {
  const config = JSON.stringify(MATHJAX_TEX_CONFIG);
  return `
window.MathJax = Object.assign(${ config }, {
  svg: { fontCache: 'global' },
  startup: {
    pageReady: function () {
      return MathJax.startup.defaultPageReady().then(function () {
        if (window.__dikiSendHeight) window.__dikiSendHeight();
      }, function () {
        if (window.__dikiSendHeight) window.__dikiSendHeight();
      });
    }
  }
});
`;
};

// 외부 리소스 없이 동작하는 상세 본문 HTML (MathJax 스크립트는 인라인 주입)
export function buildArticleHtml({ content, colors, mathJaxScript }: BuildArticleHtmlOptions): string {
  return [
    '<!DOCTYPE html>',
    '<html lang="ko">',
    '<head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">',
    `<style>:root { ${ cssVariables(colors) } }${ ARTICLE_CSS }</style>`,
    `<script>${ mathJaxConfigScript() }</script>`,
    '</head>',
    '<body>',
    `<div id="article">${ renderArticleBody(content) }</div>`,
    `<script>${ BRIDGE_SCRIPT }</script>`,
    `<script>${ inlineScript(mathJaxScript) }</script>`,
    '</body>',
    '</html>',
  ].join('\n');
}

// WebView onMessage 의 문자열을 검증해 메시지로 바꾼다
export function parseArticleMessage(data: string): ArticleMessage | null {
  try {
    const parsed = JSON.parse(data) as { type?: unknown; height?: unknown; href?: unknown };
    if (parsed?.type === 'height' && typeof parsed.height === 'number' && Number.isFinite(parsed.height)) {
      return { type: 'height', height: parsed.height };
    }
    if (parsed?.type === 'link' && typeof parsed.href === 'string') {
      return { type: 'link', href: parsed.href };
    }
    return null;
  } catch {
    return null;
  }
}
