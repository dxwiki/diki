import { Inter as FontSans, JetBrains_Mono as FontMono, Jua } from 'next/font/google';
import localFont from 'next/font/local';

export const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const fontMono = FontMono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const fontJua = Jua({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-jua',
});

// 시범용으로, ttf 사용함. woff2 폰트로 변경 예정.
export const fontMaru = localFont({
  variable: '--font-maru',
  src: [
    {
      path: '../app/fonts/MaruBuri-ExtraLight.ttf',
      weight: '100',
      style: 'normal',
    },
    {
      path: '../app/fonts/MaruBuri-Light.ttf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../app/fonts/MaruBuri-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../app/fonts/MaruBuri-SemiBold.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../app/fonts/MaruBuri-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
});
