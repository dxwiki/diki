import { Children, Fragment, type ReactNode } from 'react';
import { ScrollView } from 'react-native';
import { spacing, useThemeColors } from '@/theme';
import SectionDivider from './SectionDivider';

interface ScreenProps {
  children: ReactNode;
  bleed?: boolean;
  divided?: boolean;
}

// bleed 이면 좌우 여백 없이 목록이 화면 끝까지 닿고, divided 이면 자식 사이에 띠만 넣는다 (여백은 각 섹션이 가진다)
export default function Screen({ children, bleed = false, divided = false }: ScreenProps) {
  const colors = useThemeColors();
  const items = Children.toArray(children);
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{
        paddingHorizontal: bleed ? 0 : spacing.gutter,
        paddingTop: divided ? 0 : spacing.gutter,
        paddingBottom: spacing.section * 1.5,
        gap: divided ? 0 : spacing.lg,
      }}
    >
      {divided
        ? items.map((child, i) => (
          <Fragment key={i}>
            {i > 0 ? <SectionDivider inset={!bleed} /> : null}
            {child}
          </Fragment>
        ))
        : children}
    </ScrollView>
  );
}
