/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@diki/core'],
  images: {
    domains: ['avatars.githubusercontent.com', 'media.licdn.com'],
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
