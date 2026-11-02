import { TermData, Title, Tags, Terms, Relevance, Usecase, References } from './types';
import { transformToSlug } from './slug';
import { getRecommendedTerms } from './recommend';

export const DIKI_WEB_ORIGINS = ['https://www.diki.kr', 'https://diki.kr'];

export const termSlug = (term: TermData): string => transformToSlug(term.title?.en ?? '');

export function findTermBySlug(terms: TermData[], slug: string | null | undefined): TermData | null {
  if (!slug) return null;
  const exact = terms.find((term) => termSlug(term) === slug);
  if (exact) return exact;
  const normalized = transformToSlug(slug);
  return terms.find((term) => termSlug(term) === normalized) ?? null;
}

const safeDecode = (text: string): string => {
  try {
    return decodeURIComponent(text);
  } catch {
    return text;
  }
};

const stripQueryAndHash = (text: string): string => text.split(/[?#]/)[0];

// '/posts/<slug>' 경로(쿼리·해시·끝 슬래시 허용)에서 slug 를 뽑는다
export function slugFromUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  let pathPart = url.trim();
  const originMatch = pathPart.match(/^[a-z][a-z0-9+.-]*:\/\/[^/]*(.*)$/i);
  if (originMatch) pathPart = originMatch[1];
  pathPart = stripQueryAndHash(pathPart);
  const match = pathPart.match(/^\/posts\/([^/]+)\/?$/);
  if (!match) return null;
  const slug = safeDecode(match[1]);
  return slug === '' ? null : slug;
}

export type LinkTarget =
  | { type: 'internal'; slug: string }
  | { type: 'external'; url: string }
  | { type: 'none' };

export interface ClassifyLinkOptions {
  webOrigins?: string[];
}

const normalizeOrigin = (origin: string): string => origin.replace(/\/+$/, '').toLowerCase();

export function classifyLink(href: string | null | undefined, options: ClassifyLinkOptions = {}): LinkTarget {
  const webOrigins = (options.webOrigins ?? DIKI_WEB_ORIGINS).map(normalizeOrigin);
  const raw = (href ?? '').trim();
  if (raw === '' || raw.startsWith('#')) return { type: 'none' };

  const httpMatch = raw.match(/^(https?:\/\/[^/?#]+)(.*)$/i);
  if (httpMatch) {
    if (webOrigins.includes(normalizeOrigin(httpMatch[1]))) {
      const slug = slugFromUrl(httpMatch[2] || '/');
      if (slug) return { type: 'internal', slug };
    }
    return { type: 'external', url: raw };
  }

  if (raw.startsWith('//')) return classifyLink(`https:${ raw }`, options);
  if (/^[a-z][a-z0-9+.-]*:/i.test(raw)) return { type: 'none' };

  if (raw.startsWith('/')) {
    const slug = slugFromUrl(raw);
    if (slug) return { type: 'internal', slug };
    return webOrigins.length > 0 ? { type: 'external', url: `${ webOrigins[0] }${ raw }` } : { type: 'none' };
  }

  // 상대 경로는 웹 상세(/posts/<현재>) 기준이라 마지막 조각을 slug 로 본다
  const segments = stripQueryAndHash(raw).split('/').filter((s) => s !== '' && s !== '.' && s !== '..');
  const last = segments[segments.length - 1];
  if (!last) return { type: 'none' };
  return { type: 'internal', slug: safeDecode(last) };
}

export interface PrevNextTerms {
  prev: TermData | null;
  next: TermData | null;
}

// 웹 PrevNextSection 규칙: id±1, 없으면 이전은 마지막 용어 id, 다음은 id 1
export function getPrevNextTerms(term: TermData, terms: TermData[]): PrevNextTerms {
  if (term.id === undefined || term.id === null) return { prev: null, next: null };
  const id = term.id;
  const byId = (targetId: number) => terms.find((t) => t.id === targetId);
  const lastTermId = terms.length > 0 ? terms[terms.length - 1].id ?? 1 : 1;
  const prevCandidate = byId(id - 1);
  const nextCandidate = byId(id + 1);
  const prev = prevCandidate?.id ? prevCandidate : byId(lastTermId);
  const next = nextCandidate?.id ? nextCandidate : byId(1);
  return { prev: prev ?? null, next: next ?? null };
}

export interface DetailTag {
  name: string;
  slug: string | null;
}

export interface DetailRelatedTerm {
  term: string;
  description: string;
  slug: string | null;
}

export type RelevanceRole = 'analyst' | 'scientist' | 'engineer';

export interface DetailRelevanceItem {
  role: RelevanceRole;
  score: number;
  description: string;
}

export type DetailSection =
  | { type: 'header'; title: Title; shortDescription: string; tags: DetailTag[] }
  | { type: 'difficulty'; level: number; description: string }
  | { type: 'description'; content: string }
  | { type: 'relatedTerms'; items: DetailRelatedTerm[] }
  | { type: 'relevance'; items: DetailRelevanceItem[] }
  | { type: 'usecase'; industries: string[]; description: string; example: string }
  | { type: 'references'; references: References }
  | { type: 'prevNext'; prev: TermData | null; next: TermData | null }
  | { type: 'recommendations'; terms: TermData[] };

export type DetailSectionType = DetailSection['type'];

export const DETAIL_SECTION_ORDER: DetailSectionType[] = [
  'header',
  'difficulty',
  'description',
  'relatedTerms',
  'relevance',
  'usecase',
  'references',
  'prevNext',
  'recommendations',
];

const hasText = (text: string | undefined | null): text is string => typeof text === 'string' && text.trim() !== '';

const linkSlug = (internalLink: string | undefined): string | null => (hasText(internalLink) ? transformToSlug(internalLink.trim()) : null);

const toTags = (tags: Tags[] | undefined): DetailTag[] => (tags ?? [])
  .filter((tag) => hasText(tag.name))
  .map((tag) => ({ name: tag.name as string, slug: linkSlug(tag.internal_link) }));

const toRelatedTerms = (items: Terms[] | undefined): DetailRelatedTerm[] => (items ?? [])
  .filter((item) => hasText(item.term) || hasText(item.description))
  .map((item) => ({ term: item.term ?? '', description: item.description ?? '', slug: linkSlug(item.internal_link) }));

const RELEVANCE_ROLES: RelevanceRole[] = ['analyst', 'scientist', 'engineer'];

const toRelevance = (relevance: Relevance | undefined): DetailRelevanceItem[] => RELEVANCE_ROLES
  .map((role) => ({ role, value: relevance?.[role] }))
  .filter(({ value }) => !!value && ((value.score ?? 0) > 0 || hasText(value.description)))
  .map(({ role, value }) => ({ role, score: value?.score ?? 0, description: value?.description ?? '' }));

const toUsecase = (usecase: Usecase | undefined) => ({
  industries: (usecase?.industries ?? []).filter(hasText),
  description: usecase?.description ?? '',
  example: usecase?.example ?? '',
});

const toReferences = (references: References | undefined): References => ({
  tutorials: references?.tutorials ?? [],
  books: references?.books ?? [],
  academic: references?.academic ?? [],
  opensource: references?.opensource ?? [],
});

// 웹 상세와 같은 순서로 섹션을 만들고 빈 섹션은 뺀다 (광고 없음)
export function getDetailSections(term: TermData, terms: TermData[]): DetailSection[] {
  const sections: DetailSection[] = [];

  sections.push({
    type: 'header',
    title: term.title ?? {},
    shortDescription: term.description?.short ?? '',
    tags: toTags(term.tags),
  });

  const level = term.difficulty?.level ?? 0;
  if (level > 0) sections.push({ type: 'difficulty', level, description: term.difficulty?.description ?? '' });

  const full = term.description?.full ?? '';
  if (hasText(full)) sections.push({ type: 'description', content: full });

  const related = toRelatedTerms(term.terms);
  if (related.length > 0) sections.push({ type: 'relatedTerms', items: related });

  const relevance = toRelevance(term.relevance);
  if (relevance.length > 0) sections.push({ type: 'relevance', items: relevance });

  const usecase = toUsecase(term.usecase);
  if (usecase.industries.length > 0 || hasText(usecase.description) || hasText(usecase.example)) {
    sections.push({ type: 'usecase', ...usecase });
  }

  const references = toReferences(term.references);
  if ((references.tutorials?.length ?? 0) + (references.books?.length ?? 0)
    + (references.academic?.length ?? 0) + (references.opensource?.length ?? 0) > 0) {
    sections.push({ type: 'references', references });
  }

  const { prev, next } = getPrevNextTerms(term, terms);
  if (prev || next) sections.push({ type: 'prevNext', prev, next });

  const recommended = getRecommendedTerms(term, terms);
  if (recommended.length > 0) sections.push({ type: 'recommendations', terms: recommended });

  return sections;
}
