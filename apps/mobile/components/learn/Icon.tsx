import type { ComponentProps } from 'react';
import { SymbolView } from 'expo-symbols';

type SymbolName = ComponentProps<typeof SymbolView>['name'];

const ICONS = {
  lock: { ios: 'lock.fill', android: 'lock' },
  check: { ios: 'checkmark', android: 'check' },
  close: { ios: 'xmark', android: 'close' },
  replay: { ios: 'arrow.counterclockwise', android: 'replay' },
} satisfies Record<string, SymbolName>;

export type IconName = keyof typeof ICONS;

export default function Icon({ name, color, size = 16 }: { name: IconName; color: string; size?: number }) {
  return (
    <SymbolView
      name={ICONS[name]}
      tintColor={color}
      size={size}
    />
  );
}
