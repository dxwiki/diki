import { TermData, Title, Description, Difficulty, Terms, Relevance, Usecase, Tags, References, Metadata } from '@/types/database';

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
  metadata: RecursivePartial<Metadata>;
  id?: number;
  publish?: boolean;
  url?: string;
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
  // 빈 객체인 경우 처리
  if (Object.keys(original).length === 0 && !(original instanceof Array)) {
    original = {} as T;
  }
  if (Object.keys(modified).length === 0 && !(modified instanceof Array)) {
    modified = {} as T;
  }
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
      // 이전에는 metadata를 비교에서 제외했지만, 이제는 모든 필드 비교

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
        // Record<string, unknown>으로 타입 캐스팅하기 전에 빈 객체인지 확인
        const origObj = originalValue as Record<string, unknown>;
        const modObj = modifiedValue as Record<string, unknown>;

        const nestedChanges = compareData(
          Object.keys(origObj).length > 0 ? origObj : {} as Record<string, unknown>,
          Object.keys(modObj).length > 0 ? modObj : {} as Record<string, unknown>,
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
      case 'metadata':
        sectionTitle = '메타데이터';
        break;
      case 'id':
        sectionTitle = '아이디';
        break;
      case 'publish':
        sectionTitle = '발행 상태';
        break;
      case 'url':
        sectionTitle = 'URL';
        break;
      default:
        sectionTitle = section;
    }

    markdown += `\n## ${ sectionTitle } 변경 사항\n`;

    // 배열 타입의 특별 처리 (tags, terms 등)
    if ((section === 'tags' || section === 'terms') && sectionChanges.length === 1 && sectionChanges[0].path === section) {
      const change = sectionChanges[0];
      markdown += formatArrayComparison(change.original as unknown[], change.modified as unknown[], section);
      continue;
    }

    // 일반적인 변경 사항 처리
    sectionChanges.forEach((change) => {
      const subPath = change.path.split('.').slice(1).join('.');
      const fieldName = subPath || '전체';

      // 필드명을 더 읽기 쉽게 표시
      const prettyFieldName = formatFieldName(fieldName);
      markdown += `### ${ prettyFieldName }\n`;

      // 배열 타입 특별 처리
      if (Array.isArray(change.original) || Array.isArray(change.modified)) {
        markdown += formatArrayComparison(
          Array.isArray(change.original) ? change.original : [],
          Array.isArray(change.modified) ? change.modified : [],
          fieldName
        );
        return;
      }

      // 객체 타입 특별 처리
      if (
        typeof change.original === 'object' && change.original !== null
        && typeof change.modified === 'object' && change.modified !== null
      ) {
        markdown += formatObjectComparison(change.original, change.modified);
        return;
      }

      // 기본 타입 비교
      markdown += '**변경 전:**\n';
      if (change.original === undefined) {
        markdown += '없음\n\n';
      } else if (typeof change.original === 'object' && change.original !== null) {
        markdown += '```json\n' + JSON.stringify(change.original, null, 2) + '\n```\n\n';
      } else {
        markdown += `${ String(change.original) }\n\n`;
      }

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
 * 필드명을 더 읽기 쉽게 포맷팅하는 함수
 */
function formatFieldName(fieldName: string): string {
  // 점으로 구분된 경로를 더 읽기 쉽게 변환
  const parts = fieldName.split('.');

  // 특별한 필드명 변환
  const fieldMap: Record<string, string> = {
    'ko': '한글 제목',
    'en': '영문 제목',
    'etc': '기타 제목',
    'short': '짧은 설명',
    'full': '전체 설명',
    'level': '난이도 레벨',
    'description': '설명',
    'analyst': '데이터 분석가',
    'engineer': '데이터 엔지니어',
    'scientist': '데이터 과학자',
    'score': '점수',
    'example': '예시',
    'industries': '산업 분야',
    'tutorials': '튜토리얼',
    'books': '참고 서적',
    'academic': '학술 자료',
    'opensource': '오픈소스',
    'contributors': '기여자',
    'authors': '작성자',
    'created_at': '생성일',
    'updated_at': '수정일',
    'last_reviewed': '최종 검토일',
    'term': '용어명',
    'internal_link': '내부 링크',
    'name': '이름',
    'platform': '플랫폼',
    'title': '제목',
    'external_link': '외부 링크',
    'isbn': 'ISBN',
    'publisher': '출판사',
    'year': '연도',
    'doi': 'DOI',
    'license': '라이선스',
  };

  // 필드명 변환
  return parts.map((part) => fieldMap[part] || part).join(' > ');
}

/**
 * 배열 비교를 포맷팅하는 함수
 */
function formatArrayComparison(original: unknown[], modified: unknown[], fieldName: string): string {
  let markdown = '';

  // 태그와 용어 특별 처리
  if (fieldName === 'tags') {
    const originalTags = original.map((tag) => (tag as Record<string, unknown>).name || '이름 없음').sort();
    const modifiedTags = modified.map((tag) => (tag as Record<string, unknown>).name || '이름 없음').sort();

    markdown += '**변경 전 태그:**\n';
    markdown += originalTags.length > 0
      ? originalTags.map((tag) => `- ${ tag }`).join('\n') + '\n\n'
      : '없음\n\n';

    markdown += '**변경 후 태그:**\n';
    markdown += modifiedTags.length > 0
      ? modifiedTags.map((tag) => `- ${ tag }`).join('\n') + '\n\n'
      : '없음\n\n';

    // 추가/삭제된 태그 표시
    const added = modifiedTags.filter((tag) => !originalTags.includes(tag));
    const removed = originalTags.filter((tag) => !modifiedTags.includes(tag));

    if (added.length > 0) {
      markdown += '**추가된 태그:**\n';
      markdown += added.map((tag) => `- ${ tag }`).join('\n') + '\n\n';
    }

    if (removed.length > 0) {
      markdown += '**삭제된 태그:**\n';
      markdown += removed.map((tag) => `- ${ tag }`).join('\n') + '\n\n';
    }

    return markdown;
  } else if (fieldName === 'terms') {
    const originalTerms = original.map((term) => (term as Record<string, unknown>).term || '용어 없음');
    const modifiedTerms = modified.map((term) => (term as Record<string, unknown>).term || '용어 없음');

    markdown += '**변경 전 관련 용어:**\n';
    markdown += originalTerms.length > 0
      ? originalTerms.map((term) => `- ${ term }`).join('\n') + '\n\n'
      : '없음\n\n';

    markdown += '**변경 후 관련 용어:**\n';
    markdown += modifiedTerms.length > 0
      ? modifiedTerms.map((term) => `- ${ term }`).join('\n') + '\n\n'
      : '없음\n\n';

    // 추가/삭제된 용어 표시
    const added = modifiedTerms.filter((term) => !originalTerms.includes(term));
    const removed = originalTerms.filter((term) => !modifiedTerms.includes(term));

    if (added.length > 0) {
      markdown += '**추가된 용어:**\n';
      markdown += added.map((term) => `- ${ term }`).join('\n') + '\n\n';
    }

    if (removed.length > 0) {
      markdown += '**삭제된 용어:**\n';
      markdown += removed.map((term) => `- ${ term }`).join('\n') + '\n\n';
    }

    return markdown;
  }

  // 일반 배열 비교
  markdown += '**변경 전:**\n';
  if (original.length === 0) {
    markdown += '없음\n\n';
  } else {
    markdown += '```json\n' + JSON.stringify(original, null, 2) + '\n```\n\n';
  }

  markdown += '**변경 후:**\n';
  if (modified.length === 0) {
    markdown += '없음\n\n';
  } else {
    markdown += '```json\n' + JSON.stringify(modified, null, 2) + '\n```\n\n';
  }

  return markdown;
}

/**
 * 객체 비교를 포맷팅하는 함수
 */
function formatObjectComparison(original: Record<string, unknown> | object, modified: Record<string, unknown> | object): string {
  // 빈 객체인 경우 처리
  if (Object.keys(original).length === 0) {
    original = {} as Record<string, unknown>;
  }
  if (Object.keys(modified).length === 0) {
    modified = {} as Record<string, unknown>;
  }

  const origObj = original as Record<string, unknown>;
  const modObj = modified as Record<string, unknown>;
  let markdown = '';

  // 모든 키 수집
  const allKeys = Array.from(new Set([...Object.keys(origObj), ...Object.keys(modObj)])).sort();

  // 변경된 키만 필터링
  const changedKeys = allKeys.filter((key) => {
    if (!(key in origObj)) return true;
    if (!(key in modObj)) return true;
    return JSON.stringify(origObj[key]) !== JSON.stringify(modObj[key]);
  });

  if (changedKeys.length === 0) {
    return '변경 사항 없음\n\n';
  }

  // 각 변경된 키에 대해 비교 표시
  for (const key of changedKeys) {
    const fieldMap: Record<string, string> = {
      'ko': '한글 제목',
      'en': '영문 제목',
      'etc': '기타 제목',
      'short': '짧은 설명',
      'full': '전체 설명',
      'level': '난이도 레벨',
      'description': '설명',
      'score': '점수',
      'example': '예시',
      'industries': '산업 분야',
    };

    const displayKey = fieldMap[key] || key;
    markdown += `#### ${ displayKey }\n`;

    // 원본 값
    markdown += '**변경 전:**\n';
    if (!(key in origObj)) {
      markdown += '없음\n\n';
    } else if (typeof origObj[key] === 'object' && origObj[key] !== null) {
      markdown += '```json\n' + JSON.stringify(origObj[key], null, 2) + '\n```\n\n';
    } else {
      markdown += `${ String(origObj[key]) }\n\n`;
    }

    // 수정된 값
    markdown += '**변경 후:**\n';
    if (!(key in modObj)) {
      markdown += '삭제됨\n\n';
    } else if (typeof modObj[key] === 'object' && modObj[key] !== null) {
      markdown += '```json\n' + JSON.stringify(modObj[key], null, 2) + '\n```\n\n';
    } else {
      markdown += `${ String(modObj[key]) }\n\n`;
    }
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
    title: data.title || {} as RecursivePartial<Title>,
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
    metadata: data.metadata || {
      contributors: [],
      authors: [],
      created_at: '',
      updated_at: '',
      last_reviewed: '',
    },
    id: data.id,
    publish: data.publish,
    url: data.url,
  };
}