import dayjs from 'dayjs';
import { Profile } from '@/types';
import { store } from '@/store';

export const transformToSlug = (text: string): string => {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/_/g, '-');
};

export const formatDate = (date: string): string => {
  return dayjs(date).format('YYYY년 MM월 DD일');
};

// 작성자 이름과 해당 username을 캐싱하는 객체
const authorSlugCache: Record<string, string> = {};

export const getAuthorSlug = (author: string): string => {
  // 캐시에 있으면 캐시된 값 반환
  if (authorSlugCache[author]) {
    return authorSlugCache[author];
  }

  const profiles = store.getState().profiles.profiles;

  if (!profiles || profiles.length === 0) {
    return '';
  }
  const profile = profiles.find((p: Profile) => p.name === author);
  const username = profile?.username ?? '';

  // 찾은 결과를 캐시에 저장
  authorSlugCache[author] = username;

  return username;
};
