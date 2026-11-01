import { Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ContentProvider } from '@/lib/content';
import { ThemePreferenceProvider } from '@/lib/preferences';
import { ProgressProvider } from '@/lib/progress';
import { RecentTermsProvider } from '@/lib/recent';
import { backHeaderOptions } from '@/components/navigation/BackButton';
import { getNavigationTheme, useColorSchemeName, useThemeColors } from '@/theme';

export { ErrorBoundary } from 'expo-router';

export default function RootLayout() {
  const scheme = useColorSchemeName();
  const colors = useThemeColors();
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemePreferenceProvider>
        <ThemeProvider value={getNavigationTheme(scheme)}>
          <ContentProvider>
            <RecentTermsProvider>
              <ProgressProvider>
                <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
                <Stack
                  screenOptions={{
                    headerStyle: { backgroundColor: colors.background },
                    headerTintColor: colors.text,
                    headerShadowVisible: true,
                  }}
                >
                  <Stack.Screen
                    name="(tabs)"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="privacy"
                    options={{ title: '개인정보 처리방침', ...backHeaderOptions('/me') }}
                  />
                  <Stack.Screen
                    name="posts/[slug]"
                    options={{ title: '', ...backHeaderOptions('/terms') }}
                  />
                  <Stack.Screen
                    name="learn/[stage]/[phase]/[step]"
                    options={{ title: '', ...backHeaderOptions('/learn') }}
                  />
                  <Stack.Screen
                    name="interview/[role]/[phase]/[step]"
                    options={{ title: '', ...backHeaderOptions('/interview') }}
                  />
                </Stack>
              </ProgressProvider>
            </RecentTermsProvider>
          </ContentProvider>
        </ThemeProvider>
      </ThemePreferenceProvider>
    </GestureHandlerRootView>
  );
}
