import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, Keyboard, Pressable, StyleSheet, View, type TextInputInstance } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import type { TermData } from '@diki/core';
import EmptyResult from '@/components/terms/EmptyResult';
import FilterBar from '@/components/terms/FilterBar';
import RecentSearches from '@/components/terms/RecentSearches';
import SearchBar from '@/components/terms/SearchBar';
import TermListItem from '@/components/terms/TermListItem';
import { termKey } from '@/components/terms/termPath';
import { useOpenTerm } from '@/components/terms/useOpenTerm';
import { useTermListing } from '@/components/terms/useTermListing';
import Text from '@/components/ui/Text';
import { useContent } from '@/lib/content';
import { useRecentSearches } from '@/lib/recent';
import { font, hairline, spacing, useThemeColors } from '@/theme';

export default function TermsScreen() {
  const colors = useThemeColors();
  const { terms } = useContent();
  const recentSearches = useRecentSearches();
  const [focused, setFocused] = useState(false);
  const listing = useTermListing(terms);
  const openTermPage = useOpenTerm();
  const { add: addSearch } = recentSearches;
  // 검색 결과에서 용어를 열면 그 검색어를 최근 검색에 남긴다
  const openTerm = useCallback((term: TermData) => {
    if (listing.hasQuery) addSearch(listing.query);
    openTermPage(term);
  }, [listing.hasQuery, listing.query, addSearch, openTermPage]);

  const clearInput = () => {
    listing.setInput('');
    const input = inputRef.current;
    if (!input) return;
    // Android 는 이미 포커스된 입력칸에 focus() 를 다시 걸면 키보드가 열리지 않아 한 번 풀었다 건다
    if (process.env.EXPO_OS === 'android' && input.isFocused()) {
      input.blur();
      setTimeout(() => input.focus(), 50);
      return;
    }
    input.focus();
  };

  const pickSearch = (query: string) => {
    listing.setInput(query);
    addSearch(query);
    Keyboard.dismiss();
  };
  const inputRef = useRef<TextInputInstance>(null);
  const { focus } = useLocalSearchParams<{ focus?: string }>();

  // 홈의 검색 진입에서 오면 검색창에 포커스한다
  useEffect(() => {
    if (!focus) return;
    const timer = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, [focus]);

  const renderItem = useCallback(({ item }: { item: TermData }) => (
    <TermListItem
      term={item}
      onPress={openTerm}
    />
  ), [openTerm]);

  const header = (
    <View style={[styles.listHeader, { borderBottomColor: colors.line }]}>
      <Text
        variant="caption"
        style={styles.count}
        accessibilityLabel={`검색결과 ${ listing.results.length }개, 전체 ${ terms.length }개`}
      >
        {'검색결과 '}
        <Text style={[styles.countValue, { color: colors.primary }]}>{String(listing.results.length)}</Text>
        {` / ${ terms.length } 개`}
      </Text>
    </View>
  );

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.controls, { borderBottomColor: colors.line }]}>
        <View style={styles.search}>
          <SearchBar
            value={listing.input}
            onChangeText={listing.setInput}
            onClear={clearInput}
            inputRef={inputRef}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onSubmit={() => addSearch(listing.input)}
          />
          {focused ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="검색 닫기"
              hitSlop={8}
              onPress={() => {
                listing.setInput('');
                inputRef.current?.blur();
                Keyboard.dismiss();
              }}
              style={({ pressed }) => pressed && styles.pressed}
            >
              <Text style={[styles.close, { color: colors.primary }]}>{'닫기'}</Text>
            </Pressable>
          ) : null}
        </View>
        <FilterBar
          sort={listing.sort}
          hasQuery={listing.hasQuery}
          onSort={listing.changeSort}
          filter={listing.filterState}
          onFilter={listing.setFilterState}
          canReset={listing.filtered}
          onReset={listing.resetFilters}
        />
      </View>
      {focused && listing.input.trim() === '' ? (
        <RecentSearches
          items={recentSearches.items}
          onSelect={pickSearch}
          onRemove={recentSearches.remove}
          onClear={recentSearches.clear}
        />
      ) : (
        <FlatList
          data={listing.results}
          keyExtractor={termKey}
          renderItem={renderItem}
          ListHeaderComponent={header}
          ListEmptyComponent={<EmptyResult onReset={listing.reset} />}
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          initialNumToRender={20}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  count: {
    paddingHorizontal: spacing.gutter,
  },
  countValue: {
    fontSize: font.body,
    fontWeight: '700',
  },
  screen: {
    flex: 1,
  },
  controls: {
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.md,
    borderBottomWidth: hairline,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.gutter,
  },
  close: {
    fontSize: font.callout,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.6,
  },
  listHeader: {
    paddingVertical: spacing.md,
    gap: spacing.lg,
    borderBottomWidth: hairline,
  },
});
