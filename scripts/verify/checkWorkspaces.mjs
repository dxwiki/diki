import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const failures = [];
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(repoRoot, rel), 'utf8'));

const EXPECTED_WORKSPACES = ['packages/core', 'apps/mobile'];
const PACKAGES = [
  { dir: 'packages/core', name: '@diki/core' },
  { dir: 'apps/mobile', name: '@diki/mobile' },
];

const rootPkg = readJson('package.json');
if (JSON.stringify(rootPkg.workspaces) !== JSON.stringify(EXPECTED_WORKSPACES)) {
  failures.push(`루트 workspaces 가 ${ JSON.stringify(EXPECTED_WORKSPACES) } 가 아니다: ${ JSON.stringify(rootPkg.workspaces) }`);
}
if (rootPkg.name !== 'diki') failures.push(`루트 package.json name 이 diki 가 아니다: ${ rootPkg.name }`);
for (const script of ['dev', 'devbuild', 'build', 'lint']) {
  if (!rootPkg.scripts?.[script]) failures.push(`루트 웹 스크립트 ${ script } 가 없다`);
}

for (const { dir, name } of PACKAGES) {
  const pkgFile = path.join(repoRoot, dir, 'package.json');
  if (!fs.existsSync(pkgFile)) {
    failures.push(`${ dir }/package.json 없음`);
    continue;
  }
  const pkg = readJson(`${ dir }/package.json`);
  if (pkg.name !== name) failures.push(`${ dir } name 이 ${ name } 가 아니다: ${ pkg.name }`);
  const link = path.join(repoRoot, 'node_modules', name);
  if (!fs.existsSync(link)) {
    failures.push(`node_modules/${ name } 링크가 없다 (npm install 필요)`);
  } else if (fs.realpathSync(link) !== fs.realpathSync(path.join(repoRoot, dir))) {
    failures.push(`node_modules/${ name } 가 ${ dir } 를 가리키지 않는다: ${ fs.realpathSync(link) }`);
  }
}

for (const rel of ['next.config.mjs', 'src/app', 'src/app/globals.css', 'tailwind.config.ts', 'tsconfig.json', 'public']) {
  if (!fs.existsSync(path.join(repoRoot, rel))) failures.push(`웹 파일 ${ rel } 이 루트에 없다`);
}
for (const rel of ['apps/web', 'apps/mobile/next.config.mjs', 'apps/mobile/src/app']) {
  if (fs.existsSync(path.join(repoRoot, rel))) failures.push(`웹이 옮겨진 흔적이 있다: ${ rel }`);
}

if (failures.length) {
  console.error('checkWorkspaces 실패');
  for (const f of failures) console.error(`- ${ f }`);
  process.exit(1);
}
console.log(`checkWorkspaces 통과 (workspaces ${ EXPECTED_WORKSPACES.join(', ') })`);
