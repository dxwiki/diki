import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import type { ShouldStartLoadRequest } from 'react-native-webview/lib/WebViewTypes';
import { buildArticleHtml, parseArticleMessage } from '@diki/core';
import { useMathJaxScript } from '@/lib/webview';
import { spacing, useThemeColors } from '@/theme';
import { useDetailLinks } from './useDetailLinks';

interface ArticleWebViewProps {
  content: string;
}

const INITIAL_HEIGHT = 1;

// source.html 의 초기 로드만 허용하고 WebView 자체의 페이지 이동은 모두 막는다
const isInitialLoad = (request: ShouldStartLoadRequest): boolean => {
  const url = request.url ?? '';
  return url === '' || url === 'about:blank' || url.startsWith('data:');
};

export default function ArticleWebView({ content }: ArticleWebViewProps) {
  const colors = useThemeColors();
  const mathJaxScript = useMathJaxScript();
  const { openHref } = useDetailLinks();
  const [height, setHeight] = useState(INITIAL_HEIGHT);

  const html = useMemo(
    () => (mathJaxScript === null ? null : buildArticleHtml({ content, colors, mathJaxScript })),
    [content, colors, mathJaxScript],
  );

  const onMessage = useCallback((event: WebViewMessageEvent) => {
    const message = parseArticleMessage(event.nativeEvent.data);
    if (!message) return;
    if (message.type === 'height') setHeight(Math.max(INITIAL_HEIGHT, message.height));
    else openHref(message.href);
  }, [openHref]);

  if (html === null) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <WebView
      source={{ html }}
      originWhitelist={['*']}
      onMessage={onMessage}
      onShouldStartLoadWithRequest={isInitialLoad}
      javaScriptEnabled
      scrollEnabled={false}
      nestedScrollEnabled={false}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      setSupportMultipleWindows={false}
      javaScriptCanOpenWindowsAutomatically={false}
      allowFileAccess={false}
      style={[styles.webview, { height }]}
      containerStyle={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  loading: {
    paddingVertical: spacing.gutter,
    alignItems: 'center',
  },
  container: {
    flex: 0,
  },
  webview: {
    width: '100%',
    backgroundColor: 'transparent',
  },
});
