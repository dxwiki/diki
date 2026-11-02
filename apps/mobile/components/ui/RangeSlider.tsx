import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import * as Haptics from 'expo-haptics';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import Text from '@/components/ui/Text';
import { elevation, font, radius, useThemeColors } from '@/theme';
import { EASE_OUT, SPRING_SNAP } from '@/theme/motion';

interface RangeSliderProps {
  labels: string[];
  value: [number, number];
  onChange: (next: [number, number])=> void;
  accessibilityLabel: string;
}

const THUMB = 26;

// 손잡이는 손가락을 그대로 따라가고, 놓으면 가까운 단계로 붙는다 (값은 0부터 시작하는 단계 번호)
export default function RangeSlider({ labels, value, onChange, accessibilityLabel }: RangeSliderProps) {
  const colors = useThemeColors();
  const reduced = useReducedMotion();
  const steps = labels.length - 1;
  const [lo, hi] = value;
  const [width, setWidth] = useState(0);
  const dragging = useRef(false);

  const w = useSharedValue(0);
  const loX = useSharedValue(0);
  const hiX = useSharedValue(0);
  const active = useSharedValue<0 | 1>(0);
  const lastStep = useSharedValue(0);
  const grabbed = useSharedValue(0);
  const undecided = useSharedValue(false);

  // 바깥에서 값이 바뀌면 (초기화 등) 손잡이를 부드럽게 옮긴다
  useEffect(() => {
    w.set(width);
    if (dragging.current || width <= 0) return;
    const to = (step: number) => (reduced ? (step / steps) * width : withTiming((step / steps) * width, { duration: 200, easing: EASE_OUT }));
    loX.set(to(lo));
    hiX.set(to(hi));
  }, [lo, hi, width, steps, reduced, w, loX, hiX]);

  const setDragging = (on: boolean) => {
    dragging.current = on;
  };

  const commitStep = (thumb: 0 | 1, step: number) => {
    void Haptics.selectionAsync();
    onChange(thumb === 0 ? [step, Math.max(step, hi)] : [Math.min(step, lo), step]);
  };

  const pan = usePanGesture({
    minDistance: 0,
    onBegin: (e) => {
      'worklet';
      const x = e.x - (THUMB / 2);
      const nearLo = Math.abs(x - loX.get()) < Math.abs(x - hiX.get()) || (loX.get() === hiX.get() && x < loX.get());
      active.set(nearLo ? 0 : 1);
      undecided.set(loX.get() === hiX.get());
      lastStep.set(Math.round(((nearLo ? loX.get() : hiX.get()) / Math.max(w.get(), 1)) * steps));
      grabbed.set(withTiming(1, { duration: 120, easing: EASE_OUT }));
      scheduleOnRN(setDragging, true);
      // 트랙을 톡 누르면 그 단계로 정하고, 손을 떼는 순간 손잡이가 스프링으로 옮겨 간다
      const width = w.get();
      if (width <= 0) return;
      const other = nearLo ? hiX.get() : loX.get();
      const clamped = nearLo ? Math.min(Math.max(0, x), other) : Math.max(Math.min(width, x), other);
      const step = Math.round((clamped / width) * steps);
      if (step !== lastStep.get()) {
        lastStep.set(step);
        scheduleOnRN(commitStep, nearLo ? 0 : 1, step);
      }
    },
    onUpdate: (e) => {
      'worklet';
      const width = w.get();
      if (width <= 0) return;
      const x = Math.max(0, Math.min(width, e.x - (THUMB / 2)));
      // 겹친 채로 잡았으면 처음 움직이는 방향의 손잡이로 한 번만 정한다
      if (undecided.get() && x !== loX.get()) {
        active.set(x < loX.get() ? 0 : 1);
        undecided.set(false);
      }
      if (active.get() === 0) loX.set(Math.min(x, hiX.get()));
      else hiX.set(Math.max(x, loX.get()));
      const step = Math.round(((active.get() === 0 ? loX.get() : hiX.get()) / width) * steps);
      if (step !== lastStep.get()) {
        lastStep.set(step);
        scheduleOnRN(commitStep, active.get(), step);
      }
    },
    onFinalize: () => {
      'worklet';
      const width = w.get();
      const snap = (lastStep.get() / steps) * width;
      if (active.get() === 0) loX.set(withSpring(snap, SPRING_SNAP));
      else hiX.set(withSpring(snap, SPRING_SNAP));
      grabbed.set(withTiming(0, { duration: 160, easing: EASE_OUT }));
      scheduleOnRN(setDragging, false);
    },
  });

  const fillStyle = useAnimatedStyle(() => ({
    left: loX.get() + (THUMB / 2),
    width: hiX.get() - loX.get(),
  }));
  const loStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: loX.get() }, { scale: active.get() === 0 ? 1 + (grabbed.get() * 0.12) : 1 }],
  }));
  const hiStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: hiX.get() }, { scale: active.get() === 1 ? 1 + (grabbed.get() * 0.12) : 1 }],
  }));

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width - THUMB);

  return (
    <View
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ text: lo === hi ? labels[lo] : `${ labels[lo] }부터 ${ labels[hi] }까지` }}
      accessibilityHint="위아래로 밀어 최댓값을 바꿉니다"
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(e) => {
        if (e.nativeEvent.actionName === 'increment' && hi < steps) onChange([lo, hi + 1]);
        if (e.nativeEvent.actionName === 'decrement' && hi > lo) onChange([lo, hi - 1]);
      }}
    >
      <GestureDetector gesture={pan}>
        <View
          style={styles.touch}
          onLayout={onLayout}
        >
          <View
            pointerEvents="none"
            style={[styles.track, { backgroundColor: colors['extreme-light'] }]}
          />
          <Animated.View
            pointerEvents="none"
            style={[styles.fill, { backgroundColor: colors.primary }, fillStyle]}
          />
          {[loStyle, hiStyle].map((thumbStyle, i) => (
            <Animated.View
              key={i}
              pointerEvents="none"
              style={[styles.thumb, { backgroundColor: colors.background, borderColor: colors.primary }, thumbStyle]}
            />
          ))}
        </View>
      </GestureDetector>
      <View
        pointerEvents="none"
        style={styles.labels}
      >
        {labels.map((label, i) => {
          const on = i >= lo && i <= hi;
          return (
            <Text
              key={label}
              style={[styles.label, { color: on ? colors.accent : colors.gray2, fontWeight: on ? '600' : '400' }]}
            >
              {label}
            </Text>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  touch: {
    height: 44,
    justifyContent: 'center',
  },
  track: {
    position: 'absolute',
    left: THUMB / 2,
    right: THUMB / 2,
    height: 4,
    borderRadius: 2,
  },
  fill: {
    position: 'absolute',
    height: 4,
    borderRadius: 2,
  },
  thumb: {
    position: 'absolute',
    left: 0,
    width: THUMB,
    height: THUMB,
    borderRadius: radius.pill,
    borderWidth: 2,
    boxShadow: elevation.raised,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    width: THUMB + 16,
    // 라벨 칸을 양옆으로 넓혀 글자 중심을 손잡이 중심에 맞춘다
    marginHorizontal: -8,
    textAlign: 'center',
    fontSize: font.caption,
  },
});
