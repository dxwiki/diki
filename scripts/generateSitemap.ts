import { readFileSync, writeFileSync } from 'fs';
import { dikiMetadata } from '../src/constants';
import { getSitemapURLs, generateSitemapXML, generateSitemapIndexXML } from '../src/utils/sitemap';

const latestLastmod = (xml: string): string => {
  const dates = Array.from(xml.matchAll(/<lastmod>([^<]+)<\/lastmod>/g), (m) => m[1]).sort();
  return dates[dates.length - 1] ?? new Date().toISOString().split('T')[0];
};

(async () => {
  const postUrls = await getSitemapURLs();
  writeFileSync('public/sitemap-posts.xml', generateSitemapXML(postUrls), 'utf-8');

  const pagesXml = readFileSync('public/sitemap-pages.xml', 'utf-8');
  const index = generateSitemapIndexXML([
    { loc: `${ dikiMetadata.url }/sitemap-pages.xml`, lastmod: latestLastmod(pagesXml) },
    { loc: `${ dikiMetadata.url }/sitemap-posts.xml`, lastmod: postUrls[0]?.lastmod ?? new Date().toISOString() },
  ]);
  writeFileSync('public/sitemap.xml', index, 'utf-8');
  console.log(`sitemap index generated: pages + ${ postUrls.length } posts`);
})();
