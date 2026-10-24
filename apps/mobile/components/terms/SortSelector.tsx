import { ScrollView, StyleSheet } from 'react-native';
import type { SortDirection, SortType } from '@diki/core';
import Chip from '@/components/ui/Chip';

export const SORT_LABELS: Record<SortType, string> = {
  relevance: '관련도',
  updated: '수정일',
  difficulty: '난이도',
  created: '등록일',
};

const SORT_ORDER: SortType[] = ['relevance', 'updated', 'difficulty', 'created'];

const DIRECTION_LABELS: Record<SortDirection, string> = {
  desc: '내림차순',
  asc: '오름차순',
};

interface SortSelectorProps {
  sortType: SortType;
  sortDirection: SortDirection;
  hasQuery: boolean;
  onChange: (type: SortType, direction: SortDirection) => void;
}

export default function SortSelector({ sortType, sortDirection, hasQuery, onChange }: SortSelectorProps) {
  // 관련도는 검색어가 있을 때만 선택지로 보인다
  const types = hasQuery ? SORT_ORDER : SORT_ORDER.filter((type) => type !== 'relevance');
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      keyboardShouldPersistTaps={'handled'}
    >
      {types.map((type) => (
        <Chip
          key={type}
          label={SORT_LABELS[type]}
          selected={sortType === type}
          accessibilityLabel={`${ SORT_LABELS[type] } 순 정렬`}
          onPress={() => onChange(type, sortType === type ? sortDirection : 'desc')}
        />
      ))}
      <Chip
        label={sortDirection === 'desc' ? `${ DIRECTION_LABELS.desc } ↓` : `${ DIRECTION_LABELS.asc } ↑`}
        accessibilityLabel={`정렬 방향 바꾸기, 현재 ${ DIRECTION_LABELS[sortDirection] }`}
        onPress={() => onChange(sortType, sortDirection === 'desc' ? 'asc' : 'desc')}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 8,
    alignItems: 'center',
  },
});
