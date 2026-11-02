import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(path.join(appRoot, 'package.json'));
const target = path.join(appRoot, 'assets', 'mathjax', 'tex-svg-full.txt');

let source;
try {
  source = path.join(path.dirname(require.resolve('mathjax/package.json')), 'es5', 'tex-svg-full.js');
} catch {
  // devDependency 없이 설치한 경우(웹 배포 등)는 건너뛰고 check:mathjax 가 잡는다
  console.warn('copy-mathjax: mathjax 패키지가 없어 건너뛴다');
  process.exit(0);
}

if (!fs.existsSync(source)) {
  console.error(`copy-mathjax: ${ source } 없음`);
  process.exit(1);
}

fs.mkdirSync(path.dirname(target), { recursive: true });
fs.copyFileSync(source, target);
console.log(`copy-mathjax: ${ path.relative(appRoot, target) } (${ fs.statSync(target).size } bytes)`);
