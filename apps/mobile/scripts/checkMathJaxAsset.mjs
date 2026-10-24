import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(appRoot, '..', '..');
const require = createRequire(path.join(appRoot, 'package.json'));
const failures = [];
const assetRel = 'assets/mathjax/tex-svg-full.txt';
const assetPath = path.join(appRoot, assetRel);

const readApp = (rel) => {
  const file = path.join(appRoot, rel);
  if (!fs.existsSync(file)) {
    failures.push(`${ rel } 없음`);
    return '';
  }
  return fs.readFileSync(file, 'utf8');
};

const pkg = JSON.parse(readApp('package.json') || '{}');
if (!pkg.devDependencies?.mathjax) failures.push('package.json devDependencies 에 mathjax 가 없다');
if (!/copyMathJax\.mjs/.test(pkg.scripts?.postinstall ?? '')) failures.push('package.json postinstall 이 copyMathJax.mjs 를 실행하지 않는다');

let mathJaxVersion = '';
let source = '';
try {
  const mathJaxRoot = path.dirname(require.resolve('mathjax/package.json'));
  mathJaxVersion = JSON.parse(fs.readFileSync(path.join(mathJaxRoot, 'package.json'), 'utf8')).version;
  source = path.join(mathJaxRoot, 'es5', 'tex-svg-full.js');
  if (!mathJaxVersion.startsWith('3.')) failures.push(`mathjax 버전이 3.x 가 아니다 (${ mathJaxVersion })`);
} catch {
  failures.push('mathjax 패키지를 찾을 수 없다 (npm install 필요)');
}

let asset = '';
if (!fs.existsSync(assetPath)) {
  failures.push(`${ assetRel } 없음 (postinstall copy-mathjax 가 실행되지 않았다)`);
} else {
  asset = fs.readFileSync(assetPath, 'utf8');
  if (asset.length < 500000) failures.push(`${ assetRel } 크기가 너무 작다 (${ asset.length })`);
  if (source && fs.existsSync(source) && !fs.readFileSync(source).equals(fs.readFileSync(assetPath))) {
    failures.push(`${ assetRel } 가 설치된 mathjax/es5/tex-svg-full.js 와 다르다 (npm run copy-mathjax 필요)`);
  }
}

// 설치본이 미리 담은 컴포넌트 목록 (Loader.preLoad 인자)
const preloaded = new Set(
  [...asset.matchAll(/preLoad\(([^)]*)\)/g)].flatMap((m) => [...m[1].matchAll(/"([^"]+)"/g)].map((n) => n[1])),
);
for (const name of ['loader', 'startup', 'input/tex-full', 'output/svg']) {
  if (asset && !preloaded.has(name)) failures.push(`설치본에 ${ name } 이 포함되지 않았다`);
}

// core 의 MathJax 설정이 요구하는 확장이 모두 설치본에 포함돼 추가 다운로드가 없어야 한다
const coreHtml = fs.readFileSync(path.join(repoRoot, 'packages/core/src/articleHtml.ts'), 'utf8');
const loadMatch = coreHtml.match(/loader:\s*\{\s*load:\s*\[([^\]]*)\]/);
const loadList = loadMatch ? [...loadMatch[1].matchAll(/'([^']+)'/g)].map((m) => m[1]) : [];
if (!loadMatch) failures.push('core MATHJAX_TEX_CONFIG 의 loader.load 를 찾을 수 없다');
const packagesMatch = coreHtml.match(/packages:\s*\{\s*'\[\+\]':\s*\[([^\]]*)\]/);
const texPackages = packagesMatch ? [...packagesMatch[1].matchAll(/'([^']+)'/g)].map((m) => `[tex]/${ m[1] }`) : [];
for (const name of new Set([...loadList, ...texPackages])) {
  if (asset && !preloaded.has(name)) failures.push(`MathJax 설정의 ${ name } 이 설치본에 포함되지 않아 추가 다운로드가 필요하다`);
}

const metro = readApp('metro.config.js');
if (!/assetExts[\s\S]*'txt'/.test(metro)) failures.push('metro.config.js assetExts 에 txt 가 없다');

const globalTypes = readApp('global.d.ts');
if (!/declare module '\*\.txt'/.test(globalTypes)) failures.push("global.d.ts 에 '*.txt' 모듈 선언이 없다");

const loader = readApp('lib/webview/mathjax.ts');
if (!/from '@\/assets\/mathjax\/tex-svg-full\.txt'/.test(loader)) failures.push('lib/webview/mathjax.ts 가 설치본 자산을 읽지 않는다');
if (!/Asset\.fromModule\(/.test(loader)) failures.push('lib/webview/mathjax.ts 가 expo-asset 으로 자산을 읽지 않는다');

const webView = readApp('components/detail/ArticleWebView.tsx');
if (!/buildArticleHtml\(\{\s*content,\s*colors,\s*mathJaxScript\s*\}\)/.test(webView)) failures.push('ArticleWebView 가 buildArticleHtml({ content, colors, mathJaxScript }) 를 쓰지 않는다');
if (!/useMathJaxScript\(\)/.test(webView)) failures.push('ArticleWebView 가 설치본 MathJax 스크립트를 쓰지 않는다');
if (!/source=\{\{\s*html\s*\}\}/.test(webView)) failures.push('ArticleWebView 가 source={{ html }} 로 그리지 않는다');
if (!/onShouldStartLoadWithRequest=\{/.test(webView)) failures.push('ArticleWebView 가 onShouldStartLoadWithRequest 로 페이지 이동을 막지 않는다');
if (/https?:\/\/|<script[^>]*\bsrc/i.test(webView + loader)) failures.push('ArticleWebView·mathjax.ts 에 외부 주소나 script src 가 있다');

try {
  execFileSync('git', ['check-ignore', '-q', path.join('apps/mobile', assetRel)], { cwd: repoRoot, stdio: 'ignore' });
} catch {
  failures.push(`${ assetRel } 가 .gitignore 로 무시되지 않는다 (생성 자산)`);
}

if (failures.length) {
  console.error('check:mathjax 실패');
  for (const f of failures) console.error(`- ${ f }`);
  process.exit(1);
}
console.log(`check:mathjax 통과 (mathjax ${ mathJaxVersion }, ${ assetRel } ${ asset.length } bytes, 설치본 포함 확인: ${ [...new Set([...loadList, ...texPackages])].join(', ') })`);
