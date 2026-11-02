import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const requireTargetBuild = process.argv.includes('--require-target-build');

// 웹 코드를 바꾸기 전(FEAT-001 TASK-001) 기록한 보호 파일 sha256
const PROTECTED_FILES = {
  'scripts/fetchTermsStatic.ts': '5f73eca4c37b901b001e30f95aa8ebe0f5966ddcaf61c665076ed0902b01798c',
  'scripts/fetchProfilesStatic.ts': 'e0ff3a8b2f4940209a09a1c7463bb130a8e2c388acc71be8fef9477cc53306db',
  'scripts/calculateLevels.ts': '4f5d4b21a994848f76c2167e3309f64cc5a2e850488102fa43cbde3351319840',
  'scripts/generateFeed.ts': 'cd29f4b68287c03f06b70ece515a83a1600dbba516416248402b619e249924f8',
  'scripts/generateSitemap.ts': 'c740dab35b292b9782fd626c201b71f9dc0929754fb88f45eecc5da71daf493c',
  'scripts/generateRobots.ts': 'ee4d4088dcdde84d33bd1620fdd3a788e053ba4d24ae29c48aa4d2bf4046f1c8',
  'src/utils/fetchData.ts': '41d59d47b837efef9fd9e609941dd47ea072e550c3f71e17997c39e3911f5f97',
  'src/utils/termsServer.ts': 'd57b500734556a27516f0ad5fe7819425aac313bdf41645e2c9012c399bdfcbf',
  'src/utils/filters.ts': 'ddbb2752513e668d100c59f12befada77fd40cc651869941f9412aa3c39d3cf2',
};

// build 를 뺀 기존 npm 스크립트 값
const EXISTING_SCRIPTS = {
  'dev': 'next dev',
  'devbuild': 'next build',
  'preexport': 'rimraf out',
  'export': 'next export',
  'touch': 'touch out/.nojekyll',
  'posttouch': 'touch out/_next/.nojekyll',
  'start': 'next start',
  'lint': 'next lint',
  'lint:fix': 'eslint --fix ./src',
  'format': 'prettier --check --ignore-path .gitignore .',
  'format:fix': 'prettier --write --ignore-path .gitignore .',
  'fetch-terms': 'ts-node --project tsconfig.node.json ./scripts/fetchTermsStatic.ts',
  'calculate-levels': 'ts-node --project tsconfig.node.json ./scripts/calculateLevels.ts',
  'fetch-profiles': 'ts-node --project tsconfig.node.json ./scripts/fetchProfilesStatic.ts',
  'fetch-static-data': 'npm run fetch-terms && npm run calculate-levels && npm run fetch-profiles',
  'static': 'ts-node --project tsconfig.node.json ./scripts/generateFeed.ts && ts-node --project tsconfig.node.json ./scripts/generateSitemap.ts && ts-node --project tsconfig.node.json ./scripts/generateRobots.ts',
};

const ORIGINAL_BUILD = 'npm run fetch-static-data && next build';
const TARGET_BUILD = 'npm run fetch-static-data && npm run export-public-data && next build';

const failures = [];

for (const [file, expected] of Object.entries(PROTECTED_FILES)) {
  const full = path.join(repoRoot, file);
  if (!fs.existsSync(full)) {
    failures.push(`보호 파일 없음: ${ file }`);
    continue;
  }
  const actual = crypto.createHash('sha256').update(fs.readFileSync(full)).digest('hex');
  if (actual !== expected) failures.push(`보호 파일 변경됨: ${ file } (기대 ${ expected.slice(0, 12) }…, 실제 ${ actual.slice(0, 12) }…)`);
}

const pkg = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8'));
const scripts = pkg.scripts ?? {};

for (const [name, expected] of Object.entries(EXISTING_SCRIPTS)) {
  if (scripts[name] !== expected) {
    failures.push(`npm 스크립트 변경됨: ${ name } (기대 "${ expected }", 실제 ${ JSON.stringify(scripts[name]) })`);
  }
}

let buildState = '';
if (scripts.build === TARGET_BUILD) {
  buildState = '목표 값 (내보내기 단계 추가됨)';
} else if (scripts.build === ORIGINAL_BUILD && !requireTargetBuild) {
  buildState = '원래 값 (내보내기 단계 추가 전)';
} else {
  failures.push(`build 스크립트가 목표 값과 다름 (기대 "${ TARGET_BUILD }", 실제 ${ JSON.stringify(scripts.build) })`);
}

if (failures.length > 0) {
  console.error(`checkStaticFlow 실패 (${ failures.length }건)`);
  failures.forEach((f) => console.error(`  ${ f }`));
  process.exit(1);
}

console.log(`checkStaticFlow 통과: 보호 파일 ${ Object.keys(PROTECTED_FILES).length }개 해시 일치, 기존 스크립트 ${ Object.keys(EXISTING_SCRIPTS).length }개 일치, build = ${ buildState }`);
