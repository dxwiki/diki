import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, useReducedMotion } from 'react-native-reanimated';
import Text from '@/components/ui/Text';
import { font, radius, spacing, tint, useThemeColors } from '@/theme';
import { CSS_EASE_OUT, EASE_OUT } from '@/theme/motion';

// 오답은 짧게 좌우로 흔들어 알린다
const SHAKE = {
  '0%': { transform: [{ translateX: 0 }] },
  '25%': { transform: [{ translateX: -6 }] },
  '50%': { transform: [{ translateX: 5 }] },
  '75%': { transform: [{ translateX: -3 }] },
  '100%': { transform: [{ translateX: 0 }] },
};
import Icon from './Icon';

export default function AnswerFeedback({ correct, explanation }: { correct: boolean; explanation?: string }) {
  const colors = useThemeColors();
  const reduced = useReducedMotion();
  const tone = correct ? colors['level-2'] : colors['level-5'];
  return (
    <Animated.View
      entering={FadeIn.duration(200).easing(EASE_OUT)}
      accessibilityLiveRegion="polite"
      style={[
        styles.box,
        { backgroundColor: tint(tone) },
        !correct && !reduced && { animationName: SHAKE, animationDuration: '320ms', animationTimingFunction: CSS_EASE_OUT },
      ]}
    >
      <View style={styles.head}>
        <Icon name={correct ? 'check' : 'close'} color={tone} />
        <Text style={[styles.title, { color: tone }]}>{correct ? '정답이에요' : '아쉬워요'}</Text>
      </View>
      {!correct ? <Text variant="caption">{'이 문제는 레슨 끝에서 한 번 더 풀어요.'}</Text> : null}
      {explanation ? <Text style={[styles.body, { color: colors['text-secondary'] }]}>{explanation}</Text> : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderRadius: radius.md,
    borderCurve: 'continuous',
    padding: spacing.gutter,
    gap: spacing.sm,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    fontSize: font.callout,
    fontWeight: '700',
  },
  body: {
    fontSize: font.body,
    lineHeight: 23,
  },
});
