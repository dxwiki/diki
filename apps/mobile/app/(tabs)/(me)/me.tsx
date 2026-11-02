import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import ListSection from '@/components/ui/ListSection';
import Screen from '@/components/ui/Screen';
import SettingRow from '@/components/ui/SettingRow';
import { useContent } from '@/lib/content';
import { openWeb } from '@/lib/links';
import { useThemePreference, type ThemePreference } from '@/lib/preferences';
import { useProgress } from '@/lib/progress';
import { useRecentTerms } from '@/lib/recent';

const SOURCE_LABELS = {
  bundled: '앱 설치본',
  downloaded: '내려받은 콘텐츠',
} as const;

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: '시스템 설정' },
  { value: 'light', label: '라이트' },
  { value: 'dark', label: '다크' },
];

const formatDate = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${ date.getFullYear() }-${ pad(date.getMonth() + 1) }-${ pad(date.getDate()) }`;
};

export default function SettingsScreen() {
  const router = useRouter();
  const { version, source } = useContent();
  const { preference, setPreference } = useThemePreference();
  const { state, resetProgress } = useProgress();
  const { ids, clearRecentTerms } = useRecentTerms();
  const appVersion = Constants.expoConfig?.version ?? '-';
  const recordCount = Object.keys(state.learn).length + Object.keys(state.interview).length + Object.keys(state.drafts).length;

  const confirmReset = () => {
    Alert.alert('학습·면접 기록 초기화', '이 기기에 저장된 학습 진도, 면접 연습 기록, 답변 초안을 모두 지워요. 되돌릴 수 없어요.', [
      { text: '취소', style: 'cancel' },
      { text: '초기화', style: 'destructive', onPress: resetProgress },
    ]);
  };

  return (
    <Screen
      bleed
      divided
    >
      <ListSection title="테마">
        {THEME_OPTIONS.map((option) => (
          <SettingRow
            key={option.value}
            label={option.label}
            selected={preference === option.value}
            onPress={() => setPreference(option.value)}
          />
        ))}
      </ListSection>

      <ListSection
        title="기록"
        footer="모든 기록은 이 기기에만 저장되고 서버로 보내지 않아요. 앱을 지우면 함께 지워져요."
      >
        <SettingRow
          label="최근 본 용어 지우기"
          value={ids.length ? `${ ids.length }개` : '없음'}
          onPress={ids.length ? clearRecentTerms : undefined}
        />
        <SettingRow
          label="학습·면접 기록 초기화"
          destructive
          onPress={recordCount ? confirmReset : undefined}
          value={recordCount ? undefined : '기록 없음'}
        />
      </ListSection>

      <ListSection title="Diki">
        <SettingRow
          label="웹사이트"
          external
          hint="시스템 브라우저에서 diki.kr 을 엽니다"
          onPress={() => {
            void openWeb('/');
          }}
        />
        <SettingRow
          label="용어 제안·작성 (웹)"
          external
          hint="시스템 브라우저에서 용어 작성 페이지를 엽니다"
          onPress={() => {
            void openWeb('/posts/create');
          }}
        />
        <SettingRow
          label="문의하기"
          external
          onPress={() => {
            void openWeb('/contact');
          }}
        />
        <SettingRow
          label="개인정보 처리방침"
          onPress={() => router.push('/privacy')}
        />
      </ListSection>

      <ListSection title="앱 정보">
        <SettingRow
          label="앱 버전"
          value={appVersion}
        />
        <SettingRow
          label="콘텐츠 버전"
          value={version.contentVersion}
        />
        <SettingRow
          label="콘텐츠 생성일"
          value={formatDate(version.generatedAt)}
        />
        <SettingRow
          label="콘텐츠 출처"
          value={SOURCE_LABELS[source]}
        />
      </ListSection>
    </Screen>
  );
}
