'use client';

import { ReactNode } from 'react';
import { MathJaxContext } from 'better-react-mathjax';

interface MathJaxProviderProps {
  children: ReactNode;
}

const mathJaxConfig = {
  loader: { load: ['[tex]/html', '[tex]/ams'] },
  tex: {
    packages: { '[+]': ['html', 'ams'] },
    inlineMath: [
      ['$', '$'],
      ['\\(', '\\)'],
    ],
    displayMath: [
      ['$$', '$$'],
      ['\\[', '\\]'],
    ],
    processEscapes: true,
    processEnvironments: true,
  },
  options: {
    skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre'],
  },
  startup: {
    typeset: true,
  },
};

export function MathJaxProvider({ children }: MathJaxProviderProps) {
  return (
    <MathJaxContext config={mathJaxConfig}>
      {children}
    </MathJaxContext>
  );
}
