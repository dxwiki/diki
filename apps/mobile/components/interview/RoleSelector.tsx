import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import * as Haptics from 'expo-haptics';
import type { RoleSummary } from '@diki/core';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import Text from '@/components/ui/Text';
import { elevation, font, radius, spacing, useThemeColors } from '@/theme';
import { EASE_IN_OUT } from '@/theme/motion';

interface RoleSelectorProps {
  roles: RoleSummary[];
  selectedId: string;
  onSelect: (id: RoleSummary['id'])=> void;
}

const PAD = 3;

// 세그먼트 컨트롤: 선택 표시가 면 색 트랙 위를 미끄러져 옮겨 간다
export default function RoleSelector({ roles, selectedId, onSelect }: RoleSelectorProps) {
  const colors = useThemeColors();
  const reduced = useReducedMotion();
  const [segment, setSegment] = useState(0);
  const index = Math.max(0, roles.findIndex((role) => role.id === selectedId));
  const x = useSharedValue(0);

  useEffect(() => {
    if (!segment) return;
    const to = index * segment;
    x.set(reduced ? to : withTiming(to, { duration: 250, easing: EASE_IN_OUT }));
  }, [index, segment, reduced, x]);

  const onLayout = (e: LayoutChangeEvent) => {
    const next = (e.nativeEvent.layout.width - (PAD * 2)) / Math.max(roles.length, 1);
    x.set(index * next);
    setSegment(next);
  };

  const pillStyle = useAnimatedStyle(() => ({ transform: [{ translateX: x.get() }] }));

  return (
    <View
      accessibilityRole="tablist"
      onLayout={onLayout}
      style={[styles.track, { backgroundColor: colors['extreme-light'] }]}
    >
      {segment ? (
        <Animated.View
          pointerEvents="none"
          style={[styles.pill, { width: segment, backgroundColor: colors.raised }, pillStyle]}
        />
      ) : null}
      {roles.map((role) => {
        const selected = role.id === selectedId;
        return (
          <Pressable
            key={role.id}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={role.fullLabel}
            onPress={() => {
              if (selected) return;
              void Haptics.selectionAsync();
              onSelect(role.id);
            }}
            style={styles.item}
          >
            <Text style={[styles.label, { color: selected ? colors.primary : colors.gray1 }]}>{role.label}</Text>
            <Text
              numberOfLines={1}
              style={[styles.full, { color: selected ? colors.text : colors.gray2 }]}
            >
              {role.fullLabel}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    marginHorizontal: spacing.gutter,
    padding: PAD,
    borderRadius: radius.md,
    borderCurve: 'continuous',
  },
  pill: {
    position: 'absolute',
    top: PAD,
    bottom: PAD,
    left: PAD,
    borderRadius: radius.md - PAD,
    borderCurve: 'continuous',
    boxShadow: elevation.raised,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    gap: spacing.xxs,
  },
  label: {
    fontSize: font.callout,
    fontWeight: '800',
  },
  full: {
    fontSize: font.caption,
  },
});
