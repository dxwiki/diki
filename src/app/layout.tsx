import Script from 'next/script';
import type { Metadata } from 'next';
import './globals.css';
import './assets/font/font.css';
import { fontCoding, fontTinos } from '@/libs/fonts';
import { dikiMetadata } from '@/constants';
import ThemeProvider from '@/layouts/ThemeProvider';
import ToastProvider from '@/layouts/ToastProvider';
import Header from '@/components/common/Header';
import SiteVerification from '@/components/meta/SiteVerification';
import GoogleAdSense from '@/components/meta/GoogleAdSense';
import GoogleAnalytics from '@/components/meta/GoogleAnalytics';
import ReduxProvider from '@/components/redux/ReduxProvider';
import DataInitializer from '@/components/redux/DataInitializer';
import Footer from '@/components/common/Footer';

interface RootLayoutProps {
  readonly children: React.ReactNode;
}

export const metadata: Metadata = {
  title: {
    template: `%s | ${ dikiMetadata.title }`,
    default: dikiMetadata.title,
  },
  description: dikiMetadata.description,
  authors: [{ name: dikiMetadata.author.name }],
  icons: {
    icon: [
      { url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon/favicon.ico' },
    ],
    apple: [
      { url: '/favicon/apple-touch-icon.png' },
    ],
  },
  openGraph: {
    title: dikiMetadata.title,
    description: dikiMetadata.description,
    url: dikiMetadata.url,
    siteName: dikiMetadata.title,
    locale: 'ko_KR',
    type: 'website',
    images: [
      {
        url: dikiMetadata.thumbnailURL,
        width: 1200,
        height: 630,
        alt: dikiMetadata.description,
      },
    ],
  },
};

const RootLayout = async ({ children }: RootLayoutProps) => {
  return (
    <html lang='ko' suppressHydrationWarning>
      <head>
        <SiteVerification />
        <GoogleAdSense />
        <GoogleAnalytics />
        <link rel="canonical" href={dikiMetadata.url} />
        <Script
          src="https://t1.kakaocdn.net/kakao_js_sdk/2.6.0/kakao.min.js"
          strategy="afterInteractive"
        />
        <script async custom-element="amp-ad" src="https://cdn.ampproject.org/v0/amp-ad-0.1.js" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              'name': dikiMetadata.title,
              'url': dikiMetadata.url,
              'description': dikiMetadata.description,
              'potentialAction': {
                '@type': 'SearchAction',
                'target': {
                  '@type': 'EntryPoint',
                  'urlTemplate': `${ dikiMetadata.url }/posts?q={search_term_string}`,
                },
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              'name': dikiMetadata.title,
              'url': dikiMetadata.url,
              'logo': `${ dikiMetadata.url }/logo.png`,
              'sameAs': [
                'https://github.com/dxwiki/diki',
              ],
            }),
          }}
        />
      </head>
      <body
        className={`${ fontCoding.variable } ${ fontTinos.variable } overflow-x-hidden overflow-y-auto`}
      >
        <ReduxProvider>
          <DataInitializer />
          <ThemeProvider>
            <ToastProvider>
              <Header />
              <main className='mt-16 max-w-6xl min-h-[calc(100vh_-150px)] mx-auto px-4 py-3 md:px-6 lg:px-8'>{children}</main>
              <div className='hidden sm:block'>
                <Footer />
              </div>
            </ToastProvider>
          </ThemeProvider>
        </ReduxProvider>
      </body>
    </html>
  );
};

export default RootLayout;