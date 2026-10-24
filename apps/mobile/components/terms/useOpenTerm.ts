import { useCallback } from 'react';
import { useRouter, type Href } from 'expo-router';
import type { TermData } from '@diki/core';
import { termPath } from './termPath';

export const useOpenTerm = () => {
  const router = useRouter();
  return useCallback((term: TermData) => {
    router.push(termPath(term) as Href);
  }, [router]);
};
