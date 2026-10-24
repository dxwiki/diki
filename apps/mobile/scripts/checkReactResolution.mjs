import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(appRoot, '../..');
const appNodeModules = path.join(appRoot, 'node_modules');
const failures = [];

const pkgDir = (name, fromDir) => {
  try {
    return path.dirname(createRequire(path.join(fromDir, 'package.json')).resolve(`${ name }/package.json`));
  } catch {
    return null;
  }
};
const version = (dir) => JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8')).version;
const real = (p) => (p ? fs.realpathSync(p) : p);

const appPkg = JSON.parse(fs.readFileSync(path.join(appRoot, 'package.json'), 'utf8'));
const appReact = real(pkgDir('react', appRoot));
const appRN = real(pkgDir('react-native', appRoot));

for (const [name, dir] of [['react', appReact], ['react-native', appRN]]) {
  if (!dir) {
    failures.push(`앱에서 ${ name } 을 찾지 못했다`);
    continue;
  }
  if (!dir.startsWith(appNodeModules + path.sep)) failures.push(`${ name } 이 앱 폴더 밖에서 해석된다: ${ dir }`);
  if (version(dir) !== appPkg.dependencies[name]) failures.push(`${ name } 버전 ${ version(dir) } 이 package.json ${ appPkg.dependencies[name] } 과 다르다`);
  console.log(`앱 ${ name }@${ dir ? version(dir) : '?' } → ${ dir ? path.relative(repoRoot, dir) : '-' }`);
}

if (appRN) {
  const reactFromRN = real(pkgDir('react', appRN));
  if (reactFromRN !== appReact) failures.push(`react-native 가 다른 react 를 해석한다: ${ reactFromRN }`);
}

const webReact = real(pkgDir('react', repoRoot));
if (webReact === appReact) failures.push('웹과 앱이 같은 react 를 쓴다 (웹 React 18 유지 확인 필요)');
else if (webReact) console.log(`웹 react@${ version(webReact) } → ${ path.relative(repoRoot, webReact) }`);

const findCopies = (name) => {
  const found = [];
  const walk = (dir, depth) => {
    if (depth > 6 || !fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory() || entry.name.startsWith('.')) continue;
      const full = path.join(dir, entry.name);
      if (entry.name.startsWith('@')) {
        for (const scoped of fs.readdirSync(full, { withFileTypes: true })) {
          if (scoped.isDirectory()) walk(path.join(full, scoped.name, 'node_modules'), depth + 1);
        }
        continue;
      }
      if (entry.name === name && fs.existsSync(path.join(full, 'package.json'))) found.push(full);
      walk(path.join(full, 'node_modules'), depth + 1);
    }
  };
  walk(path.join(repoRoot, 'node_modules'), 0);
  walk(appNodeModules, 0);
  return found;
};

const rnCopies = findCopies('react-native');
if (rnCopies.length !== 1) failures.push(`react-native 가 ${ rnCopies.length }벌 설치돼 있다: ${ rnCopies.map((p) => path.relative(repoRoot, p)).join(', ') }`);
const appReactCopies = findCopies('react').filter((p) => version(p).split('.')[0] === version(appReact ?? p).split('.')[0]);
if (appReactCopies.length !== 1) failures.push(`앱용 react(${ appReact ? version(appReact) : '?' }) 계열이 여러 벌이다: ${ appReactCopies.map((p) => path.relative(repoRoot, p)).join(', ') }`);

const metro = createRequire(path.join(appRoot, 'package.json'))('./metro.config.js');
const extra = metro.resolver?.extraNodeModules ?? {};
for (const [name, dir] of [['react', appReact], ['react-native', appRN]]) {
  if (real(extra[name]) !== dir) failures.push(`metro.config.js extraNodeModules.${ name } 가 앱 사본이 아니다: ${ extra[name] }`);
}
if (typeof metro.resolver?.resolveRequest !== 'function') failures.push('metro.config.js 에 resolveRequest 고정이 없다');

if (failures.length) {
  console.error('check:react 실패');
  for (const f of failures) console.error(`- ${ f }`);
  process.exit(1);
}
console.log('check:react 통과');
