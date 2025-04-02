import dayjs from 'dayjs';
import { Profile } from '@/types';
import { store } from '@/store';

export const transformToSlug = (text: string): string => {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/_/g, '-');
};

export const formatDate = (date: string): string => {
  return dayjs(date).format('YYYY년 MM월 DD일');
};

export const getAuthorSlug = (author: string): string => {
  const profiles = store.getState().profiles.profiles;
  
  if (!profiles || profiles.length === 0) {
    return '';
  }
  const profile = profiles.find((p: Profile) => p.name === author);
  const username = profile?.username ?? '';
  
  return username;
};
