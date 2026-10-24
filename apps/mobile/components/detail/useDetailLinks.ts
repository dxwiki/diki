import { useCallback, useMemo } from 'react';
import { useRouter, type Href } from 'expo-router';
import { classifyLink, DIKI_WEB_ORIGINS, type TermData } from '@diki/core';
import { termPath } from '@/components/terms/termPath';
import { openExternal } from '@/lib/links';

export const detailPath = (slug: string): string => `/posts/${ encodeURIComponent(slug) }`;

export interface DetailLinks {
  openSlug: (slug: string) => void;
  openTerm: (term: TermData) => void;
  openHref: (href: string) => void;
}

// 내부 용어는 앱 상세로, 외부 주소는 시스템 브라우저(Linking.openURL)로 연다
export const useDetailLinks = (): DetailLinks => {
  const router = useRouter();

  const openSlug = useCallback((slug: string) => {
    router.push(detailPath(slug) as Href);
  }, [router]);

  const openTerm = useCallback((term: TermData) => {
    router.push(termPath(term) as Href);
  }, [router]);

  const openHref = useCallback((href: string) => {
    const target = classifyLink(href, { webOrigins: DIKI_WEB_ORIGINS });
    if (target.type === 'internal') openSlug(target.slug);
    else if (target.type === 'external') void openExternal(target.url);
  }, [openSlug]);

  return useMemo(() => ({ openSlug, openTerm, openHref }), [openSlug, openTerm, openHref]);
};
