import type { Metadata } from 'next';
import './globals.css';
import ThemeProvider from '@/components/client/theme/ThemeProvider';
import Header from '@/components/server/common/Header';

interface RootLayoutProps {
  readonly children: React.ReactNode;
}

export const metadata: Metadata = {
  title: 'Diki',
  description: 'Welcome to Diki',
};

const RootLayout = ({ children }: RootLayoutProps) => {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className='bg-main text-main'>
        <ThemeProvider>
          <Header />
          <main className='mt-16'>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default RootLayout;