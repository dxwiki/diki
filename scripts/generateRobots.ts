import { promises as fs } from 'fs';
import { dikiMetadata } from '../src/constants';

(() => {
  const createRobotsTxt = () => {
    const siteUrl = dikiMetadata.url;

    // 프리뷰 등 운영이 아닌 배포는 전체 크롤링을 막는다
    if (process.env.VERCEL_ENV !== 'production') {
      return 'User-agent: *\nDisallow: /\n';
    }

    const text = 'User-agent: *\n'
                 + 'Allow: /\n'
                 + 'Disallow: /posts/create/\n'
                 + 'Disallow: /login/\n'
                 + 'Disallow: /signup/\n'
                 + 'Disallow: /good-bye/\n'
                 + 'Disallow: /thank-you/\n'
                 + 'Disallow: /profiles/\n'
                 + 'Disallow: /api/*\n'
                 + `Sitemap: ${ siteUrl }/sitemap.xml\n`;

    return text;
  };

  // fs.writeFile('out/robots.txt', createRobotsTxt(), 'utf-8');
  fs.writeFile('public/robots.txt', createRobotsTxt(), 'utf-8');
  console.log('robots.txt generated');
})();