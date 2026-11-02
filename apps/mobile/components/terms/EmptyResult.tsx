import { StyleSheet, View } from 'react-native';
import Button from '@/components/ui/Button';
import Text from '@/components/ui/Text';
import { spacing } from '@/theme';

interface EmptyResultProps {
  onReset: ()=> void;
}

export default function EmptyResult({ onReset }: EmptyResultProps) {
  return (
    <View style={styles.wrap}>
      <Text variant="title">{'결과 없음'}</Text>
      <Text variant="caption">{'검색어나 필터에 맞는 용어가 없어요.'}</Text>
      <Button
        label="필터 초기화"
        variant="secondary"
        accessibilityHint="검색어·필터·정렬을 처음 상태로 되돌립니다"
        onPress={onReset}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    padding: spacing.section,
    gap: spacing.md,
    alignItems: 'center',
  },
});
