import type { ComponentProps } from 'react';
import { SymbolView } from 'expo-symbols';

type SymbolName = ComponentProps<typeof SymbolView>['name'];

// iOS 는 SF Symbols, Android 는 Material Symbols 이름
const ICONS = {
  lock: { ios: 'lock.fill', android: 'lock' },
  check: { ios: 'checkmark', android: 'check' },
  close: { ios: 'xmark', android: 'close' },
  clear: { ios: 'xmark.circle.fill', android: 'cancel' },
  replay: { ios: 'arrow.counterclockwise', android: 'replay' },
  clock: { ios: 'clock', android: 'schedule' },
  search: { ios: 'magnifyingglass', android: 'search' },
  chevronLeft: { ios: 'chevron.left', android: 'chevron_left' },
  chevronRight: { ios: 'chevron.right', android: 'chevron_right' },
  chevronDown: { ios: 'chevron.down', android: 'expand_more' },
  learn: { ios: 'book.fill', android: 'menu_book' },
  interview: { ios: 'bubble.left.and.bubble.right.fill', android: 'forum' },
  dictionary: { ios: 'magnifyingglass', android: 'search' },
  external: { ios: 'arrow.up.right', android: 'open_in_new' },
  sort: { ios: 'arrow.up.arrow.down', android: 'swap_vert' },
  filter: { ios: 'line.3.horizontal.decrease', android: 'filter_list' },
  trash: { ios: 'trash', android: 'delete' },
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
