import { StyleSheet, View } from 'react-native';
import { useThemeColors } from '@/theme';

export default function ProgressBar({ value }: { value: number }) {
  const colors = useThemeColors();
  const percent = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: percent }}
      style={[styles.track, { backgroundColor: colors['extreme-light'] }]}
    >
      <View style={[styles.fill, { width: `${ percent }%`, backgroundColor: colors.primary }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
});
