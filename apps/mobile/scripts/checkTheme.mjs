import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(appRoot, '../..');
const failures = [];

const readBlockVars = (css, selector) => {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = css.match(new RegExp(`(?:^|\\n)\\s*${ escaped }\\s*\\{([^}]*)\\}`));
  if (!match) {
    failures.push(`globals.css 에서 ${ selector } 블록을 찾지 못했다`);
    return {};
  }
  const vars = {};
  for (const m of match[1].matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) {
    vars[m[1]] = m[2].trim();
  }
  return vars;
};

const css = fs.readFileSync(path.join(repoRoot, 'src/app/globals.css'), 'utf8');
const colors = JSON.parse(fs.readFileSync(path.join(appRoot, 'theme/colors.json'), 'utf8'));
const expected = { light: readBlockVars(css, ':root'), dark: readBlockVars(css, '.dark') };

const extraSchemes = Object.keys(colors).filter((k) => !(k in expected));
if (extraSchemes.length) failures.push(`colors.json 에 알 수 없는 키: ${ extraSchemes.join(', ') }`);

for (const scheme of ['light', 'dark']) {
  const want = expected[scheme];
  const got = colors[scheme] ?? {};
  if (!Object.keys(want).length) failures.push(`${ scheme }: globals.css 변수가 비어 있다`);
  for (const [name, value] of Object.entries(want)) {
    if (!(name in got)) failures.push(`${ scheme }: ${ name } 없음`);
    else if (got[name] !== value) failures.push(`${ scheme }: ${ name } 값 다름 (css ${ value }, app ${ got[name] })`);
  }
  for (const name of Object.keys(got)) {
    if (!(name in want)) failures.push(`${ scheme }: globals.css 에 없는 ${ name }`);
  }
  console.log(`${ scheme }: globals.css 변수 ${ Object.keys(want).length }개, colors.json ${ Object.keys(got).length }개`);
}

const appJson = JSON.parse(fs.readFileSync(path.join(appRoot, 'app.json'), 'utf8'));
if (appJson.expo?.userInterfaceStyle !== 'automatic') failures.push('app.json userInterfaceStyle 이 automatic 이 아니다');

const themeSrc = fs.readFileSync(path.join(appRoot, 'theme/index.ts'), 'utf8');
if (!/import\s*\{[^}]*\buseColorScheme\b[^}]*\}\s*from\s*'react-native'/.test(themeSrc)) failures.push('theme/index.ts 가 react-native useColorScheme 을 쓰지 않는다');
if (!/from\s*'\.\/colors\.json'/.test(themeSrc)) failures.push('theme/index.ts 가 colors.json 을 쓰지 않는다');
if (!/useColorScheme\(\)\s*===\s*'dark'/.test(themeSrc)) failures.push('theme/index.ts 가 기기 색 모드로 light·dark 를 고르지 않는다');

const rootLayout = fs.readFileSync(path.join(appRoot, 'app/_layout.tsx'), 'utf8');
if (!/ThemeProvider/.test(rootLayout) || !/getNavigationTheme\(/.test(rootLayout)) failures.push('app/_layout.tsx 가 앱 테마를 네비게이션 테마로 쓰지 않는다');
if (!/StatusBar/.test(rootLayout)) failures.push('app/_layout.tsx 에 상태바 설정이 없다');

if (failures.length) {
  console.error('check:theme 실패');
  for (const f of failures) console.error(`- ${ f }`);
  process.exit(1);
}
console.log('check:theme 통과');
