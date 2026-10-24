import { StyleSheet, View } from 'react-native';
import Button from '@/components/ui/Button';
import Screen from '@/components/ui/Screen';
import Text from '@/components/ui/Text';

interface NotFoundProps {
  onBack: ()=> void;
}

export default function NotFound({ onBack }: NotFoundProps) {
  return (
    <Screen>
      <View style={styles.body}>
        <Text
          variant="title"
          accessibilityRole="header"
        >
          {'용어를 찾을 수 없음'}
        </Text>
        <Text variant="caption">{'삭제되었거나 주소가 바뀐 용어예요.'}</Text>
      </View>
      <Button
        label="용어사전으로"
        onPress={onBack}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    gap: 8,
    paddingTop: 24,
  },
});
