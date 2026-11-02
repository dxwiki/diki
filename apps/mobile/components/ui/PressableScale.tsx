import { useState, type ReactNode } from 'react';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { CSS_EASE_OUT } from '@/theme/motion';

interface PressableScaleProps extends Omit<PressableProps, 'style' | 'children'> {
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}

// 누르는 순간 3% 줄었다가 돌아오는 버튼형 눌림 (목록 행은 배경 강조를 쓴다)
export default function PressableScale({ style, children, onPressIn, onPressOut, ...rest }: PressableScaleProps) {
  const [pressed, setPressed] = useState(false);
  return (
    <Pressable
      pressRetentionOffset={16}
      onPressIn={(e) => {
        setPressed(true);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        setPressed(false);
        onPressOut?.(e);
      }}
      {...rest}
    >
      <Animated.View
        style={[
          style,
          {
            transform: [{ scale: pressed ? 0.97 : 1 }],
            transitionProperty: 'transform',
            transitionDuration: '120ms',
            transitionTimingFunction: CSS_EASE_OUT,
          },
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}
