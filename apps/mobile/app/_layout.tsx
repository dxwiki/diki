import { Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ContentProvider } from '@/lib/content';
import { RecentTermsProvider } from '@/lib/recent';
import { getNavigationTheme, useColorSchemeName } from '@/theme';

export { ErrorBoundary } from 'expo-router';

export default function RootLayout() {
  const scheme = useColorSchemeName();
  return (
    <ThemeProvider value={getNavigationTheme(scheme)}>
      <ContentProvider>
        <RecentTermsProvider>
          <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
          <Stack>
            <Stack.Screen
              name={'(tabs)'}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name={'posts/[slug]'}
              options={{ title: '', headerBackTitle: '뒤로' }}
            />
          </Stack>
        </RecentTermsProvider>
      </ContentProvider>
    </ThemeProvider>
  );
}
