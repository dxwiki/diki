import { TermData } from '../types';
import { ContentVersion, validateContentVersion, validateTermsPayload } from './validate';

export type ContentSource = 'bundled' | 'downloaded';

export interface ContentSnapshot {
  terms: TermData[];
  version: ContentVersion;
}

export interface StoredContent {
  terms: unknown;
  version: unknown;
}

export interface InitialContent extends ContentSnapshot {
  source: ContentSource;
}

export const pickInitialContent = (bundled: ContentSnapshot, stored: StoredContent | null): InitialContent => {
  const fallback: InitialContent = { terms: bundled.terms, version: bundled.version, source: 'bundled' };
  if (!stored) return fallback;
  const version = validateContentVersion(stored.version);
  if (!version) return fallback;
  const terms = validateTermsPayload(stored.terms, version);
  if (!terms) return fallback;
  if (!(Date.parse(version.generatedAt) > Date.parse(bundled.version.generatedAt))) return fallback;
  return { terms, version, source: 'downloaded' };
};
