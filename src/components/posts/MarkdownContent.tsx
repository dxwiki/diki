'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MathJax } from 'better-react-mathjax';
import { MathJaxProvider } from './MathJaxProvider';
import { parseMarkdownSegment, splitBlockMath, isBlockMath } from '@diki/core';

interface MarkdownContentProps {
  content: string; // 마크다운+수식이 섞인 문자열
}

export default function MarkdownContent({ content }: MarkdownContentProps) {
  const [renderKey, setRenderKey] = useState(0);
  const renderedContent = useRef(content);

  // 첫 마운트 직후 다시 마운트하면 MathJax가 사라진 노드를 조판하다 실패하므로 내용이 바뀔 때만 갱신한다
  useEffect(() => {
    if (renderedContent.current === content) return;
    renderedContent.current = content;
    setRenderKey((prev) => prev + 1);
  }, [content]);

  // 블록 수식($$...$$)은 분리하고 나머지만 마크다운으로 파싱한다
  const blocks = splitBlockMath(content);

  return (
    <MathJaxProvider key={renderKey}>
      <div>
        {blocks.map((block, i) => {
          if (isBlockMath(block)) {
            return (
              <MathJax key={`${ renderKey }-block-${ i }`} className="markdown-math-block">
                {block}
              </MathJax>
            );
          }

          const html = parseMarkdownSegment(block);
          return (
            <MathJax key={`${ renderKey }-segment-${ i }`} hideUntilTypeset="first">
              <span className="break-all" dangerouslySetInnerHTML={{ __html: html }} />
            </MathJax>
          );
        })}
      </div>
    </MathJaxProvider>
  );
}
