import { TermData } from '../types';

export interface ContentVersion {
  contentVersion: string;
  generatedAt: string;
  termCount: number;
  minAppVersion: string;
}

const isRecord = (x: unknown): x is Record<string, unknown> =>
  typeof x === 'object' && x !== null && !Array.isArray(x);

const isNonEmptyString = (x: unknown): x is string => typeof x === 'string' && x.length > 0;

export const validateContentVersion = (x: unknown): ContentVersion | null => {
  if (!isRecord(x)) return null;
  const { contentVersion, generatedAt, termCount, minAppVersion } = x;
  if (!isNonEmptyString(contentVersion)) return null;
  if (!isNonEmptyString(generatedAt) || Number.isNaN(Date.parse(generatedAt))) return null;
  if (typeof termCount !== 'number' || !Number.isInteger(termCount) || termCount < 0) return null;
  if (!isNonEmptyString(minAppVersion)) return null;
  return { contentVersion, generatedAt, termCount, minAppVersion };
};

const isValidTerm = (x: unknown): boolean => {
  if (!isRecord(x)) return false;
  if (typeof x.id !== 'number' || !Number.isFinite(x.id)) return false;
  if (typeof x.url !== 'string') return false;
  if (!isRecord(x.title)) return false;
  return typeof x.title.ko === 'string' && typeof x.title.en === 'string';
};

export const validateTermsPayload = (x: unknown, version: ContentVersion): TermData[] | null => {
  if (!Array.isArray(x)) return null;
  if (x.length !== version.termCount) return null;
  if (!x.every(isValidTerm)) return null;
  return x as TermData[];
};
