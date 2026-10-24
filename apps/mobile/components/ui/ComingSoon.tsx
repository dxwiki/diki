import { StyleSheet, View } from 'react-native';
import { openWeb } from '@/lib/links';
import { useThemeColors } from '@/theme';
import Button from './Button';
import Screen from './Screen';
import Text from './Text';

interface ComingSoonProps {
  title: string;
  description: string;
  webPath: string;
  webLabel: string;
}

export default function ComingSoon({ title, description, webPath, webLabel }: ComingSoonProps) {
  const colors = useThemeColors();
  return (
    <Screen>
      <View style={[styles.card, { backgroundColor: colors['background-secondary'], borderColor: colors['extreme-light'] }]}>
        <Text variant={'title'}>{title}</Text>
        <Text>{'앱에서는 준비 중이에요.'}</Text>
        <Text variant={'caption'}>{description}</Text>
      </View>
      <Button
        label={webLabel}
        accessibilityHint={'시스템 브라우저에서 웹 페이지를 엽니다'}
        onPress={() => {
          void openWeb(webPath);
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 20,
    gap: 8,
  },
});
