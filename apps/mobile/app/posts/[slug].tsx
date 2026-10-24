import { useEffect, useMemo } from 'react';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { findTermBySlug } from '@diki/core';
import { NotFound, TermDetail } from '@/components/detail';
import { useContent } from '@/lib/content';
import { useRecentTerms } from '@/lib/recent';

export default function TermDetailScreen() {
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug?: string | string[] }>();
  const slugValue = Array.isArray(slug) ? slug[0] : slug;
  const { terms } = useContent();
  const { addRecentTerm } = useRecentTerms();
  const term = useMemo(() => findTermBySlug(terms, slugValue), [terms, slugValue]);

  // 찾은 용어는 최근 본 용어에 기록한다 (addRecentTermId 규칙)
  const termId = term?.id;
  useEffect(() => {
    if (typeof termId === 'number') addRecentTerm(termId);
  }, [termId, addRecentTerm]);

  if (!term) {
    return (
      <>
        <Stack.Screen options={{ title: '용어를 찾을 수 없음' }} />
        <NotFound onBack={() => router.replace('/(tabs)/terms')} />
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: term.title?.ko ?? term.title?.en ?? '' }} />
      <TermDetail
        term={term}
        terms={terms}
      />
    </>
  );
}
