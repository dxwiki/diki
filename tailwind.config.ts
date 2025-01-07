import type { Config } from 'tailwindcss';
import { fontFamily } from 'tailwindcss/defaultTheme';
import typography from '@tailwindcss/typography';
import plugin from 'tailwindcss/plugin';

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx,mdx}'],
  prefix: '',
  plugins: [
    typography,
    plugin(({ addVariant }: { addVariant: (name: string, rules: string)=> void }) => {
      addVariant('windows', '.windows &');
      addVariant('mac', '.mac &');
    }),
  ],
  theme: {
    extend: {
      colors: {
        'primary': 'var(--primary)',
        'secondary': 'var(--secondary)',
        'background': 'var(--background)',
        'background-secondary': 'var(--background-secondary)',
        'accent': 'var(--accent)',
        'main': 'var(--text)',
        'sub': 'var(--text-secondary)',
        'gray1': 'var(--gray1)',
        'light': 'var(--border)',
        'extreme-light': 'var(--extreme-light)',
        'level-1': 'var(--level-1)',
        'level-2': 'var(--level-2)',
        'level-3': 'var(--level-3)',
        'level-4': 'var(--level-4)',
        'level-5': 'var(--level-5)',
      },
      fontFamily: {
        nanum: ['var(--font-nanum)', ...fontFamily.sans],
        coding: ['var(--font-coding)', ...fontFamily.mono],
        noto: ['var(--font-noto)', ...fontFamily.sans],
        pretendard: ['Pretendard Variable', ...fontFamily.sans],
      },
      keyframes: {
        slideDown: {
          '0%': { transform: 'translateY(-10%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDownIn: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDownOut: {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(100%)', opacity: '0' },
        },
        intro: {
          '0%': { transform: 'translateY(5px)', opacity: '0' },
          '100%': { transform: 'none', opacity: '1' },
        },
      },
      animation: {
        slideDown: 'slideDown 0.3s ease-in-out',
        slideDownOut: 'slideDownOut 400ms ease-in-out forwards',
        slideDownIn: 'slideDownIn 400ms ease-in-out forwards',
        intro: 'intro 500ms ease-in-out both',
        introSecond: 'intro 1100ms ease-in-out both',
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            'h1, h2, h3, strong': {
              color: 'var(--text)',
            },
            'p, span, li': {
              color: 'var(--text-secondary)',
            },
            p: {
              marginTop: '0',
              marginBottom: '0.75rem',
              lineHeight: '1.7',
            },
            section: {
              marginTop: '4rem',
              marginBottom: '4rem',
            },

            '.prose :where(h1):not(:where([class~="not-prose"],[class~="not-prose"] *))': {
              color: 'var(--accent)',
              fontFamily: 'var(--font-noto)',
            },
            '.prose :where(h2):not(:where([class~="not-prose"],[class~="not-prose"] *))': {
              marginTop: '0',
              fontSize: '1.2rem',
              fontWeight: 'semibold',
              marginBottom: '1rem',
              // fontFamily: 'var(--font-noto)',
            },
            '.prose :where(h3):not(:where([class~="not-prose"],[class~="not-prose"] *))': {
              fontSize: '1.05rem',
              marginBottom: '0.4rem',
            },
            '.prose :where(a):not(:where([class~="not-prose"],[class~="not-prose"] *))': {
              color: 'var(--accent)',
              textDecoration: 'none',
              fontWeight: 'bold',
            },
            '.prose :where(a):not(:where([class~="not-prose"],[class~="not-prose"] *)):hover': {
              color: 'var(--accent)',
              textDecoration: 'underline',
              textDecorationColor: 'var(--accent)',
              textUnderlineOffset: '4px',
            },
            '.prose .tag-button, .tag-button-no-link': {
              color: 'var(--text-secondary)',
              border: '1px solid var(--border)',
              padding: '2px 7px 3px 8px',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              marginRight: '0.25rem',
            },
            '.prose .tag-button:hover': {
              color: 'var(--text)',
              backgroundColor: 'var(--background-secondary)',
              // transition: 'background-color 0.2s ease-in-out, color 0.2s ease-in-out',
            },
            '.markdown-text-sub p': {
              marginBottom: '0',
            },
            '.prose code': {
              padding: '0.2rem 0.3rem',
              borderRadius: '0.25rem',
              color: 'var(--primary)',
              backgroundColor: 'var(--extreme-light)',
              fontFamily: 'var(--font-pretendard)',
            },
            '.prose code::before': {
              display: 'none',
            },
            '.prose code::after': {
              display: 'none',
            },
            '.prose ol, .prose ul': {
              margin: '0.4rem 0',
            },
            '.prose :where(ol > li)::marker, .prose :where(ul > li)::marker': {
              color: 'var(--gray1)',
            },
            '.prose .list-decimal, .prose .list-disc': {
              margin: '0.2rem 0',
              paddingLeft: '0.2rem',
            },
          },
        },
      },
    },
  },
  safelist: [
    'text-level-1',
    'text-level-2',
    'text-level-3',
    'text-level-4',
    'text-level-5',
    'bg-level-1',
    'bg-level-2',
    'bg-level-3',
    'bg-level-4',
    'bg-level-5',
    'border-level-1',
    'border-level-2',
    'border-level-3',
    'border-level-4',
    'border-level-5',
    'bg-gradient-to-r from-level-1 to-level-2',
    'bg-gradient-to-r from-level-2 to-level-3',
    'bg-gradient-to-r from-level-3 to-level-4',
    'bg-gradient-to-r from-level-4 to-level-5',
  ],

};
export default config;
