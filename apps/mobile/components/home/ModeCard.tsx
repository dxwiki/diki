import { Pressable, StyleSheet, View } from 'react-native';
import Icon, { type IconName } from '@/components/ui/Icon';
import Text from '@/components/ui/Text';
import { font, hairline, radius, spacing, tint, useThemeColors } from '@/theme';

interface ModeCardProps {
  icon: IconName;
  tone: string;
  label: string;
  description: string;
  status?: string;
  onPress: ()=> void;
}

// 홈 바로가기 행: 아이콘 배지 + 제목·설명 + 진행 상태, 아래 줄로 구분
export default function ModeCard({ icon, tone, label, description, status, onPress }: ModeCardProps) {
  const colors = useThemeColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={[label, description, status].filter(Boolean).join('. ')}
      onPress={onPress}
      style={({ pressed }) => [styles.row, { borderBottomColor: colors.line }, pressed && { backgroundColor: colors['extreme-light'] }]}
    >
      <View style={[styles.badge, { backgroundColor: tint(tone, '26') }]}>
        <Icon
          name={icon}
          color={tone}
          size={20}
        />
      </View>
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.label}>{label}</Text>
          {status ? <Text style={[styles.status, { color: tone }]}>{status}</Text> : null}
        </View>
        <Text
          numberOfLines={2}
          style={[styles.description, { color: colors.gray1 }]}
        >
          {description}
        </Text>
      </View>
      <Icon
        name="chevronRight"
        color={colors.gray3}
        size={13}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md + 2,
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.gutter,
    borderBottomWidth: hairline,
  },
  badge: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    gap: spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  label: {
    fontSize: font.headline,
    fontWeight: '700',
  },
  status: {
    fontSize: font.footnote,
    fontWeight: '600',
  },
  description: {
    fontSize: font.subhead,
    lineHeight: 20,
  },
});
