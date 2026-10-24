import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { TermData } from '../src/types';
import { splitBlockMath, isBlockMath, parseMarkdownSegment, needsWebRender } from '../src/markdown';
import { MATHJAX_TEX_CONFIG, renderArticleBody, buildArticleHtml, parseArticleMessage } from '../src/articleHtml';
import { splitBlocks as legacySplitBlocks, isBlockMathBlock as legacyIsBlockMath, parseMarkdownSegment as legacyParseMarkdownSegment } from './legacy/markdown';

const repoRoot = path.resolve(__dirname, '../../../..');
const publicTermsPath = path.join(repoRoot, 'public', 'data', 'terms.json');
const webTermsPath = path.join(repoRoot, 'src', 'data', 'terms.json');
const colorsPath = path.join(repoRoot, 'apps', 'mobile', 'theme', 'colors.json');
const mathJaxProviderPath = path.join(repoRoot, 'src', 'components', 'posts', 'MathJaxProvider.tsx');

const readJson = <T>(file: string): T => {
  if (!fs.existsSync(file)) throw new Error(`${ file } 가 없다.`);
  return JSON.parse(fs.readFileSync(file, 'utf8')) as T;
};

const publicTerms = readJson<TermData[]>(publicTermsPath);
const webTerms = fs.existsSync(webTermsPath) ? readJson<TermData[]>(webTermsPath).filter((t) => t.publish !== false) : [];
const colors = readJson<{ light: Record<string, string>; dark: Record<string, string> }>(colorsPath);

const MATHJAX_MARKER = 'window.__DIKI_TEST_MATHJAX__ = "</script><b>inline</b>";';

const escapeText = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// 웹 MarkdownContent 의 렌더 구조를 legacy 함수로 만든 기대값
const legacyBody = (content: string) => legacySplitBlocks(content)
  .map((block) => (legacyIsBlockMath(block)
    ? `<div class="markdown-math-block">${ escapeText(block) }</div>`
    : `<span class="break-all">${ legacyParseMarkdownSegment(block) }</span>`))
  .join('');

const markdownFields = (term: TermData): string[] => [
  term.description?.full,
  term.difficulty?.description,
  term.usecase?.description,
  term.usecase?.example,
  ...(term.terms ?? []).map((t) => t.description),
].filter((text): text is string => typeof text === 'string');

const allTerms = [...publicTerms, ...webTerms];

test(`description.full 블록 분리·변환이 legacy MarkdownContent 와 같다 (용어 ${ allTerms.length }개)`, () => {
  assert.ok(publicTerms.length > 0);
  allTerms.forEach((term) => {
    const content = term.description?.full ?? '';
    const blocks = splitBlockMath(content);
    assert.deepEqual(blocks, legacySplitBlocks(content), `${ term.id } 분리`);
    blocks.forEach((block, i) => {
      assert.equal(isBlockMath(block), legacyIsBlockMath(block), `${ term.id } 블록 ${ i }`);
      if (!isBlockMath(block)) assert.equal(parseMarkdownSegment(block), legacyParseMarkdownSegment(block), `${ term.id } 블록 ${ i }`);
    });
    assert.equal(renderArticleBody(content), legacyBody(content), `${ term.id } 본문`);
  });
});

test('다른 마크다운 필드도 legacy 변환과 같다', () => {
  allTerms.forEach((term) => {
    markdownFields(term).forEach((text) => {
      assert.equal(renderArticleBody(text), legacyBody(text), `${ term.id }`);
    });
  });
});

test('buildArticleHtml 본문은 renderArticleBody 결과를 그대로 담는다', () => {
  publicTerms.forEach((term) => {
    const content = term.description?.full ?? '';
    const html = buildArticleHtml({ content, colors: colors.light, mathJaxScript: '' });
    assert.ok(html.includes(`<div id="article">${ renderArticleBody(content) }</div>`), `${ term.id }`);
  });
});

test('buildArticleHtml 은 외부 script src 없이 MathJax 를 인라인으로 넣는다 (오프라인)', () => {
  const content = publicTerms.find((t) => (t.description?.full ?? '').includes('$$'))?.description?.full ?? '$$a$$';
  const html = buildArticleHtml({ content, colors: colors.light, mathJaxScript: MATHJAX_MARKER });
  assert.ok(!/<script[^>]*\bsrc\s*=/i.test(html), 'script src 가 없어야 한다');
  assert.ok(!/<link[^>]*\bhref\s*=/i.test(html), '외부 stylesheet 가 없어야 한다');
  assert.ok(!/cdn\.jsdelivr|unpkg\.com|cdnjs/i.test(html), 'CDN 주소가 없어야 한다');
  assert.ok(html.includes('window.__DIKI_TEST_MATHJAX__ = "<\\/script><b>inline</b>";'), '주입한 MathJax 문자열(</script 이스케이프)');
  const scriptOpen = (html.match(/<script>/g) ?? []).length;
  const scriptClose = (html.match(/<\/script>/g) ?? []).length;
  assert.equal(scriptOpen, 3);
  assert.equal(scriptClose, 3);
  assert.ok(html.indexOf('window.MathJax = ') < html.indexOf('__DIKI_TEST_MATHJAX__'), 'MathJax 설정이 스크립트보다 먼저');
});

