import { Pressable, StyleSheet, Text } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import Icon from '@/components/ui/Icon';
import { font, spacing, useThemeColors } from '@/theme';

// 상세 화면 공통 '< 이전': 배경·테두리 없이 글자만 둔다
export default function BackButton({ fallback }: { fallback: Href }) {
  const colors = useThemeColors();
  const router = useRouter();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="이전"
      hitSlop={12}
      onPress={() => (router.canGoBack() ? router.back() : router.replace(fallback))}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <Icon
        name="chevronLeft"
        color={colors.text}
        size={process.env.EXPO_OS === 'android' ? 22 : 17}
      />
      <Text style={[styles.label, { color: colors.text }]}>{'이전'}</Text>
    </Pressable>
  );
}

// iOS 26 은 머리 버튼을 유리 캡슐로 감싸므로 hidesSharedBackground 로 걷어낸다
export const backHeaderOptions = (fallback: Href) => ({
  headerBackVisible: false,
  headerLeft: () => <BackButton fallback={fallback} />,
  unstable_headerLeftItems: () => [{
    type: 'custom' as const,
    element: <BackButton fallback={fallback} />,
    hidesSharedBackground: true,
  }],
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    // Android 는 제목이 버튼 바로 옆에 붙으므로 사이를 띄운다
    marginRight: process.env.EXPO_OS === 'android' ? spacing.lg : 0,
  },
  label: {
    fontSize: font.headline,
  },
  pressed: {
    opacity: 0.5,
  },
});
