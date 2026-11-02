import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import type { NumberRange } from '@diki/core';
import DropdownChip from '@/components/ui/DropdownChip';
import ResetChip from '@/components/ui/ResetChip';
import { spacing } from '@/theme';
import DateSheet, { describeDates } from './DateSheet';
import RangeSheet from './RangeSheet';
import SortSheet from './SortSheet';
import { DIFFICULTY_LABELS } from './termPath';
import {
  DEFAULT_SORT,
  isFullRange,
  SORT_OPTIONS,
  type RelevanceKey,
  type SortOption,
  type TermListingFilterState,
} from './useTermListing';

export const RELEVANCE_LABELS = ['희박', '낮음', '보통', '높음', '밀접'];
const RELEVANCE_KEYS: RelevanceKey[] = ['DA', 'DS', 'DE'];

type SheetName = 'sort' | 'level' | 'relevance' | 'date';

const describeRange = (labels: string[], { min, max }: NumberRange) => (min === max ? labels[min - 1] : `${ labels[min - 1] }~${ labels[max - 1] }`);

interface FilterBarProps {
  sort: SortOption;
  hasQuery: boolean;
  onSort: (next: SortOption)=> void;
  filter: TermListingFilterState;
  onFilter: (next: TermListingFilterState)=> void;
  canReset: boolean;
  onReset: ()=> void;
}

export default function FilterBar({ sort, hasQuery, onSort, filter, onFilter, canReset, onReset }: FilterBarProps) {
  const [open, setOpen] = useState<SheetName | null>(null);
  const close = () => setOpen(null);
  const levelOn = !isFullRange(filter.level);
  const changedRoles = RELEVANCE_KEYS.filter((key) => !isFullRange(filter.relevance[key]));
  const dates = describeDates(filter.created);

  const relevanceLabel = changedRoles.length === 0
    ? '직무연관도'
    : changedRoles.length === 1
      ? `${ changedRoles[0] } ${ describeRange(RELEVANCE_LABELS, filter.relevance[changedRoles[0]]) }`
      : `직무연관도 ${ changedRoles.join('·') }`;

  return (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        keyboardShouldPersistTaps="handled"
      >
        <ResetChip
          disabled={!canReset}
          onPress={onReset}
        />
        <DropdownChip
          label={SORT_OPTIONS[sort].label}
          active={sort !== DEFAULT_SORT}
          accessibilityLabel={`정렬, ${ SORT_OPTIONS[sort].label }`}
          onPress={() => setOpen('sort')}
        />
        <DropdownChip
          label={levelOn ? describeRange(DIFFICULTY_LABELS, filter.level) : '난이도'}
          active={levelOn}
          accessibilityLabel={levelOn ? `난이도 필터, ${ describeRange(DIFFICULTY_LABELS, filter.level) }` : '난이도 필터'}
          onPress={() => setOpen('level')}
        />
        <DropdownChip
          label={relevanceLabel}
          active={changedRoles.length > 0}
          accessibilityLabel={`직무연관도 필터${ changedRoles.length ? `, ${ changedRoles.join(', ') } 적용 중` : '' }`}
          onPress={() => setOpen('relevance')}
        />
        <DropdownChip
          label={dates ?? '발행일'}
          active={!!dates}
          accessibilityLabel={dates ? `발행일 필터, ${ dates }` : '발행일 필터'}
          onPress={() => setOpen('date')}
        />
      </ScrollView>

      <SortSheet
        visible={open === 'sort'}
        value={sort}
        hasQuery={hasQuery}
        onSelect={onSort}
        onClose={close}
      />
      <RangeSheet
        visible={open === 'level'}
        title="난이도"
        rows={[{ key: 'LEVEL', labels: DIFFICULTY_LABELS }]}
        value={{ LEVEL: filter.level }}
        onClose={close}
        onApply={(next) => {
          onFilter({ ...filter, level: next.LEVEL });
          close();
        }}
      />
      <RangeSheet
        visible={open === 'relevance'}
        title="직무연관도"
        rows={RELEVANCE_KEYS.map((key) => ({ key, label: key, labels: RELEVANCE_LABELS }))}
        value={filter.relevance}
        onClose={close}
        onApply={(next) => {
          onFilter({ ...filter, relevance: { DA: next.DA, DS: next.DS, DE: next.DE } });
          close();
        }}
      />
      <DateSheet
        visible={open === 'date'}
        value={filter.created}
        onClose={close}
        onApply={(next) => {
          onFilter({ ...filter, created: next });
          close();
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.gutter,
  },
});
