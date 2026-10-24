// 원본: src/utils/filters.ts 의 transformToSlug (분리 전 동결 사본)
export const transformToSlug = (text: string): string => {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/_/g, '-');
};
