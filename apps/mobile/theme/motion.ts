import { cubicBezier, Easing } from 'react-native-reanimated';

// 화면 요소 움직임은 강한 ease-out, 화면 위 이동은 ease-in-out, 시트는 iOS 시트 곡선
export const CSS_EASE_OUT = cubicBezier(0.23, 1, 0.32, 1);
export const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);
export const EASE_IN_OUT = Easing.bezier(0.77, 0, 0.175, 1);
export const EASE_SHEET = Easing.bezier(0.32, 0.72, 0, 1);

export const SPRING_SNAP = { duration: 400, dampingRatio: 0.8 } as const;
export const SPRING_SHEET = { duration: 300, dampingRatio: 0.8 } as const;

export function rubberband(overshoot: number, dimension: number, constant = 0.55): number {
  'worklet';
  return (overshoot * dimension * constant) / (dimension + (constant * Math.abs(overshoot)));
}

export function project(velocity: number, decelerationRate = 0.998): number {
  'worklet';
  return ((velocity / 1000) * decelerationRate) / (1 - decelerationRate);
}
