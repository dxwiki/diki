import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(appRoot, '..', '..');
const sourceDir = path.join(repoRoot, 'public', 'data');
const targetDir = path.join(appRoot, 'assets', 'content');
const FILES = ['terms.json', 'version.json'];

const missing = FILES.filter((file) => !fs.existsSync(path.join(sourceDir, file)));
if (missing.length) {
  console.error(`public/data 에 ${ missing.join(', ') } 가 없습니다. 루트에서 npm run export-public-data 를 먼저 실행하세요.`);
  process.exit(1);
}

fs.mkdirSync(targetDir, { recursive: true });
for (const file of FILES) {
  const tmp = path.join(targetDir, `${ file }.tmp`);
  fs.copyFileSync(path.join(sourceDir, file), tmp);
  fs.renameSync(tmp, path.join(targetDir, file));
}

const version = JSON.parse(fs.readFileSync(path.join(targetDir, 'version.json'), 'utf8'));
console.log(`설치본 스냅샷 복사 완료: ${ version.termCount }개, contentVersion ${ version.contentVersion } → ${ path.relative(repoRoot, targetDir) }`);
