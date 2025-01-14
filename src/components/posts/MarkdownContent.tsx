'use client';

import React from 'react';
import { MathJax } from 'better-react-mathjax';

// 마크다운 파싱 함수
function parseMarkdownSegment(segment: string) {
  let html = segment.replace(/<br\s*\/?>/gi, '\n\n'); // <br> 처리

  // 리스트 처리
  html = html.replace(/(?:^|\n)\d+\.\s(.+?)(?=\n|$)/g, '<li class="list-decimal">$1</li>');
  html = html.replace(/(<li class="list-decimal">.+?<\/li>(?:\s<li class="list-decimal">.+?<\/li>)*)/g, '<ol class="list">$1</ol>');

  html = html.replace(/(?:^|\n)-\s(.+?)(?=\n|$)/g, '<li class="list-disc">$1</li>');
  html = html.replace(/(<li class="list-disc">.+?<\/li>(?:\s<li class="list-disc">.+?<\/li>)*)/g, '<ul class="list">$1</ul>');

  // Bold / Italic / Inline code / 링크
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // 문단 처리
  html = html
    .split('\n\n')
    .map((paragraph) => (paragraph.trim() ? `<p>${ paragraph.trim() }</p>` : ''))
    .join('');

  return html;
}

// 수식/텍스트 분리 함수
function splitContentIntoSegments(text: string) {
  const regex = /(\${2}[\s\S]+?\${2}|\$[\s\S]+?\$)/g;
  return text.split(regex).filter((segment) => segment.trim() !== '');
}

interface MarkdownContentProps {
  content: string; // 마크다운+수식이 섞인 문자열
}

export default function MarkdownContent({ content }: MarkdownContentProps) {
  const segments = splitContentIntoSegments(content);

  return (
    <div>
      {segments.map((segment, i) => {
        const isMathBlock = segment.startsWith('$$') && segment.endsWith('$$');
        const isMathInline = segment.startsWith('$') && segment.endsWith('$');

        if (isMathBlock || isMathInline) {
          const mathContent = segment.replace(/\${1,2}/g, ''); // '$$' 또는 '$' 제거
          return (
            <MathJax key={i} inline={!isMathBlock}>
              {mathContent}
            </MathJax>
          );
        }

        // 일반 텍스트 처리
        const html = parseMarkdownSegment(segment);
        return <span key={i} dangerouslySetInnerHTML={{ __html: html }} />;
      })}
    </div>
  );
}
