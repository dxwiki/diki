import type { Config } from 'tailwindcss';
import { fontFamily } from 'tailwindcss/defaultTheme';
import typography from '@tailwindcss/typography';
import plugin from 'tailwindcss/plugin';

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
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
        'background-opacity': 'var(--background-opacity)',
        'accent': 'var(--accent)',
        'main': 'var(--text)',
        'sub': 'var(--text-secondary)',
        'gray0': 'var(--gray0)',
        'gray1': 'var(--gray1)',
        'gray2': 'var(--gray2)',
        'gray3': 'var(--gray3)',
        'gray4': 'var(--gray4)',
        'gray5': 'var(--gray5)',
        'light': 'var(--border)',
        'extreme-light': 'var(--extreme-light)',
        'level-0': 'var(--level-0)',
        'level-1': 'var(--level-1)',
        'level-2': 'var(--level-2)',
        'level-3': 'var(--level-3)',
        'level-4': 'var(--level-4)',
        'level-5': 'var(--level-5)',
        'level-6': 'var(--level-6)',
        'level-7': 'var(--level-7)',
      },
      fontFamily: {
        coding: ['var(--font-coding)', ...fontFamily.mono],
        tinos: ['var(--font-tinos)', ...fontFamily.serif],
      //   pretendard: ['Pretendard Variable', ...fontFamily.sans],
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
        slideUp: {
          '0%': { transform: 'translateY(10%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        toastMoveUp: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-100%)' },
        },
        toastFadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        intro: {
          '0%': { transform: 'translateY(5px)', opacity: '0' },
          '100%': { transform: 'none', opacity: '1' },
        },
        slideLeftToRight: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideRightToLeft: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        staggeredBounce: {
          '0%, 100%': { transform: 'translateY(0)', opacity: '0.5' },
          '40%': { transform: 'translateY(5px)', opacity: '0.7' },
          '60%': { transform: 'translateY(5px)', opacity: '1' },
        },
      },
      animation: {
        slideDown: 'slideDown 0.3s ease-in-out',
        slideDownOut: 'slideDownOut 0.4s ease-in-out forwards',
        slideDownIn: 'slideDownIn 0.4s ease-in-out forwards',
        slideUp: 'slideUp 0.3s ease-in-out',
        toastMoveUp: 'toastMoveUp 0.3s ease-in-out forwards',
        toastFadeOut: 'toastFadeOut 0.6s ease-out forwards',
        fadeIn: 'fadeIn 0.5s ease-in-out',
        intro: 'intro 0.5s ease-in-out both',
        introSecond: 'intro 1.1s ease-in-out both',
        slideLeftToRight: 'slideLeftToRight 0.2s ease-in-out',
        slideRightToLeft: 'slideRightToLeft 0.2s ease-in-out',
        bounceArrow1: 'staggeredBounce 1.5s ease-in-out infinite',
        bounceArrow2: 'staggeredBounce 1.5s ease-in-out infinite 0.2s',
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
              padding: '3px 7px 3px 8px',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              marginRight: '0.25rem',
            },
            '.markdown-text-sub p': {
              marginBottom: '0',
            },
            '.prose code': {
              padding: '0.25rem 0.4rem',
              borderRadius: '0.25rem',
              color: 'var(--primary)',
              backgroundColor: 'var(--gray4)',
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
            '.markdown-math-block': {
              color: 'var(--text) !important',
            },
            '.markdown-math-inline': {
              color: 'var(--text) !important',
            },
            '.br-gap': {
              marginBottom: '0.75rem',
            },
            '.prose .MJX-TEX': {
              paddingRight: '0.05rem !important',
            },
            '.prose .MathJax': {
              top: '0.1rem !important',
              paddingRight: '0.05rem !important',
            },
            '.prose mjx-c.mjx-c30::before': {
              paddingRight: '0.7rem !important',
            },
            '.markdown-blockquote': {
              backgroundColor: 'var(--gray5)',
              borderLeft: '4px solid var(--primary)',
              padding: '0.5rem 1rem',
              margin: '0.5rem 0',
              borderRadius: '0.25rem 0 0 0.25rem',
              color: 'var(--gray0)',
              fontStyle: 'normal',
            },
            '.markdown-table': {
              borderCollapse: 'collapse',
              width: '100%',
              margin: '0.8rem 0',
              tableLayout: 'auto',
            },
            '.markdown-table th, .markdown-table td': {
              border: '1px solid var(--gray3)',
              padding: '0.5rem',
              textAlign: 'left',
            },
            '.markdown-table th:first-child, .markdown-table td:first-child': {
              width: '1%',
              padding: '0 1.5rem',
              minWidth: '100px',
              textAlign: 'center',
              whiteSpace: 'nowrap',
            },
            '.markdown-table th:not(:first-child), .markdown-table td:not(:first-child)': {
              width: 'auto',
              paddingLeft: '1.5rem',
            },
            '.markdown-table th': {
              border: '0',
              fontWeight: '600',
            },
          },
        },
      },
    },
  },
  safelist: [
    'text-level-0',
    'text-level-1',
    'text-level-2',
    'text-level-3',
    'text-level-4',
    'text-level-5',
    'text-level-6',
    'text-level-7',
    'bg-level-0',
    'bg-level-1',
    'bg-level-2',
    'bg-level-3',
    'bg-level-4',
    'bg-level-5',
    'bg-level-6',
    'bg-level-7',
    'border-level-0',
    'border-level-1',
    'border-level-2',
    'border-level-3',
    'border-level-4',
    'border-level-5',
    'border-level-6',
    'border-level-7',
    'animate-bounceArrow',
    'animate-bounceArrow1',
    'animate-bounceArrow2',
    'animate-bounceArrow3',
    'animate-fadeInOut',
    'markdown-blockquote',
    'markdown-table',
    'markdown-math-block',
    'markdown-math-inline',
    'br-gap',
  ],
};
export default config;
