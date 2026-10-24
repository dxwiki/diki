import { StyleSheet, View } from 'react-native';
import Text from '@/components/ui/Text';
import { useThemeColors } from '@/theme';
import Icon from './Icon';

export default function AnswerFeedback({ correct, explanation }: { correct: boolean; explanation?: string }) {
  const colors = useThemeColors();
  const tone = correct ? colors['level-2'] : colors['level-5'];
  return (
    <View
      accessibilityLiveRegion="polite"
      style={[styles.box, { borderColor: tone, backgroundColor: colors.background }]}
    >
      <View style={styles.head}>
        <Icon name={correct ? 'check' : 'close'} color={tone} />
        <Text style={[styles.title, { color: tone }]}>{correct ? '정답이에요' : '아쉬워요'}</Text>
      </View>
      {!correct ? <Text variant="caption">{'이 문제는 레슨 끝에서 한 번 더 풀어요.'}</Text> : null}
      {explanation ? <Text style={[styles.body, { color: colors['text-secondary'] }]}>{explanation}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 16,
    gap: 8,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  body: {
    fontSize: 15,
    lineHeight: 23,
  },
});
