import { writeFileSync } from 'fs';
import { getSitemapURLs, generateSitemapXML } from '../src/utils/sitemap';

(async () => {
  const urls = await getSitemapURLs();
  const sitemap = generateSitemapXML(urls);
  // const sitemapByEscape = generateSitemapByEscapeXML({ urls });
  // const sitemapByEncode = generateSitemapByEncodeXML({ urls });

  // 사이트맵 파일 생성 (public 폴더와 루트 디렉토리)
  await Promise.all([
    // writeFileSync('out/sitemap.xml', sitemap, 'utf-8'),
    writeFileSync('public/sitemap.xml', sitemap, 'utf-8'),
    // writeFileSync('out/sitemap-escape.xml', sitemapByEscape, 'utf-8'),
    // writeFileSync('out/sitemap-encode.xml', sitemapByEncode, 'utf-8'),
    // writeFileSync('public/sitemap-escape.xml', sitemapByEscape, 'utf-8'),
    // writeFileSync('public/sitemap-encode.xml', sitemapByEncode, 'utf-8'),
  ]);
  console.log('sitemap.xml generated in public/ and root directory');
})();
