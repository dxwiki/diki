import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const exportScript = path.join(repoRoot, 'scripts', 'exportPublicData.mjs');
const fixturePath = path.join(repoRoot, 'scripts', 'verify', 'fixtures', 'publicDataTerms.json');
const realTermsPath = path.join(repoRoot, 'src', 'data', 'terms.json');

const TERM_FIELDS = ['url', 'id', 'title', 'description', 'difficulty', 'relevance', 'tags', 'terms', 'usecase', 'references', 'metadata'];
const METADATA_FIELDS = ['created_at', 'updated_at'];

const workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'diki-public-data-'));
let passed = 0;
const failures = [];

const check = (name, fn) => {
  try {
    fn();
    passed += 1;
    console.log(`  통과: ${ name }`);
  } catch (error) {
    failures.push(name);
    console.error(`  실패: ${ name }\n    ${ error.message }`);
  }
};

const runExport = (input, label) => {
  const out = path.join(workDir, label);
  const result = spawnSync(process.execPath, [exportScript, '--input', input, '--out', out], { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(`내보내기 실패(${ label }): ${ result.stderr }`);
  const termsContent = fs.readFileSync(path.join(out, 'terms.json'), 'utf8');
  return {
    out,
    termsContent,
    terms: JSON.parse(termsContent),
    version: JSON.parse(fs.readFileSync(path.join(out, 'version.json'), 'utf8')),
  };
};

const expectedPublic = (source) => source.filter((term) => term && term.publish === true).map((term) => {
  const picked = {};
  for (const field of TERM_FIELDS) {
    if (field === 'metadata') continue;
    if (term[field] !== undefined) picked[field] = term[field];
  }
  if (term.metadata) {
    picked.metadata = {};
    for (const field of METADATA_FIELDS) {
      if (term.metadata[field] !== undefined) picked.metadata[field] = term.metadata[field];
    }
  }
  return picked;
});

const checkOutput = (label, source, result) => {
  check(`${ label }: 공개 용어만 원래 순서대로`, () => {
    assert.deepEqual(result.terms.map((term) => term.id), source.filter((term) => term && term.publish === true).map((term) => term.id));
  });
  check(`${ label }: 화이트리스트 필드만`, () => {
    for (const term of result.terms) {
      const extra = Object.keys(term).filter((key) => !TERM_FIELDS.includes(key));
      assert.deepEqual(extra, [], `${ term.id } 에 허용 밖 키: ${ extra.join(', ') }`);
      if (term.metadata) {
        const extraMeta = Object.keys(term.metadata).filter((key) => !METADATA_FIELDS.includes(key));
        assert.deepEqual(extraMeta, [], `${ term.id }.metadata 에 허용 밖 키: ${ extraMeta.join(', ') }`);
      }
    }
    for (const term of result.terms) {
      assert.ok(!('publish' in term), `${ term.id } 에 publish 가 남아 있음`);
      assert.ok(!term.metadata || (!('authors' in term.metadata) && !('contributors' in term.metadata)), `${ term.id }.metadata 에 authors·contributors 가 남아 있음`);
    }
  });
  check(`${ label }: 화이트리스트 필드 값이 원본과 같음`, () => {
    assert.deepEqual(result.terms, expectedPublic(source));
  });
  check(`${ label }: version.json 필드`, () => {
    const { version } = result;
    assert.deepEqual(Object.keys(version).sort(), ['contentVersion', 'generatedAt', 'minAppVersion', 'termCount']);
    const hash = crypto.createHash('sha256').update(result.termsContent).digest('hex').slice(0, 16);
    assert.equal(version.contentVersion, hash);
    assert.match(version.contentVersion, /^[0-9a-f]{16}$/);
    assert.equal(new Date(version.generatedAt).toISOString(), version.generatedAt);
    assert.equal(version.termCount, result.terms.length);
    assert.equal(version.minAppVersion, '1.0.0');
  });
};

try {
  console.log('fixture 검사');
  const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
  const first = runExport(fixturePath, 'fixture-1');
  checkOutput('fixture', fixture, first);
  check('fixture: 비공개 값(secretNote·authors·contributors·internalFlag·숨김 용어) 미포함', () => {
    for (const secret of ['비공개 메모', 'writer-1', 'writer-2', 'writer-3', 'helper-1', 'internalFlag', 'hidden-term', 'draft-term']) {
      assert.ok(!first.termsContent.includes(secret), `${ secret } 가 내보내짐`);
    }
    assert.equal(first.version.termCount, 2);
  });

  const second = runExport(fixturePath, 'fixture-2');
  check('fixture: 같은 내용이면 같은 contentVersion', () => {
    assert.equal(second.version.contentVersion, first.version.contentVersion);
  });

  const hiddenChanged = fixture.map((term) => (term.publish === true
    ? { ...term, metadata: { ...term.metadata, authors: ['someone-else'] } }
    : { ...term, title: { ko: '바뀐 숨김', en: 'Changed' } }));
  const hiddenChangedPath = path.join(workDir, 'hidden-changed.json');
  fs.writeFileSync(hiddenChangedPath, JSON.stringify(hiddenChanged, null, 2));
  check('fixture: 공개되지 않는 값만 바뀌면 contentVersion 그대로', () => {
    assert.equal(runExport(hiddenChangedPath, 'hidden-changed').version.contentVersion, first.version.contentVersion);
  });

  const publicChanged = fixture.map((term) => (term.id === 'a-term' ? { ...term, description: { ...term.description, short: '바뀐 설명' } } : term));
  const publicChangedPath = path.join(workDir, 'public-changed.json');
  fs.writeFileSync(publicChangedPath, JSON.stringify(publicChanged));
  check('fixture: 공개 내용이 바뀌면 contentVersion 이 달라짐', () => {
    assert.notEqual(runExport(publicChangedPath, 'public-changed').version.contentVersion, first.version.contentVersion);
  });

  console.log('src/data/terms.json 검사');
  const realTerms = JSON.parse(fs.readFileSync(realTermsPath, 'utf8'));
  const real = runExport(realTermsPath, 'real-1');
  checkOutput('실제 데이터', realTerms, real);
  check('실제 데이터: 같은 내용이면 같은 contentVersion', () => {
    assert.equal(runExport(realTermsPath, 'real-2').version.contentVersion, real.version.contentVersion);
  });
} catch (error) {
  failures.push(error.message);
  console.error(error);
} finally {
  fs.rmSync(workDir, { recursive: true, force: true });
}

if (failures.length > 0) {
  console.error(`checkPublicData 실패 (${ failures.length }건, 통과 ${ passed }건)`);
  process.exit(1);
}
console.log(`checkPublicData 통과 (${ passed }건)`);
