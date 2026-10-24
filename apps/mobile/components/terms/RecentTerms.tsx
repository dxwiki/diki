import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import type { TermData } from '@diki/core';
import Text from '@/components/ui/Text';
import { useThemeColors } from '@/theme';
import { termKey } from './termPath';

interface RecentTermsProps {
  terms: TermData[];
  onPress: (term: TermData)=> void;
  emptyText?: string;
}

export default function RecentTerms({ terms, onPress, emptyText }: RecentTermsProps) {
  const colors = useThemeColors();
  if (terms.length === 0 && !emptyText) return null;
  return (
    <View style={styles.wrap}>
      <Text style={styles.heading}>{'최근 본 용어'}</Text>
      {terms.length === 0 ? (
        <Text variant="caption">{emptyText}</Text>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.row}
          keyboardShouldPersistTaps="handled"
        >
          {terms.map((term, index) => (
            <Pressable
              key={termKey(term, index)}
              accessibilityRole="button"
              onPress={() => onPress(term)}
              style={({ pressed }) => [
                styles.card,
                { backgroundColor: colors['background-secondary'], borderColor: colors['extreme-light'] },
                pressed && styles.pressed,
              ]}
            >
              <Text
                numberOfLines={1}
                style={styles.title}
              >
                {term.title?.ko ?? term.title?.en ?? ''}
              </Text>
              {term.title?.en ? (
                <Text
                  variant="caption"
                  numberOfLines={1}
                >
                  {term.title.en}
                </Text>
              ) : null}
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  heading: {
    fontSize: 15,
    fontWeight: '600',
  },
  row: {
    gap: 8,
  },
  card: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    maxWidth: 200,
    gap: 2,
  },
  pressed: {
    opacity: 0.7,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
  },
});
