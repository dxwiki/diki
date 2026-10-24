import { TermData, SortType, SortDirection } from '../../src/types';
import { searchTerms } from './search';

// 원본: src/components/posts/PostList.tsx 의 필터 useEffect 본문과 정렬 (분리 전 동결 사본, dispatch 는 반환값으로 대체)
export function legacyFilterTerms(terms: TermData[], searchParams: { get(name: string): string | null }) {
  let sortTypeOverride: SortType | null = null;
    let filteredTerms = [...terms];

    // 검색어 필터링
    const query = searchParams.get('q');
    if (query) {
      filteredTerms = searchTerms(query, filteredTerms);
      sortTypeOverride = 'relevance';
    }

    // 복합 필터링 (난이도/직무 연관도)
    const filterParam = searchParams.get('f');
    if (filterParam) {
      const filters = filterParam.split('_').reduce((acc, curr) => {
        const [key, min, max] = curr.split('-');
        // scale 1~5로 변경
        return { ...acc, [key.toUpperCase()]: { min: Number(min) + 1, max: Number(max) + 1 } };
      }, {} as Record<string, { min: number; max: number }>);

      filteredTerms = filteredTerms.filter((term) => {
        // 난이도 필터링
        if ('LEVEL' in filters) {
          const level = term.difficulty?.level;
          if (level === undefined) return false;
          if (level < filters.LEVEL.min || level > filters.LEVEL.max) return false;
        }

        if ('DS' in filters) {
          const score = term.relevance?.scientist?.score;
          if (score === undefined) return false;
          if (score < filters.DS.min || score > filters.DS.max) return false;
        }

        if ('DE' in filters) {
          const score = term.relevance?.engineer?.score;
          if (score === undefined) return false;
          if (score < filters.DE.min || score > filters.DE.max) return false;
        }

        if ('DA' in filters) {
          const score = term.relevance?.analyst?.score;
          if (score === undefined) return false;
          if (score < filters.DA.min || score > filters.DA.max) return false;
        }

        return true;
      });
    }

    // 날짜 필터링
    const parseDateStr = (dateStr: string) => {
      if (dateStr === '') return null;
      const year = dateStr.slice(0, 4);
      const month = dateStr.slice(4, 6);
      const day = dateStr.slice(6, 8);
      return new Date(`${ year }-${ month }-${ day }`);
    };

    const filterByDate = (dateParam: string | null, dateField: 'created_at' | 'updated_at') => {
      if (!dateParam) return;
      const [start, end] = dateParam.split('-').map((d) => d ? parseDateStr(d) : null);
      if (!start) return;

      filteredTerms = filteredTerms.filter((term) => {
        const termDate = term.metadata?.[dateField];
        if (!termDate) return false;

        const termDateTime = new Date(termDate).getTime();

        if (!end) {
          // 시작일만 있는 경우: 해당 날짜에만 해당하는 항목 필터링
          const startDate = new Date(start);
          const nextDay = new Date(start);
          nextDay.setDate(nextDay.getDate() + 1);

          return termDateTime >= startDate.getTime() && termDateTime < nextDay.getTime();
        } else {
          // 시작일과 종료일이 모두 있는 경우: 범위 내 항목 필터링
          const startTime = start.getTime();
          const endTime = end.getTime();
          return termDateTime >= startTime && termDateTime <= endTime;
        }
      });
    };

    filterByDate(searchParams.get('p'), 'created_at'); // 발행일
    filterByDate(searchParams.get('m'), 'updated_at'); // 수정일

    return { filteredTerms, sortTypeOverride };
}

export function legacySortTerms(termsData: TermData[], sortType: SortType, sortDirection: SortDirection) {
  const sortedTermsData = [...termsData].sort((a, b) => {
    const multiplier = sortDirection === 'asc' ? 1 : -1;

    switch (sortType) {
      case 'difficulty': {
        const difficultyCompare = multiplier * ((a.difficulty?.level || 0) - (b.difficulty?.level || 0));
        return difficultyCompare === 0 ? multiplier * ((a.id || 0) - (b.id || 0)) : difficultyCompare;
      }
      case 'updated': {
        const dateCompare = multiplier * ((new Date(a.metadata?.updated_at || 0)).getTime()
                           - (new Date(b.metadata?.updated_at || 0)).getTime());
        return dateCompare === 0 ? multiplier * ((a.id || 0) - (b.id || 0)) : dateCompare;
      }
      case 'created': {
        const dateCompare = multiplier * ((new Date(a.metadata?.created_at || 0)).getTime()
                           - (new Date(b.metadata?.created_at || 0)).getTime());
        return dateCompare === 0 ? multiplier * ((a.id || 0) - (b.id || 0)) : dateCompare;
      }
      default:
        return 0;
    }
  });

  return sortedTermsData;
}
