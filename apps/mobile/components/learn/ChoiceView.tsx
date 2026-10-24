import { Pressable, StyleSheet, View } from 'react-native';
import type { LessonChoice } from '@diki/core';
import Text from '@/components/ui/Text';
import { useThemeColors } from '@/theme';
import Icon from './Icon';
import QuestionHeader from './QuestionHeader';

const OPTION_KEYS = ['A', 'B', 'C', 'D'];

interface ChoiceViewProps {
  question: LessonChoice;
  selected: string | null;
  checked: boolean;
  onSelect: (slug: string)=> void;
}

export default function ChoiceView({ question, selected, checked, onSelect }: ChoiceViewProps) {
  const colors = useThemeColors();
  return (
    <View style={styles.wrap}>
      <QuestionHeader
        tag={question.tag}
        prompt={question.prompt}
      />
      {question.context ? (
        <View style={[styles.context, { backgroundColor: colors['extreme-light'] }]}>
          <Text style={[styles.contextText, { color: colors['text-secondary'] }]}>{question.context}</Text>
        </View>
      ) : null}
      <View
        accessibilityRole="radiogroup"
        style={styles.options}
      >
        {question.options.map((option, i) => {
          const isSelected = selected === option.slug;
          const isAnswer = option.slug === question.answer;
          const borderColor = checked
            ? isAnswer ? colors['level-2'] : isSelected ? colors['level-5'] : 'transparent'
            : isSelected ? colors.primary : 'transparent';
          return (
            <Pressable
              key={option.slug}
              accessibilityRole="radio"
              accessibilityState={{ checked: isSelected, disabled: checked }}
              accessibilityLabel={`${ OPTION_KEYS[i] }. ${ option.text }${ checked && isAnswer ? ', 정답' : '' }`}
              disabled={checked}
              onPress={() => onSelect(option.slug)}
              style={({ pressed }) => [
                styles.option,
                { backgroundColor: colors['extreme-light'], borderColor },
                checked && !isAnswer && !isSelected && styles.dim,
                pressed && styles.pressed,
              ]}
            >
              <View style={[styles.key, { backgroundColor: colors.background }]}>
                <Text style={[styles.keyText, { color: isSelected ? colors.primary : colors.gray2 }]}>{OPTION_KEYS[i]}</Text>
              </View>
              <Text style={[styles.optionText, { color: colors['text-secondary'] }]}>{option.text}</Text>
              {checked && isAnswer ? <Icon name="check" color={colors['level-2']} /> : null}
              {checked && isSelected && !isAnswer ? <Icon name="close" color={colors['level-5']} /> : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 16,
  },
  context: {
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  contextText: {
    fontSize: 15,
    lineHeight: 24,
  },
  options: {
    gap: 10,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 14,
    borderWidth: 2,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  key: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyText: {
    fontSize: 13,
    fontWeight: '700',
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  dim: {
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.7,
  },
});
