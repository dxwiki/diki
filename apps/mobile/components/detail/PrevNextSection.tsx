import { Pressable, StyleSheet, View } from 'react-native';
import type { TermData } from '@diki/core';
import Text from '@/components/ui/Text';
import { useThemeColors } from '@/theme';

interface PrevNextSectionProps {
  prev: TermData | null;
  next: TermData | null;
  onPressTerm: (term: TermData)=> void;
}

interface PrevNextCardProps {
  label: string;
  term: TermData;
  align: 'flex-start' | 'flex-end';
  onPress: (term: TermData)=> void;
}

function PrevNextCard({ label, term, align, onPress }: PrevNextCardProps) {
  const colors = useThemeColors();
  const title = term.title?.ko ?? term.title?.en ?? '';
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`${ label } ${ title }`}
      onPress={() => onPress(term)}
      style={({ pressed }) => [styles.card, { borderColor: colors.border, alignItems: align }, pressed && styles.pressed]}
    >
      <Text style={[styles.label, { color: colors.primary }]}>{label}</Text>
      <Text
        style={[styles.title, { textAlign: align === 'flex-end' ? 'right' : 'left' }]}
        numberOfLines={2}
      >
        {title}
      </Text>
      {term.title?.en ? (
        <Text
          variant="caption"
          numberOfLines={1}
        >
          {`(${ term.title.en })`}
        </Text>
      ) : null}
    </Pressable>
  );
}

export default function PrevNextSection({ prev, next, onPressTerm }: PrevNextSectionProps) {
  return (
    <View style={styles.row}>
      {prev ? (
        <PrevNextCard
          label="이전 포스트"
          term={prev}
          align="flex-start"
          onPress={onPressTerm}
        />
      ) : <View style={styles.spacer} />}
      {next ? (
        <PrevNextCard
          label="다음 포스트"
          term={next}
          align="flex-end"
          onPress={onPressTerm}
        />
      ) : <View style={styles.spacer} />}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  card: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    gap: 2,
  },
  spacer: {
    flex: 1,
  },
  label: {
    fontSize: 13,
  },
  title: {
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.6,
  },
});
