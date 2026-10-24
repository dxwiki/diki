import Constants from 'expo-constants';
import { StyleSheet, View } from 'react-native';
import Button from '@/components/ui/Button';
import Screen from '@/components/ui/Screen';
import Text from '@/components/ui/Text';
import { useContent } from '@/lib/content';
import { openWeb } from '@/lib/links';
import { useThemeColors } from '@/theme';

const SOURCE_LABELS = {
  bundled: '앱 설치본',
  downloaded: '내려받은 콘텐츠',
} as const;

const formatDate = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${ date.getFullYear() }-${ pad(date.getMonth() + 1) }-${ pad(date.getDate()) }`;
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text variant="caption">{label}</Text>
      <Text selectable>{value}</Text>
    </View>
  );
}

export default function MeScreen() {
  const colors = useThemeColors();
  const { version, source } = useContent();
  const appVersion = Constants.expoConfig?.version ?? '-';
  const cardStyle = [styles.card, { backgroundColor: colors['background-secondary'], borderColor: colors['extreme-light'] }];

  return (
    <Screen>
      <Text variant="title">{'내 정보'}</Text>
      <View style={cardStyle}>
        <Text>{'로그인은 준비 중이에요.'}</Text>
        <Text variant="caption">{'마이페이지와 용어 작성은 웹에서 이용할 수 있어요.'}</Text>
      </View>
      <Button
        label="웹 마이페이지 열기"
        accessibilityHint="시스템 브라우저에서 웹 로그인 페이지를 엽니다"
        onPress={() => {
          void openWeb('/login');
        }}
      />
      <Button
        label="웹에서 용어 작성하기"
        variant="outline"
        accessibilityHint="시스템 브라우저에서 용어 작성 페이지를 엽니다"
        onPress={() => {
          void openWeb('/posts/create');
        }}
      />
      <View style={cardStyle}>
        <InfoRow
          label="앱 버전"
          value={appVersion}
        />
        <InfoRow
          label="콘텐츠 버전"
          value={version.contentVersion}
        />
        <InfoRow
          label="콘텐츠 생성일"
          value={formatDate(version.generatedAt)}
        />
        <InfoRow
          label="콘텐츠 출처"
          value={SOURCE_LABELS[source]}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 20,
    gap: 12,
  },
  row: {
    gap: 2,
  },
});
