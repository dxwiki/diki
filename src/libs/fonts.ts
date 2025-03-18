import { Nanum_Gothic_Coding as FontCoding, Tinos as FontTinos } from 'next/font/google';

export const fontCoding = FontCoding({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-coding',
});

export const fontTinos = FontTinos({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-tinos',
});