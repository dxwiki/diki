import { Stack } from 'expo-router';
import { useThemeColors } from '@/theme';

// 네이티브 탭은 헤더를 그리지 않아서 탭마다 스택을 두고 제목을 단다
export default function TabStack({ screen, title }: { screen: string; title: string }) {
  const colors = useThemeColors();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
      }}
    >
      <Stack.Screen
        name={screen}
        options={{ title }}
      />
    </Stack>
  );
}
