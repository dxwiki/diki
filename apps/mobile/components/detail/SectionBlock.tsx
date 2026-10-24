import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Text from '@/components/ui/Text';
import { useThemeColors } from '@/theme';

interface SectionBlockProps {
  title?: string;
  children: ReactNode;
}

export default function SectionBlock({ title, children }: SectionBlockProps) {
  const colors = useThemeColors();
  return (
    <View style={styles.section}>
      {title ? (
        <Text
          accessibilityRole="header"
          style={[styles.title, { color: colors.text }]}
        >
          {title}
        </Text>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 14,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
});
