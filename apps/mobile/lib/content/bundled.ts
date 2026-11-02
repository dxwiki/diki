import { validateContentVersion, validateTermsPayload, type ContentSnapshot } from '@diki/core';

const rawTerms: unknown = require('../../assets/content/terms.json');
const rawVersion: unknown = require('../../assets/content/version.json');

const loadBundled = (): ContentSnapshot => {
  const version = validateContentVersion(rawVersion);
  if (!version) throw new Error('설치본 version.json 형식이 잘못됐습니다. sync-content 를 다시 실행하세요.');
  const terms = validateTermsPayload(rawTerms, version);
  if (!terms) throw new Error('설치본 terms.json 형식이 잘못됐습니다. sync-content 를 다시 실행하세요.');
  return { terms, version };
};

export const bundledContent: ContentSnapshot = loadBundled();
