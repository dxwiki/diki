import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const coreDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const targetDir = path.resolve(process.argv[2] ?? path.join(coreDir, 'src'));

const FORBIDDEN_MODULES = ['fs', 'path', 'os', 'child_process', 'react', 'react-dom', 'react-native', 'next', 'expo'];
const FORBIDDEN_IDENTIFIERS = new Set(['window', 'document', 'localStorage', 'sessionStorage', 'navigator', 'process']);

const isForbiddenModule = (name) => {
  if (name.startsWith('node:')) return true;
  return FORBIDDEN_MODULES.some((mod) => name === mod || name.startsWith(`${ mod }/`))
    || name.startsWith('expo-')
    || name.startsWith('@expo/')
    || name.startsWith('@react-native');
};

const listFiles = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
  const full = path.join(dir, entry.name);
  if (entry.isDirectory()) return listFiles(full);
  return /\.(ts|tsx|js|mjs|cjs)$/.test(entry.name) ? [full] : [];
});

// 식별자가 값으로 쓰였는지 판단한다 (속성 이름·객체 키·타입 멤버 이름은 제외)
const isValueReference = (node) => {
  const parent = node.parent;
  if (!parent) return true;
  if (ts.isPropertyAccessExpression(parent) && parent.name === node) {
    return ts.isIdentifier(parent.expression) && parent.expression.text === 'globalThis';
  }
  if ((ts.isPropertyAssignment(parent) || ts.isPropertySignature(parent) || ts.isPropertyDeclaration(parent)
    || ts.isMethodDeclaration(parent) || ts.isMethodSignature(parent)) && parent.name === node) return false;
  if (ts.isQualifiedName(parent) && parent.right === node) return false;
  return true;
};

const problems = [];

for (const file of listFiles(targetDir)) {
  const text = fs.readFileSync(file, 'utf8');
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
  const report = (node, message) => {
    const { line, character } = source.getLineAndCharacterOfPosition(node.getStart(source));
    problems.push(`${ path.relative(process.cwd(), file) }:${ line + 1 }:${ character + 1 } ${ message }`);
  };

  const visit = (node) => {
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier
      && ts.isStringLiteral(node.moduleSpecifier) && isForbiddenModule(node.moduleSpecifier.text)) {
      report(node, `금지 모듈 import: ${ node.moduleSpecifier.text }`);
    }
    if (ts.isImportEqualsDeclaration(node) && ts.isExternalModuleReference(node.moduleReference)
      && ts.isStringLiteral(node.moduleReference.expression) && isForbiddenModule(node.moduleReference.expression.text)) {
      report(node, `금지 모듈 import: ${ node.moduleReference.expression.text }`);
    }
    if (ts.isCallExpression(node) && node.arguments.length > 0 && ts.isStringLiteral(node.arguments[0])) {
      const isRequire = ts.isIdentifier(node.expression) && node.expression.text === 'require';
      const isDynamicImport = node.expression.kind === ts.SyntaxKind.ImportKeyword;
      if ((isRequire || isDynamicImport) && isForbiddenModule(node.arguments[0].text)) {
        report(node, `금지 모듈 import: ${ node.arguments[0].text }`);
      }
    }
    if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument) && ts.isStringLiteral(node.argument.literal)
      && isForbiddenModule(node.argument.literal.text)) {
      report(node, `금지 모듈 import: ${ node.argument.literal.text }`);
    }
    if (ts.isIdentifier(node) && FORBIDDEN_IDENTIFIERS.has(node.text) && isValueReference(node)) {
      report(node, `금지 식별자 사용: ${ node.text }`);
    }
    if (ts.isElementAccessExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === 'globalThis'
      && ts.isStringLiteral(node.argumentExpression) && FORBIDDEN_IDENTIFIERS.has(node.argumentExpression.text)) {
      report(node, `금지 식별자 사용: globalThis['${ node.argumentExpression.text }']`);
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
}

if (problems.length > 0) {
  console.error(`check:apis 실패 (${ problems.length }건)`);
  problems.forEach((p) => console.error(`  ${ p }`));
  process.exit(1);
}

console.log(`check:apis 통과: ${ path.relative(process.cwd(), targetDir) || '.' } 에 금지 모듈·식별자 없음`);
