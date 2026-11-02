export const transformToSlug = (text: string): string => {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/_/g, '-');
};
