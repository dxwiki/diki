import { Text as RNText, type TextProps as RNTextProps } from 'react-native';
import { useThemeColors } from '@/theme';

type Variant = 'title' | 'body' | 'caption';

interface TextProps extends RNTextProps {
  variant?: Variant;
}

const variantStyles = {
  title: { fontSize: 22, fontWeight: '700' as const },
  body: { fontSize: 16, lineHeight: 24 },
  caption: { fontSize: 13, lineHeight: 18 },
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
