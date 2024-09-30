/** @type {import('next').NextConfig} */

const nextConfig = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx,mdx}'],
  output: 'export',
  images: {
    unoptimized: true
  },
  experimental: {
    staticPages: {
      '/': false
    }
  }
};

module.exports = nextConfig;