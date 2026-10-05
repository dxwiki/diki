import { dikiMetadata } from '@/constants';
import { fetchTermsData } from '@/utils/fetchData';

interface SitemapURL {
  loc: string;
  lastmod: string;
}

const generateSitemapURL = ({ loc, lastmod }: SitemapURL): string => {
  return `
    <url>
      <loc>${ loc }</loc>
      <lastmod>${ lastmod }</lastmod>
    </url>
  `;
};

const generateSitemapXML = (urls: SitemapURL[]): string => {
  return `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
      ${ urls.map(generateSitemapURL).join('') }
    </urlset>`;
};

// 용어 상세 페이지만 생성한다. 일반 페이지는 public/sitemap-pages.xml에서 직접 관리한다
export const getSitemapURLs = async (): Promise<SitemapURL[]> => {
  const baseUrl = dikiMetadata.url;
  const postLists = await fetchTermsData();

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0] + 'T00:00:00+00:00';
  };

  return [...postLists]
    .map(({ url, metadata }) => {
      const date = metadata?.updated_at || metadata?.created_at;
      return { loc: `${ baseUrl }${ url }`, lastmod: formatDate(date ? new Date(date) : new Date()) };
    })
    .sort((a, b) => b.lastmod.localeCompare(a.lastmod));
};

const generateSitemapIndexXML = (sitemaps: SitemapURL[]): string => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${ sitemaps.map(({ loc, lastmod }) => `  <sitemap>\n    <loc>${ loc }</loc>\n    <lastmod>${ lastmod }</lastmod>\n  </sitemap>`).join('\n') }
</sitemapindex>`;
};

export { generateSitemapXML, generateSitemapIndexXML };