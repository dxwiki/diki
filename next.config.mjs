/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@diki/core'],
  images: {
    domains: ['avatars.githubusercontent.com', 'media.licdn.com'],
  },
  // 사이트 공통 보안 헤더. 키 입력 페이지(/ai/keys)는 라우트에서 더 엄격한 헤더를 직접 보낸다
  async headers() {
    return [
      {
        source: '/((?!ai/keys).*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'self'; object-src 'none'; base-uri 'self'" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'diki.kr',
          },
        ],
        destination: 'https://www.diki.kr/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
