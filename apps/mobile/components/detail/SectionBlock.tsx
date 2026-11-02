import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Text from '@/components/ui/Text';
import { font, spacing, useThemeColors } from '@/theme';

interface SectionBlockProps {
  title?: string;
  children: ReactNode;
}

// 웹 섹션 제목처럼 앞에 primary '#' 을 붙인다 (읽기 프로그램에는 제목만 읽힘)
export default function SectionBlock({ title, children }: SectionBlockProps) {
  const colors = useThemeColors();
  return (
    <View style={styles.section}>
      {title ? (
        <Text
          accessibilityRole="header"
          accessibilityLabel={title}
          style={[styles.title, { color: colors.text }]}
        >
          <Text style={[styles.title, { color: colors.primary }]}>{'# '}</Text>
          {title}
        </Text>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md,
  },
  title: {
    fontSize: font.title3,
    fontWeight: '700',
  },
});
