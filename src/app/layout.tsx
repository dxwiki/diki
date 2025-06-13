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
import KakaoSDK from '@/components/meta/KakaoSDK';
import AmpAdScript from '@/components/meta/AmpAdScript';
import MicrosoftClarity from '@/components/meta/MicrosoftClarity';
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
        <KakaoSDK />
        <AmpAdScript />
        <MicrosoftClarity />
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