import dayjs from 'dayjs';
import profiles from '@/data/profiles.json';

export const transformToSlug = (text: string): string => {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/_/g, '-');
};

export const formatDate = (date: string): string => {
  return dayjs(date).format('YYYY년 MM월 DD일');
};

export const getAuthorSlug = (author: string): string => {
  const profile = profiles.find((p) => p.name === author);
  return profile?.username ?? '';
};
