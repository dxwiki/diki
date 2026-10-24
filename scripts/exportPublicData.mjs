import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const TERM_FIELDS = ['url', 'id', 'title', 'description', 'difficulty', 'relevance', 'tags', 'terms', 'usecase', 'references'];
const METADATA_FIELDS = ['created_at', 'updated_at'];
const MIN_APP_VERSION = '1.0.0';

const readArg = (name, fallback) => {
  const index = process.argv.indexOf(name);
  if (index === -1) return fallback;
  const value = process.argv[index + 1];
  if (!value || value.startsWith('--')) throw new Error(`${ name } 인자에 값이 없습니다`);
  return path.resolve(value);
};

const pick = (source, fields) => {
  const result = {};
  for (const field of fields) {
    if (source[field] !== undefined) result[field] = source[field];
  }
  return result;
};

export const toPublicTerm = (term) => {
  const publicTerm = pick(term, TERM_FIELDS);
  if (term.metadata && typeof term.metadata === 'object') {
    publicTerm.metadata = pick(term.metadata, METADATA_FIELDS);
  }
  return publicTerm;
};

export const exportPublicData = ({ input, out }) => {
  const terms = JSON.parse(fs.readFileSync(input, 'utf8'));
  if (!Array.isArray(terms)) throw new Error(`용어 배열이 아닙니다: ${ input }`);

  const publicTerms = terms.filter((term) => term && term.publish === true).map(toPublicTerm);
  const termsContent = JSON.stringify(publicTerms);
  const version = {
    contentVersion: crypto.createHash('sha256').update(termsContent).digest('hex').slice(0, 16),
    generatedAt: new Date().toISOString(),
    termCount: publicTerms.length,
    minAppVersion: MIN_APP_VERSION,
  };

  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, 'terms.json'), termsContent);
  fs.writeFileSync(path.join(out, 'version.json'), JSON.stringify(version));
  return version;
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const input = readArg('--input', path.join(repoRoot, 'src', 'data', 'terms.json'));
  const out = readArg('--out', path.join(repoRoot, 'public', 'data'));
  const version = exportPublicData({ input, out });
  console.log(`public/data 내보내기 완료: ${ version.termCount }개, contentVersion ${ version.contentVersion } → ${ out }`);
}
