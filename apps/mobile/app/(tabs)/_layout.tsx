import { useEffect, useState } from 'react';
import { Keyboard } from 'react-native';
import { NativeTabs } from 'expo-router/native-tabs';
import { useThemeColors } from '@/theme';

// 앱을 새로 열면 항상 홈 탭부터 보인다
export const unstable_settings = { anchor: '(home)' };

// iOS 는 시스템 탭바(iOS 26 Liquid Glass), Android 는 Material 3 하단 내비게이션 (이름은 항상 표시)
// Android 하단 내비게이션은 키보드가 올라오면 숨겨 입력 공간을 확보한다
const useAndroidKeyboardOpen = () => {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (process.env.EXPO_OS !== 'android') return;
    const show = Keyboard.addListener('keyboardDidShow', () => setOpen(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setOpen(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  return open;
};

export default function TabLayout() {
  const colors = useThemeColors();
  const keyboardOpen = useAndroidKeyboardOpen();
  return (
    <NativeTabs
      tintColor={colors.primary}
      labelVisibilityMode="labeled"
      hidden={keyboardOpen}
    >
      <NativeTabs.Trigger name="(home)">
        <NativeTabs.Trigger.Icon
          sf={{ default: 'house', selected: 'house.fill' }}
          md="home"
        />
        <NativeTabs.Trigger.Label>{'홈'}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="(learn)">
        <NativeTabs.Trigger.Icon
          sf={{ default: 'graduationcap', selected: 'graduationcap.fill' }}
          md="school"
        />
        <NativeTabs.Trigger.Label>{'학습'}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="(interview)">
        <NativeTabs.Trigger.Icon
          sf={{ default: 'bubble.left.and.bubble.right', selected: 'bubble.left.and.bubble.right.fill' }}
          md="forum"
        />
        <NativeTabs.Trigger.Label>{'면접'}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="(terms)">
        <NativeTabs.Trigger.Icon
          sf={{ default: 'book', selected: 'book.fill' }}
          md="menu_book"
        />
        <NativeTabs.Trigger.Label>{'용어사전'}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="(me)">
        <NativeTabs.Trigger.Icon
          sf={{ default: 'gearshape', selected: 'gearshape.fill' }}
          md="settings"
        />
        <NativeTabs.Trigger.Label>{'설정'}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
