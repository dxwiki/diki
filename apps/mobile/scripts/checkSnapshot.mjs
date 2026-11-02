import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(appRoot, '..', '..');
const contentDir = path.join(appRoot, 'assets', 'content');
const validateSource = path.join(repoRoot, 'packages', 'core', 'src', 'content', 'validate.ts');

const TERM_FIELDS = new Set(['url', 'id', 'title', 'description', 'difficulty', 'relevance', 'tags', 'terms', 'usecase', 'references', 'metadata']);
const METADATA_FIELDS = new Set(['created_at', 'updated_at']);

const failures = [];

// core 검사 함수를 그대로 쓰려고 validate.ts 를 변환해 불러온다
const loadValidators = async () => {
  const { outputText } = ts.transpileModule(fs.readFileSync(validateSource, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 },
  });
  return import(`data:text/javascript;base64,${ Buffer.from(outputText).toString('base64') }`);
};

const readRaw = (file) => {
  const full = path.join(contentDir, file);
  if (!fs.existsSync(full)) {
    failures.push(`assets/content/${ file } 없음 (npm run --workspace @diki/mobile sync-content 실행 필요)`);
    return null;
  }
  return fs.readFileSync(full, 'utf8');
};

const parse = (file, raw) => {
  try {
    return JSON.parse(raw);
  } catch (error) {
    failures.push(`assets/content/${ file } JSON 파싱 실패: ${ error.message }`);
    return undefined;
  }
};

const { validateContentVersion, validateTermsPayload } = await loadValidators();
const termsRaw = readRaw('terms.json');
const versionRaw = readRaw('version.json');

let summary = '';
if (termsRaw !== null && versionRaw !== null) {
  const termsJson = parse('terms.json', termsRaw);
  const versionJson = parse('version.json', versionRaw);
  const version = versionJson === undefined ? null : validateContentVersion(versionJson);
  if (!version) failures.push('version.json 이 validateContentVersion 을 통과하지 못한다');
  else {
    const terms = termsJson === undefined ? null : validateTermsPayload(termsJson, version);
    if (!terms) failures.push('terms.json 이 validateTermsPayload 를 통과하지 못한다 (배열·termCount·id·url·title)');
    else {
      const hash = crypto.createHash('sha256').update(termsRaw).digest('hex').slice(0, 16);
      if (hash !== version.contentVersion) failures.push(`contentVersion(${ version.contentVersion }) 이 terms.json 해시(${ hash }) 와 다르다`);
      const extra = new Set();
      for (const term of terms) {
        for (const key of Object.keys(term)) if (!TERM_FIELDS.has(key)) extra.add(key);
        if (term.metadata && typeof term.metadata === 'object') {
          for (const key of Object.keys(term.metadata)) if (!METADATA_FIELDS.has(key)) extra.add(`metadata.${ key }`);
        }
      }
      if (extra.size) failures.push(`공개하지 않는 필드가 있다: ${ [...extra].join(', ') }`);
      summary = `${ terms.length }개, contentVersion ${ version.contentVersion }, generatedAt ${ version.generatedAt }`;

      const publicVersionFile = path.join(repoRoot, 'public', 'data', 'version.json');
      if (fs.existsSync(publicVersionFile)) {
        const publicVersion = JSON.parse(fs.readFileSync(publicVersionFile, 'utf8'));
        if (publicVersion.contentVersion !== version.contentVersion) {
          console.warn(`경고: public/data 의 contentVersion(${ publicVersion.contentVersion }) 과 설치본(${ version.contentVersion }) 이 다르다. 필요하면 sync-content 를 다시 실행한다.`);
        }
      }
    }
  }
}

if (failures.length) {
  console.error('check:snapshot 실패');
  for (const f of failures) console.error(`- ${ f }`);
  process.exit(1);
}
console.log(`check:snapshot 통과 (${ summary })`);
