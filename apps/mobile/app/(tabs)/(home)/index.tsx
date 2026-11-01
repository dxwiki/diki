import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { DEFAULT_LISTING, listTerms } from '@diki/core';
import ModeCard from '@/components/home/ModeCard';
import TermChips from '@/components/terms/TermChips';
import { useOpenTerm } from '@/components/terms/useOpenTerm';
import Icon from '@/components/ui/Icon';
import ListSection from '@/components/ui/ListSection';
import Screen from '@/components/ui/Screen';
import Text from '@/components/ui/Text';
import { useContent } from '@/lib/content';
import { useProgress } from '@/lib/progress';
import { font, radius, spacing, useThemeColors } from '@/theme';

const completedCount = (records: Record<string, { completed: boolean }>) => Object.values(records).filter((r) => r.completed).length;

export default function HomeScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { terms } = useContent();
  const { state } = useProgress();
  // 발행일 최신순 10개 (core 기본 정렬)
  const latestTerms = useMemo(() => listTerms(terms, DEFAULT_LISTING).slice(0, 10), [terms]);
  const openTerm = useOpenTerm();
  const learned = completedCount(state.learn);
  const practiced = completedCount(state.interview);

  return (
    <Screen
      bleed
      divided
    >
      <View style={styles.top}>
        <View style={styles.hero}>
          <Text
            accessibilityRole="header"
            accessibilityLabel="Diki"
            style={styles.logo}
          >
            <Text style={[styles.logo, { color: colors.primary }]}>{'D'}</Text>
            {'iki'}
          </Text>
          <Text style={styles.headline}>{'데이터 개념부터 직무 면접까지'}</Text>
          <Text style={{ color: colors.gray1 }}>{`데이터 용어 ${ terms.length }개를 오프라인에서도 찾고 익히는 용어사전이에요.`}</Text>
          <Pressable
            accessibilityRole="search"
            accessibilityLabel="용어 검색"
            accessibilityHint="용어사전 탭의 검색창으로 이동합니다"
            onPress={() => router.push({ pathname: '/terms', params: { focus: String(Date.now()) } })}
            style={({ pressed }) => [styles.search, { backgroundColor: colors['extreme-light'] }, pressed && styles.pressed]}
          >
            <Icon
              name="search"
              color={colors.gray1}
              size={17}
            />
            <Text style={{ color: colors.gray2 }}>{'용어 검색 (한글·영문)'}</Text>
          </Pressable>
        </View>

        <TermChips
          title="최신 포스트"
          terms={latestTerms}
          onPress={openTerm}
        />
      </View>

      <ListSection title="무엇을 해 볼까요">
        <ModeCard
          icon="learn"
          tone={colors['level-1']}
          label="학습하기"
          description="입문부터 마스터까지 5단계, 한 Step에 한 개념씩 익혀요."
          status={learned ? `${ learned }개 완료` : undefined}
          onPress={() => router.navigate('/learn' as Href)}
        />
        <ModeCard
          icon="interview"
          tone={colors.primary}
          label="면접 준비"
          description="DS·DE·DA 직무별 질문에 답하고 평가 기준으로 점검해요."
          status={practiced ? `${ practiced }개 완료` : undefined}
          onPress={() => router.navigate('/interview' as Href)}
        />
        <ModeCard
          icon="dictionary"
          tone={colors['level-4']}
          label="용어사전"
          description="정의·사용 사례·관련 용어·참고 자료를 한곳에서 봐요."
          onPress={() => router.navigate('/terms' as Href)}
        />
      </ListSection>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: {
    gap: spacing.lg,
    paddingVertical: spacing.lg,
  },
  hero: {
    gap: spacing.sm,
    paddingHorizontal: spacing.gutter,
  },
  logo: {
    fontSize: font.display,
    lineHeight: 48,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headline: {
    fontSize: font.title2,
    fontWeight: '700',
    lineHeight: 30,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    borderRadius: radius.md,
    borderCurve: 'continuous',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  pressed: {
    opacity: 0.7,
  },
});
