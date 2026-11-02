import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, useReducedMotion } from 'react-native-reanimated';
import Button from '@/components/ui/Button';
import Text from '@/components/ui/Text';
import { font, spacing, useThemeColors } from '@/theme';
import { CSS_EASE_OUT, EASE_OUT } from '@/theme/motion';
import Icon from './Icon';

// 레슨을 끝낸 순간에만 한 번 체크 배지가 살짝 튀어나온다
const POP = {
  '0%': { opacity: 0, transform: [{ scale: 0.9 }] },
  '60%': { opacity: 1, transform: [{ scale: 1.06 }] },
  '100%': { opacity: 1, transform: [{ scale: 1 }] },
};

interface LessonCompleteProps {
  questionCount: number;
  firstTryCorrect: number;
  next: { title: string; onPress: ()=> void } | null;
  onMap: ()=> void;
  onRestart: ()=> void;
  onOpenTerm: ()=> void;
}

export default function LessonComplete({ questionCount, firstTryCorrect, next, onMap, onRestart, onOpenTerm }: LessonCompleteProps) {
  const colors = useThemeColors();
  const reduced = useReducedMotion();
  const perfect = firstTryCorrect === questionCount;
  return (
    <View style={styles.wrap}>
      <View style={styles.hero}>
        <Animated.View
          style={[
            styles.badge,
            { backgroundColor: colors.primary },
            !reduced && { animationName: POP, animationDuration: '420ms', animationTimingFunction: CSS_EASE_OUT },
          ]}
        >
          <Icon name="check" color={colors.background} size={28} />
        </Animated.View>
        <Text style={styles.title}>{'레슨 완료!'}</Text>
        {questionCount > 0 ? (
          <Text style={{ color: colors['text-secondary'] }}>{`문제 ${ questionCount }개 중 ${ firstTryCorrect }개를 한 번에 맞혔어요.`}</Text>
        ) : null}
        {questionCount > 0 && !perfect ? (
          <Text variant="caption">{'틀린 문제가 있어 코스 지도에 복습 표시를 남겼어요.'}</Text>
        ) : null}
      </View>
      <Animated.View
        entering={FadeIn.delay(120).duration(240).easing(EASE_OUT)}
        style={styles.actions}
      >
        {next ? (
          <Button
            label={`다음 Step · ${ next.title }`}
            onPress={next.onPress}
          />
        ) : null}
        <Button
          label="코스 지도로"
          variant={next ? 'secondary' : 'primary'}
          onPress={onMap}
        />
        <Button
          label="용어 전체 설명 보기"
          variant="secondary"
          onPress={onOpenTerm}
        />
        <Button
          label="다시 풀기"
          variant="secondary"
          onPress={onRestart}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.section,
    paddingTop: spacing.gutter,
  },
  hero: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  badge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: font.title1,
    fontWeight: '700',
  },
  actions: {
    gap: spacing.sm,
  },
});
