import { StyleSheet, View } from 'react-native';
import Button from '@/components/ui/Button';
import Text from '@/components/ui/Text';
import { useThemeColors } from '@/theme';
import Icon from './Icon';

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
  const perfect = firstTryCorrect === questionCount;
  return (
    <View style={styles.wrap}>
      <View style={styles.hero}>
        <View style={[styles.badge, { backgroundColor: colors.primary }]}>
          <Icon name="check" color={colors.background} size={28} />
        </View>
        <Text style={styles.title}>{'레슨 완료!'}</Text>
        {questionCount > 0 ? (
          <Text style={{ color: colors['text-secondary'] }}>{`문제 ${ questionCount }개 중 ${ firstTryCorrect }개를 한 번에 맞혔어요.`}</Text>
        ) : null}
        {questionCount > 0 && !perfect ? (
          <Text variant="caption">{'틀린 문제가 있어 코스 지도에 복습 표시를 남겼어요.'}</Text>
        ) : null}
      </View>
      <View style={styles.actions}>
        {next ? (
          <Button
            label={`다음 Step · ${ next.title }`}
            onPress={next.onPress}
          />
        ) : null}
        <Button
          label="코스 지도로"
          variant={next ? 'outline' : 'primary'}
          onPress={onMap}
        />
        <Button
          label="용어 전체 설명 보기"
          variant="outline"
          onPress={onOpenTerm}
        />
        <Button
          label="다시 풀기"
          variant="outline"
          onPress={onRestart}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 32,
    paddingTop: 16,
  },
  hero: {
    alignItems: 'center',
    gap: 10,
  },
  badge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
  },
  actions: {
    gap: 10,
  },
});
