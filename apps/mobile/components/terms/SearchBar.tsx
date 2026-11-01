import type { Ref } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputInstance } from 'react-native';
import Icon from '@/components/ui/Icon';
import { font, radius, spacing, useThemeColors } from '@/theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string)=> void;
  onClear: ()=> void;
  inputRef?: Ref<TextInputInstance>;
  placeholder?: string;
  onFocus?: ()=> void;
  onBlur?: ()=> void;
  onSubmit?: ()=> void;
}

// 테두리 없는 면 색 검색창, 오른쪽 동그란 X 로 검색어를 지운다
export default function SearchBar({ value, onChangeText, onClear, inputRef, placeholder = '용어 검색 (한글·영문)', onFocus, onBlur, onSubmit }: SearchBarProps) {
  const colors = useThemeColors();
  return (
    <View style={[styles.box, { backgroundColor: colors['extreme-light'] }]}>
      <Icon
        name="search"
        color={colors.gray1}
        size={17}
      />
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus}
        onBlur={onBlur}
        onSubmitEditing={onSubmit}
        placeholder={placeholder}
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
          hitSlop={10}
          onPress={onClear}
          style={({ pressed }) => [styles.clear, { backgroundColor: colors.line }, pressed && styles.pressed]}
        >
          <Icon
            name="close"
            color={colors.gray0}
            size={10}
          />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    borderCurve: 'continuous',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: font.callout,
    paddingVertical: spacing.sm,
  },
  clear: {
    width: 20,
    height: 20,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
});
