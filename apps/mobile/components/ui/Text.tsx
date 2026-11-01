import { Text as RNText, type TextProps as RNTextProps } from 'react-native';
import { font, useThemeColors } from '@/theme';

type Variant = 'title' | 'body' | 'caption';

interface TextProps extends RNTextProps {
  variant?: Variant;
}

const variantStyles = {
  title: { fontSize: font.title2, fontWeight: '700' as const },
  body: { fontSize: font.callout, lineHeight: 24 },
  caption: { fontSize: font.footnote, lineHeight: 18 },
};

export default function Text({ variant = 'body', style, ...rest }: TextProps) {
  const colors = useThemeColors();
  const color = variant === 'caption' ? colors.gray1 : colors.text;
  return (
    <RNText
      style={[variantStyles[variant], { color }, style]}
      {...rest}
    />
  );
}
