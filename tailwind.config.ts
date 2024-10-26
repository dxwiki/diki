import type { Config } from 'tailwindcss';
import { fontFamily } from 'tailwindcss/defaultTheme';

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        'custom-border': 'var(--border-color)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', ...fontFamily.sans],
        mono: ['var(--font-mono)', ...fontFamily.mono],
        maru: ['var(--font-maru)', ...fontFamily.sans],
        jua: ['var(--font-jua)', ...fontFamily.sans],
      },
    },
  },
  plugins: [],
};
export default config;
