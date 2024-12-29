'use client';

interface MarkdownContentProps {
  content: string;
}

const MarkdownContent = ({ content }: MarkdownContentProps) => {
  const parseMarkdown = (text: string) => {
    // 1. <br> -> \n\n으로 변환
    let html = text.replace(/<br\s*\/?>/gi, '\n\n');

    // 2. 리스트 처리
    html = html.replace(/(?:^|\n)\d+\.\s*(.+?)(?=\n|$)/g, '<li class="list-decimal">$1</li>');
    html = html.replace(/(<li class="list-decimal">.+?<\/li>(?:\s*<li class="list-decimal">.+?<\/li>)*)/g, '<ol class="list">$1</ol>');

    // 불릿 리스트
    html = html.replace(/(?:^|\n)-\s*(.+?)(?=\n|$)/g, '<li class="list-disc">$1</li>');
    html = html.replace(/(<li class="list-disc">.+?<\/li>(?:\s*<li class="list-disc">.+?<\/li>)*)/g, '<ul class="list">$1</ul>');

    // 3. Bold 처리 (**내용**)
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // 4. Italic 처리 (*내용*)
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    // 5. Inline code 처리 (`내용`)
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // 6. 링크 처리 ([텍스트](URL))
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

    // 7. 새 문단 처리 (빈 줄 기준으로 <p> 태그 감싸기)
    html = html
      .split('\n\n')
      .map((paragraph) => (paragraph.trim() ? `<p>${ paragraph.trim() }</p>` : ''))
      .join('');

    return html;
  };

  return (
    <div
      dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }}
    />
  );
};

export default MarkdownContent;

