import { useEffect, useState, type ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import * as Haptics from 'expo-haptics';
import { GestureDetector, GestureHandlerRootView, usePanGesture } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';
import Button from '@/components/ui/Button';
import Text from '@/components/ui/Text';
import { elevation, font, scrim, spacing, useThemeColors } from '@/theme';
import { EASE_SHEET, project, rubberband, SPRING_SHEET } from '@/theme/motion';

interface BottomSheetProps {
  visible: boolean;
  title: string;
  onClose: ()=> void;
  children: ReactNode;
  onReset?: ()=> void;
  onApply?: ()=> void;
  scroll?: boolean;
}

const OFFSCREEN = 1000;

// 아래에서 올라오는 시트: 손잡이·제목을 끌거나 튕기면 닫히고, onApply 가 있으면 초기화·적용 버튼을 붙인다
export default function BottomSheet({ visible, title, onClose, children, onReset, onApply, scroll = true }: BottomSheetProps) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(visible);
  const height = useSharedValue(OFFSCREEN);
  const y = useSharedValue(OFFSCREEN);
  const start = useSharedValue(0);
  const Body = scroll ? ScrollView : View;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      // 닫히는 도중에 다시 열면 그 자리에서 다시 올라온다
      if (height.get() !== OFFSCREEN) y.set(reduced ? 0 : withTiming(0, { duration: 320, easing: EASE_SHEET }));
      return;
    }
    if (!mounted) return;
    // 닫힐 때는 지금 위치에서 그대로 내려간 뒤 모달을 내린다
    const done = (finished?: boolean) => {
      'worklet';
      if (finished) scheduleOnRN(setMounted, false);
    };
    y.set(reduced ? withTiming(height.get(), { duration: 0 }, done) : withTiming(height.get(), { duration: 240, easing: EASE_SHEET }, done));
  }, [visible, mounted, reduced, y, height]);

  const onLayout = (e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height;
    const first = height.get() === OFFSCREEN;
    height.set(h);
    if (first && visible) {
      y.set(h);
      y.set(reduced ? 0 : withTiming(0, { duration: 320, easing: EASE_SHEET }));
    }
  };

  const pan = usePanGesture({
    activeOffsetY: [-10, 10],
    onActivate: () => {
      'worklet';
      start.set(y.get());
    },
    onUpdate: (e) => {
      'worklet';
      const next = start.get() + e.translationY;
      y.set(next >= 0 ? next : rubberband(next, height.get()));
    },
    onDeactivate: (e) => {
      'worklet';
      if (y.get() + project(e.velocityY) > height.get() * 0.4) {
        scheduleOnRN(onClose);
        return;
      }
      y.set(withSpring(0, { ...SPRING_SHEET, velocity: e.velocityY }));
      scheduleOnRN(Haptics.impactAsync, Haptics.ImpactFeedbackStyle.Light);
    },
  });

  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: y.get() }] }));
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(y.get(), [0, height.get()], [1, 0], Extrapolation.CLAMP),
  }));

  useEffect(() => {
    if (!mounted) height.set(OFFSCREEN);
  }, [mounted, height]);

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <GestureHandlerRootView style={styles.wrap}>
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <Pressable
            style={StyleSheet.absoluteFill}
            accessibilityRole="button"
            accessibilityLabel={`${ title } 닫기`}
            onPress={onClose}
          />
        </Animated.View>
        <Animated.View
          onLayout={onLayout}
          style={[styles.sheet, { backgroundColor: colors.background, paddingBottom: insets.bottom + spacing.sm }, sheetStyle]}
        >
          <GestureDetector gesture={pan}>
            <View>
              <View style={[styles.grabber, { backgroundColor: colors.gray3 }]} />
              <Text
                accessibilityRole="header"
                style={styles.title}
              >
                {title}
              </Text>
            </View>
          </GestureDetector>
          <Body>{children}</Body>
          {onApply ? (
            <View style={styles.actions}>
              {onReset ? (
                <View style={styles.reset}>
                  <Button
                    label="초기화"
                    variant="secondary"
                    onPress={onReset}
                  />
                </View>
              ) : null}
              <View style={styles.apply}>
                <Button
                  label="적용"
                  onPress={onApply}
                />
              </View>
            </View>
          ) : null}
        </Animated.View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: scrim,
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderCurve: 'continuous',
    maxHeight: '85%',
    boxShadow: elevation.sheet,
  },
  grabber: {
    alignSelf: 'center',
    width: 36,
    height: 5,
    borderRadius: 3,
    marginTop: spacing.sm,
  },
  title: {
    fontSize: font.headline,
    fontWeight: '700',
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.md,
  },
  reset: {
    flex: 1,
  },
  apply: {
    flex: 2,
  },
});
