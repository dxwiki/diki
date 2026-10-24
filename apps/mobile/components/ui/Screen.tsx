import type { ReactNode } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useThemeColors } from '@/theme';

interface ScreenProps {
  children: ReactNode;
}

export default function Screen({ children }: ScreenProps) {
  const colors = useThemeColors();
  return (
    <ScrollView
      contentInsetAdjustmentBehavior={'automatic'}
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 48,
    gap: 16,
  },
});
