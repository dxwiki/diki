import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type { TermData } from '@diki/core';
import Icon from '@/components/ui/Icon';
import Text from '@/components/ui/Text';
import { font, hairline, spacing, useThemeColors } from '@/theme';
import { difficultyLabel } from './termPath';

const pad = (n: number) => String(n).padStart(2, '0');

// 발행일(created_at)을 'YYYY년 MM월 DD일' 로 쓴다
const formatPublished = (value?: string): string => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${ date.getFullYear() }년 ${ pad(date.getMonth() + 1) }월 ${ pad(date.getDate()) }일`;
};

interface TermListItemProps {
  term: TermData;
  onPress: (term: TermData)=> void;
}

// 한글 제목 · 영문 제목 / 발행일 · 난이도 / 설명 한 줄, 아래 줄로 구분
function TermListItem({ term, onPress }: TermListItemProps) {
  const colors = useThemeColors();
  const level = difficultyLabel(term.difficulty?.level);
  const title = term.title?.ko ?? term.title?.en ?? '';
  const en = term.title?.en && term.title.en !== title ? term.title.en : '';
  const published = formatPublished(term.metadata?.created_at);
  const meta = [published, level].filter(Boolean).join(' · ');
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={[title, en, published && `발행일 ${ published }`, level].filter(Boolean).join(', ')}
      onPress={() => onPress(term)}
      style={({ pressed }) => [styles.row, { borderBottomColor: colors.line }, pressed && { backgroundColor: colors['extreme-light'] }]}
    >
      <View style={styles.body}>
        <Text
          numberOfLines={1}
          style={[styles.title, { color: colors.primary }]}
        >
          {title}
          {en ? <Text style={[styles.en, { color: colors.gray1 }]}>{` · ${ en }`}</Text> : null}
        </Text>
        {meta ? (
          <Text
            variant="caption"
            numberOfLines={1}
          >
            {meta}
          </Text>
        ) : null}
        {term.description?.short ? (
          <Text
            numberOfLines={1}
            style={[styles.description, { color: colors['text-secondary'] }]}
          >
            {term.description.short}
          </Text>
        ) : null}
      </View>
      <Icon
        name="chevronRight"
        color={colors.gray3}
        size={14}
      />
    </Pressable>
  );
}

export default memo(TermListItem);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.gutter,
    borderBottomWidth: hairline,
  },
  body: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    fontSize: font.headline,
    fontWeight: '600',
  },
  en: {
    fontSize: font.body,
    fontWeight: '400',
  },
  description: {
    fontSize: font.subhead,
    lineHeight: 20,
  },
});
