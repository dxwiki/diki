import { TermData, Title, Description, Difficulty, Terms, Relevance, Usecase, Tags, References } from '@/types/database';

// 변경 사항 타입 정의
export interface Change<T> {
  path: string;
  original: T | undefined;
  modified: T | undefined;
}

// 재귀적 객체 타입 정의
export type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[] ? RecursivePartial<U>[] :
    T[P] extends object ? RecursivePartial<T[P]> : T[P];
};

// 원본 데이터 타입 정의
export interface OriginalData extends Record<string, unknown> {
  title: RecursivePartial<Title>;
  description: RecursivePartial<Description>;
  difficulty: RecursivePartial<Difficulty>;
  terms: RecursivePartial<Terms>[];
  relevance: RecursivePartial<Relevance>;
  usecase: RecursivePartial<Usecase>;
  tags: RecursivePartial<Tags>[];
  references: RecursivePartial<References>;
}

/**
 * 두 객체 간의 변경 사항을 비교하는 함수
 * @param original 원본 객체
 * @param modified 수정된 객체
 * @param path 현재 경로 (재귀 호출에서 사용)
 * @returns 변경 사항 배열
 */
export function compareData<T extends Record<string, unknown>>(
  original: T,
  modified: T,
  path = ''
): Change<unknown>[] {
  // 기본 타입이거나 null/undefined인 경우
  if (original === modified) return [];
  if (original === null || modified === null || original === undefined || modified === undefined) {
    if (original === modified) return [];
    return [{ path, original, modified }];
  }

  // 배열인 경우
  if (Array.isArray(original) && Array.isArray(modified)) {
    // 배열 길이가 다르거나 내용이 완전히 다른 경우 전체 교체로 간주
    if (original.length !== modified.length || JSON.stringify(original) !== JSON.stringify(modified)) {
      return [{ path, original, modified }];
    }
    return [];
  }

  // 객체인 경우
  if (typeof original === 'object' && typeof modified === 'object') {
    const changes: Change<unknown>[] = [];

    // 모든 키 수집 (원본과 수정본 모두)
    const allKeys = Array.from(new Set([...Object.keys(original), ...Object.keys(modified)]));

    for (const key of allKeys) {
      // 특정 필드는 비교에서 제외 (metadata 등)
      if (key === 'metadata' && path === '') continue;

      const newPath = path ? `${ path }.${ key }` : key;

      // 키가 한쪽에만 있는 경우 - 필드가 추가되거나 삭제된 경우 발생 가능
      if (!(key in original)) {
        // key는 modified에는 있지만 original에는 없는 경우 (추가된 필드)
        const modifiedValue = modified[key];
        changes.push({ path: newPath, original: undefined, modified: modifiedValue });
        continue;
      }
      if (!(key in modified)) {
        // key는 original에는 있지만 modified에는 없는 경우 (삭제된 필드)
        const originalValue = original[key];
        changes.push({ path: newPath, original: originalValue, modified: undefined });
        continue;
      }

      // 재귀적으로 비교 (두 객체 모두에 키가 있는 경우)
      const originalValue = original[key];
      const modifiedValue = modified[key];

      // 객체인 경우에만 재귀 호출
      if (
        typeof originalValue === 'object' && originalValue !== null
        && typeof modifiedValue === 'object' && modifiedValue !== null
      ) {
        const nestedChanges = compareData(
          originalValue as Record<string, unknown>,
          modifiedValue as Record<string, unknown>,
          newPath
        );
        changes.push(...nestedChanges);
      } else if (originalValue !== modifiedValue) {
        // 기본 타입이고 값이 다른 경우
        changes.push({ path: newPath, original: originalValue, modified: modifiedValue });
      }
    }

    return changes;
  }

  // 기본 타입이 다른 경우
  if (original !== modified) {
    return [{ path, original, modified }];
  }

  return [];
}

/**
 * 변경 사항을 마크다운으로 포맷팅하는 함수
 * @param changes 변경 사항 배열
 * @returns 마크다운 형식의 변경 사항 요약
 */
export function formatChanges(changes: Change<unknown>[]): string {
  if (changes.length === 0) return '변경된 내용이 없습니다.';

  // 변경 사항을 섹션별로 그룹화
  const sections: Record<string, Change<unknown>[]> = {};

  changes.forEach((change) => {
    const mainSection = change.path.split('.')[0];
    if (!sections[mainSection]) sections[mainSection] = [];
    sections[mainSection].push(change);
  });

  let markdown = '';

  // 섹션별로 변경 사항 포맷팅
  for (const [section, sectionChanges] of Object.entries(sections)) {
    let sectionTitle = '';

    switch (section) {
      case 'title':
        sectionTitle = '제목';
        break;
      case 'description':
        sectionTitle = '설명';
        break;
      case 'difficulty':
        sectionTitle = '난이도';
        break;
      case 'terms':
        sectionTitle = '관련 용어';
        break;
      case 'relevance':
        sectionTitle = '직무 연관도';
        break;
      case 'usecase':
        sectionTitle = '사용 사례';
        break;
      case 'references':
        sectionTitle = '참고 자료';
        break;
      case 'tags':
        sectionTitle = '태그';
        break;
      default:
        sectionTitle = section;
    }

    markdown += `\n## ${ sectionTitle } 변경 사항\n`;

    sectionChanges.forEach((change) => {
      const subPath = change.path.split('.').slice(1).join('.');
      const fieldName = subPath || '전체';

      markdown += `### ${ fieldName }\n`;

      // 원본 값 표시
      markdown += '**변경 전:**\n';
      if (change.original === undefined) {
        markdown += '없음\n\n';
      } else if (typeof change.original === 'object' && change.original !== null) {
        markdown += '```json\n' + JSON.stringify(change.original, null, 2) + '\n```\n\n';
      } else {
        markdown += `${ String(change.original) }\n\n`;
      }

      // 수정된 값 표시
      markdown += '**변경 후:**\n';
      if (change.modified === undefined) {
        markdown += '삭제됨\n\n';
      } else if (typeof change.modified === 'object' && change.modified !== null) {
        markdown += '```json\n' + JSON.stringify(change.modified, null, 2) + '\n```\n\n';
      } else {
        markdown += `${ String(change.modified) }\n\n`;
      }
    });
  }

  return markdown;
}

/**
 * 원본 데이터와 수정된 데이터를 비교하여 변경 사항을 마크다운으로 포맷팅하는 함수
 * @param originalData 원본 데이터
 * @param modifiedData 수정된 데이터
 * @returns 마크다운 형식의 변경 사항 요약
 */
export function getChangesSummary(originalData: OriginalData, modifiedData: OriginalData): string {
  const changes = compareData(originalData, modifiedData);
  return formatChanges(changes);
}

/**
 * TermData에서 OriginalData 객체 생성
 * @param data TermData 객체
 * @returns OriginalData 객체
 */
export function createOriginalData(data: Partial<TermData>): OriginalData {
  return {
    title: data.title || {},
    description: data.description || { short: '', full: '' },
    difficulty: data.difficulty || { level: 1, description: '' },
    terms: data.terms || [],
    relevance: data.relevance || {
      analyst: { score: 1, description: '' },
      engineer: { score: 1, description: '' },
      scientist: { score: 1, description: '' },
    },
    usecase: data.usecase || {
      description: '',
      example: '',
      industries: [],
    },
    tags: data.tags || [],
    references: data.references || {
      tutorials: [],
      books: [],
      academic: [],
      opensource: [],
    },
  };
}
