import { needsWebRender } from '@diki/core';
import Text from '@/components/ui/Text';
import { useThemeColors } from '@/theme';
import ArticleWebView from './ArticleWebView';

interface RichTextProps {
  text: string;
}

// 수식·표·목록·인용·이미지가 있을 때만 WebView, 나머지는 네이티브 Text
export default function RichText({ text }: RichTextProps) {
  const colors = useThemeColors();
  if (!text.trim()) return null;
  if (needsWebRender(text)) return <ArticleWebView content={text} />;
  return <Text style={{ color: colors['text-secondary'] }}>{text}</Text>;
}
