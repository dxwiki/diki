import { TermData } from '../types';
import { ContentVersion, validateContentVersion, validateTermsPayload } from './validate';

export const VERSION_CHECK_INTERVAL_MS = 3_600_000;

export type VersionCheckTrigger = 'launch' | 'foreground';

export const shouldCheckVersion = (
  trigger: VersionCheckTrigger,
  lastCheckedAt: number | null,
  now: number,
): boolean => {
  if (trigger === 'launch') return true;
  if (lastCheckedAt === null || !Number.isFinite(lastCheckedAt)) return true;
  return now - lastCheckedAt >= VERSION_CHECK_INTERVAL_MS;
};

export type SyncFailureStage = 'version-fetch' | 'version-invalid' | 'terms-fetch' | 'terms-invalid' | 'save' | 'unexpected';

export type SyncResult =
  | { status: 'up-to-date'; version: ContentVersion }
  | { status: 'updated'; terms: TermData[]; version: ContentVersion }
  | { status: 'failed'; stage: SyncFailureStage; error?: unknown };

export interface SyncContentOptions {
  baseUrl: string;
  current: ContentVersion | null;
  fetchJson: (url: string)=> Promise<unknown>;
  saveContent: (terms: TermData[], version: ContentVersion)=> Promise<void>;
}

export const contentUrl = (baseUrl: string, file: 'version.json' | 'terms.json'): string =>
  `${ baseUrl.replace(/\/+$/, '') }/data/${ file }`;

const runSync = async ({ baseUrl, current, fetchJson, saveContent }: SyncContentOptions): Promise<SyncResult> => {
  let rawVersion: unknown;
  try {
    rawVersion = await fetchJson(contentUrl(baseUrl, 'version.json'));
  } catch (error) {
    return { status: 'failed', stage: 'version-fetch', error };
  }
  const version = validateContentVersion(rawVersion);
  if (!version) return { status: 'failed', stage: 'version-invalid' };
  if (current && current.contentVersion === version.contentVersion) {
    return { status: 'up-to-date', version: current };
  }

  let rawTerms: unknown;
  try {
    rawTerms = await fetchJson(contentUrl(baseUrl, 'terms.json'));
  } catch (error) {
    return { status: 'failed', stage: 'terms-fetch', error };
  }
  let terms: TermData[] | null;
  try {
    terms = validateTermsPayload(rawTerms, version);
  } catch (error) {
    return { status: 'failed', stage: 'terms-invalid', error };
  }
  if (!terms) return { status: 'failed', stage: 'terms-invalid' };

  try {
    await saveContent(terms, version);
  } catch (error) {
    return { status: 'failed', stage: 'save', error };
  }
  return { status: 'updated', terms, version };
};

export const syncContent = async (options: SyncContentOptions): Promise<SyncResult> => {
  try {
    return await runSync(options);
  } catch (error) {
    return { status: 'failed', stage: 'unexpected', error };
  }
};