test('MathJax 구분자 설정이 웹 MathJaxProvider 와 같다', () => {
  assert.deepEqual(MATHJAX_TEX_CONFIG.tex.inlineMath, [['$', '$'], ['\\(', '\\)']]);
  assert.deepEqual(MATHJAX_TEX_CONFIG.tex.displayMath, [['$$', '$$'], ['\\[', '\\]']]);
  assert.deepEqual(MATHJAX_TEX_CONFIG.loader.load, ['[tex]/html']);
  assert.deepEqual(MATHJAX_TEX_CONFIG.tex.packages, { '[+]': ['html'] });
  if (fs.existsSync(mathJaxProviderPath)) {
    const source = fs.readFileSync(mathJaxProviderPath, 'utf8').replace(/\s+/g, '');
    ["['$','$']", "['\\\\(','\\\\)']", "['$$','$$']", "['\\\\[','\\\\]']", "load:['[tex]/html']", "packages:{'[+]':['html']}"].forEach((part) => {
      assert.ok(source.includes(part), `웹 설정에 ${ part }`);
    });
  }
  const html = buildArticleHtml({ content: '', colors: colors.light, mathJaxScript: '' });
  assert.ok(html.includes(JSON.stringify(MATHJAX_TEX_CONFIG)), 'HTML 에 같은 설정');
});

test('색 변수는 colors.json 과 같은 이름·값으로 들어간다 (라이트·다크)', () => {
  (['light', 'dark'] as const).forEach((scheme) => {
    const palette = colors[scheme];
    assert.ok(Object.keys(palette).length >= 24);
    const html = buildArticleHtml({ content: 'a', colors: palette, mathJaxScript: '' });
    Object.entries(palette).forEach(([name, value]) => {
      assert.ok(html.includes(`--${ name }: ${ value };`), `${ scheme } --${ name }`);
    });
    ['--primary', '--text', '--text-secondary', '--accent', '--gray1', '--gray3', '--gray4', '--gray5'].forEach((name) => {
      assert.ok(html.includes(`var(${ name })`), `CSS 가 ${ name } 를 쓴다`);
    });
  });
});

test('높이·링크 postMessage 스크립트를 담는다', () => {
  const html = buildArticleHtml({ content: '[x](/posts/a)', colors: colors.light, mathJaxScript: '' });
  assert.ok(html.includes('ReactNativeWebView.postMessage'));
  assert.ok(html.includes('type: \'height\''));
  assert.ok(html.includes('type: \'link\''));
  assert.ok(html.includes('preventDefault'));
  assert.ok(html.includes('<a href="/posts/a" target="_blank" rel="noopener noreferrer">x</a>'));
});

test('parseArticleMessage 는 형식이 맞는 메시지만 받는다', () => {
  assert.deepEqual(parseArticleMessage(JSON.stringify({ type: 'height', height: 120 })), { type: 'height', height: 120 });
  assert.deepEqual(parseArticleMessage(JSON.stringify({ type: 'link', href: '/posts/a' })), { type: 'link', href: '/posts/a' });
  assert.equal(parseArticleMessage(JSON.stringify({ type: 'height', height: 'x' })), null);
  assert.equal(parseArticleMessage(JSON.stringify({ type: 'other' })), null);
  assert.equal(parseArticleMessage('not json'), null);
  assert.equal(parseArticleMessage('null'), null);
});

test('needsWebRender 는 수식·표·목록·인용·이미지가 있을 때만 true', () => {
  assert.equal(needsWebRender('보통 문장'), false);
  assert.equal(needsWebRender(''), false);
  assert.equal(needsWebRender(undefined), false);
  assert.equal(needsWebRender('$x$'), true);
  assert.equal(needsWebRender('| a | b |\n|---|---|'), true);
  assert.equal(needsWebRender('- 항목'), true);
  assert.equal(needsWebRender('1. 항목'), true);
  assert.equal(needsWebRender('> 인용'), true);
  assert.equal(needsWebRender('![a](b.png)'), true);
});
