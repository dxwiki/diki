import type { ComponentProps } from 'react';
import type { ColorValue } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { Tabs } from 'expo-router/js-tabs';
import { useThemeColors } from '@/theme';

type SymbolName = ComponentProps<typeof SymbolView>['name'];

const TAB_ICONS: Record<string, SymbolName> = {
  index: { ios: 'house.fill', android: 'home' },
  learn: { ios: 'graduationcap.fill', android: 'school' },
  interview: { ios: 'briefcase.fill', android: 'work' },
  terms: { ios: 'book.fill', android: 'menu_book' },
  me: { ios: 'person.crop.circle', android: 'person' },
};

const renderIcon = (route: string) => function TabIcon({ color }: { color: ColorValue }) {
  return (
    <SymbolView
      name={TAB_ICONS[route]}
      tintColor={color}
      size={24}
    />
  );
};

export default function TabLayout() {
  const colors = useThemeColors();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray2,
        tabBarStyle: { backgroundColor: colors.background, borderTopColor: colors.border },
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
      }}
    >
      <Tabs.Screen
        name={'index'}
        options={{ title: '홈', tabBarIcon: renderIcon('index') }}
      />
      <Tabs.Screen
        name={'learn'}
        options={{ title: '학습', tabBarIcon: renderIcon('learn') }}
      />
      <Tabs.Screen
        name={'interview'}
        options={{ title: '면접', tabBarIcon: renderIcon('interview') }}
      />
      <Tabs.Screen
        name={'terms'}
        options={{ title: '용어사전', tabBarIcon: renderIcon('terms') }}
      />
      <Tabs.Screen
        name={'me'}
        options={{ title: '내 정보', tabBarIcon: renderIcon('me') }}
      />
    </Tabs>
  );
}
