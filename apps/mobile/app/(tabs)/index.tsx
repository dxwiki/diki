import { Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import RecentTerms from '@/components/terms/RecentTerms';
import { useOpenTerm } from '@/components/terms/useOpenTerm';
import Screen from '@/components/ui/Screen';
import Text from '@/components/ui/Text';
import { useContent } from '@/lib/content';
import { useRecentTerms } from '@/lib/recent';
import { useThemeColors } from '@/theme';

export default function HomeScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { terms } = useContent();
  const { recentTerms } = useRecentTerms();
  const openTerm = useOpenTerm();

  return (
    <Screen>
      <Text variant="title">{'Diki'}</Text>
      <Text>{'데이터 분야 용어를 쉽게 찾아보고 익히는 용어사전이에요.'}</Text>
      <Text variant="caption">{`공개 용어 ${ terms.length }개를 오프라인에서도 볼 수 있어요.`}</Text>
      <Pressable
        accessibilityRole="search"
        accessibilityLabel="용어 검색"
        accessibilityHint="용어사전 탭의 검색창으로 이동합니다"
        onPress={() => router.push({ pathname: '/(tabs)/terms', params: { focus: String(Date.now()) } })}
        style={({ pressed }) => [
          styles.search,
          { backgroundColor: colors['background-secondary'], borderColor: colors['extreme-light'] },
          pressed && styles.pressed,
        ]}
      >
        <Text style={{ color: colors.gray2 }}>{'용어 검색 (한글·영문)'}</Text>
      </Pressable>
      <RecentTerms
        terms={recentTerms}
        onPress={openTerm}
        emptyText="아직 본 용어가 없어요. 용어사전에서 용어를 열어 보세요."
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  search: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  pressed: {
    opacity: 0.7,
  },
});
