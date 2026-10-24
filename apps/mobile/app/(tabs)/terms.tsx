import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View, type TextInputInstance } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import type { TermData } from '@diki/core';
import EmptyResult from '@/components/terms/EmptyResult';
import FilterSheet from '@/components/terms/FilterSheet';
import RecentTerms from '@/components/terms/RecentTerms';
import SearchBar from '@/components/terms/SearchBar';
import SortSelector from '@/components/terms/SortSelector';
import TermListItem from '@/components/terms/TermListItem';
import { termKey } from '@/components/terms/termPath';
import { useOpenTerm } from '@/components/terms/useOpenTerm';
import { useTermListing } from '@/components/terms/useTermListing';
import Text from '@/components/ui/Text';
import { useContent } from '@/lib/content';
import { useRecentTerms } from '@/lib/recent';
import { useThemeColors } from '@/theme';

export default function TermsScreen() {
  const colors = useThemeColors();
  const { terms } = useContent();
  const { recentTerms } = useRecentTerms();
  const listing = useTermListing(terms);
  const openTerm = useOpenTerm();
  const [filterOpen, setFilterOpen] = useState(false);
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
    <View style={styles.listHeader}>
      {!listing.hasQuery ? (
        <RecentTerms
          terms={recentTerms}
          onPress={openTerm}
        />
      ) : null}
      <Text variant="caption">{`${ listing.results.length }개 용어`}</Text>
    </View>
  );

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.controls, { borderBottomColor: colors['extreme-light'] }]}>
        <SearchBar
          value={listing.input}
          onChangeText={listing.setInput}
          inputRef={inputRef}
        />
        <View style={styles.controlRow}>
          <View style={styles.sort}>
            <SortSelector
              sortType={listing.sortType}
              sortDirection={listing.sortDirection}
              hasQuery={listing.hasQuery}
              onChange={listing.changeSort}
            />
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={listing.filterActive ? '필터 열기, 적용 중' : '필터 열기'}
            onPress={() => setFilterOpen(true)}
            style={({ pressed }) => [
              styles.filterButton,
              listing.filterActive
                ? { backgroundColor: colors.primary, borderColor: colors.primary }
                : { borderColor: colors.border },
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.filterLabel, { color: listing.filterActive ? colors.background : colors.text }]}>
              {listing.filterActive ? '필터 적용' : '필터'}
            </Text>
          </Pressable>
        </View>
      </View>
      <FlatList
        data={listing.results}
        keyExtractor={termKey}
        renderItem={renderItem}
        ListHeaderComponent={header}
        ListEmptyComponent={<EmptyResult onReset={listing.reset} />}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        initialNumToRender={20}
      />
      <FilterSheet
        visible={filterOpen}
        value={listing.filterState}
        onClose={() => setFilterOpen(false)}
        onApply={(next) => {
          listing.setFilterState(next);
          setFilterOpen(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  controls: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    gap: 10,
    borderBottomWidth: 1,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sort: {
    flex: 1,
  },
  filterButton: {
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  filterLabel: {
    fontSize: 14,
  },
  pressed: {
    opacity: 0.7,
  },
  listHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
    gap: 12,
  },
});
