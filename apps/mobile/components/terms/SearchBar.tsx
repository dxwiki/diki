import type { Ref } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputInstance } from 'react-native';
import { useThemeColors } from '@/theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string)=> void;
  inputRef?: Ref<TextInputInstance>;
}

export default function SearchBar({ value, onChangeText, inputRef }: SearchBarProps) {
  const colors = useThemeColors();
  return (
    <View style={[styles.box, { backgroundColor: colors['background-secondary'], borderColor: colors['extreme-light'] }]}>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChangeText}
        placeholder="용어 검색 (한글·영문)"
        placeholderTextColor={colors.gray2}
        selectionColor={colors.primary}
        style={[styles.input, { color: colors.text }]}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="never"
        accessibilityLabel="용어 검색"
      />
      {value.length > 0 ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="검색어 지우기"
          hitSlop={8}
          onPress={() => onChangeText('')}
        >
          <Text style={[styles.clear, { color: colors.gray2 }]}>{'지우기'}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 10,
  },
  clear: {
    fontSize: 13,
  },
});
