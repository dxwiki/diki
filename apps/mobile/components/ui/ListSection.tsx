import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Text from '@/components/ui/Text';
import { font, hairline, spacing, useThemeColors } from '@/theme';

interface ListSectionProps {
  title?: string;
  trailing?: string;
  footer?: string;
  children: ReactNode;
}

// 상자 없이 제목과 아래 줄로만 나뉘는 목록 묶음
export default function ListSection({ title, trailing, footer, children }: ListSectionProps) {
  const colors = useThemeColors();
  return (
    <View>
      {title ? (
        <View style={styles.header}>
          <Text
            accessibilityRole="header"
            style={[styles.title, { color: colors.gray1 }]}
          >
            {title}
          </Text>
          {trailing ? <Text variant="caption">{trailing}</Text> : null}
        </View>
      ) : null}
      <View style={[styles.rows, { borderTopColor: colors.line }]}>
        <View style={styles.clipLast}>{children}</View>
      </View>
      {footer ? (
        <Text
          variant="caption"
          style={styles.footer}
        >
          {footer}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  rows: {
    borderTopWidth: hairline,
    overflow: 'hidden',
  },
  clipLast: {
    marginBottom: -hairline,
  },
  title: {
    fontSize: font.footnote,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
});
