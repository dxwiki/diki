'use client';

import React from 'react';
import { MathJax } from 'better-react-mathjax';
import { MathJaxProvider } from './MathJaxProvider';

// 마크다운 파싱 함수
function parseMarkdownSegment(segment: string) {
  let html = segment;

  html = html.replace(/\n/g, '<br>');

  // 표 처리
  html = html.replace(/\|(.+)\|/g, (match) => {
    const rows = match.split('<br>').filter((row) => row.trim().startsWith('|'));
    if (rows.length < 2) return match; // 최소 2줄(헤더+내용) 필요

    let tableHtml = '<table class="markdown-table">';
    let isHeader = true;

    rows.forEach((row) => {
      // 구분선 확인 (|---|---|)
      if (row.match(/\|\s*[-:]+\s*\|/)) return;

      const cells = row.split('|').filter((cell) => cell !== '');
      if (cells.length === 0) return;

      tableHtml += '<tr>';
      cells.forEach((cell) => {
        if (isHeader) {
          tableHtml += `<th>${ cell.trim() }</th>`;
        } else {
          tableHtml += `<td>${ cell.trim() }</td>`;
        }
      });
      tableHtml += '</tr>';

      isHeader = false;
    });

    tableHtml += '</table>';
    return tableHtml;
  });

  // 인용구 처리
  html = html.replace(/(?:^|<br>)>\s*(.+?)(?=<br>|$)/g, '<blockquote class="markdown-blockquote font-tinos font-semibold">$1</blockquote>');
  // 여러 줄 인용구
  html = html.replace(/(<\/blockquote>)(?:\s*<div class="br-gap"><\/div>)?\s*<blockquote class="markdown-blockquote font-tinos font-semibold">/g, '<div class="br-gap"></div>');

  // 리스트 처리 (br 처리 후에 실행)
  html = html.replace(/(?:^|<br>)\s*(\d+)\.\s*(.+?)(?=<br>|$)/g, '<li class="list-decimal">$2</li>');
  html = html.replace(/(<li class="list-decimal">.+?<\/li>(?:\s*<li class="list-decimal">.+?<\/li>)*)/g, '<ol class="list">$1</ol>');
  html = html.replace(/(?:^|<br>)\s*-\s*(.+?)(?=<br>|$)/g, '<li class="list-disc">$1</li>');
  html = html.replace(/(<li class="list-disc">.+?<\/li>(?:\s*<li class="list-disc">.+?<\/li>)*)/g, '<ul class="list">$1</ul>');

  // 모든 br에 대해 br-gap 추가
  html = html.replace(/<br\s*\/?>/gi, '<div class="br-gap"></div>');

  // 이미지 처리
  // 이미지 처리
  html = html.replace(/!\[(.*?)\]\((.*?)\)/g, `
  <div class="flex flex-col items-center my-1.5">
    <img 
      src="$2" 
      alt="$1" 
      loading="lazy"
      width="800"
      height="450"
      style="aspect-ratio: 16 / 9;" 
      class="w-full rounded-lg m-0" 
      onerror="this.onerror=null;this.src='/image-not-found.png';"
    />
    <p class="text-gray1 text-center text-sm mt-1">$1</p>
  </div>
`);

  // Bold / Italic / Inline code / 링크
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  return html;
}

// 수식/텍스트 분리
function splitContentIntoSegments(text: string) {
  const regex = /(\$\$[\s\S]*?\$\$|\$(?!\$)[\s\S]*?(?<!\$)\$(?!\$))/g;
  const segments = text.split(regex).filter((segment) => segment !== '');
  return segments;
}

interface MarkdownContentProps {
  content: string; // 마크다운+수식이 섞인 문자열
}

export default function MarkdownContent({ content }: MarkdownContentProps) {
  const contentId = React.useMemo(() => {
    const contentPreview = content.slice(0, 50).replace(/\W/g, '');
    return `markdown-${ contentPreview }`;
  }, [content]);
  const segments = splitContentIntoSegments(content);

  return (
    <MathJaxProvider>
      <div id={contentId}>
        {/* 수식 처리 */}
        {segments.map((segment, i) => {
          const isMathBlock = segment.startsWith('$$') && segment.endsWith('$$');
          const isMathInline = segment.startsWith('$') && segment.endsWith('$') && !isMathBlock;

          if (isMathBlock || isMathInline) {
            return (
              <MathJax key={`math-${ i }`} inline={!isMathBlock} className={`${ isMathBlock ? 'markdown-math-block' : 'markdown-math-inline' }`}>
                {segment}
              </MathJax>
            );
          }

          // 일반 텍스트 처리
          const html = parseMarkdownSegment(segment);
          return <span key={`text-${ i }`} dangerouslySetInnerHTML={{ __html: html }} className="break-all" />;
        })}
      </div>
    </MathJaxProvider>
  );
}
