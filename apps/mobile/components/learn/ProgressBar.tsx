import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useThemeColors } from '@/theme';
import { CSS_EASE_OUT } from '@/theme/motion';

// 채움 막대는 자식 없는 절대 위치 요소라 width 를 바로 움직여도 다른 요소를 다시 배치하지 않는다
export default function ProgressBar({ value }: { value: number }) {
  const colors = useThemeColors();
  const percent = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: percent }}
      style={[styles.track, { backgroundColor: colors['extreme-light'] }]}
    >
      <Animated.View
        style={[
          styles.fill,
          {
            width: `${ percent }%`,
            backgroundColor: colors.primary,
            transitionProperty: 'width',
            transitionDuration: '300ms',
            transitionTimingFunction: CSS_EASE_OUT,
          },
        ]}
      />
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
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 3,
  },
});
