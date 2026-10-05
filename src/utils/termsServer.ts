import fs from 'fs';
import path from 'path';
import { TermData } from '@/types';

// 서버 컴포넌트 전용: Redux 등 부수 효과 없이 공개 용어만 읽는다
export function readPublishedTerms(): TermData[] {
  try {
    const filePath = path.join(process.cwd(), 'src', 'data', 'terms.json');
    const terms = JSON.parse(fs.readFileSync(filePath, 'utf8')) as TermData[];
    return terms.filter((term) => term.publish !== false);
  } catch (error) {
    console.error('terms.json 읽기 오류:', error);
    return [];
  }
}

export function sortByCreatedDesc(terms: TermData[]): TermData[] {
  return [...terms].sort((a, b) => {
    const diff = new Date(b.metadata?.created_at ?? 0).getTime() - new Date(a.metadata?.created_at ?? 0).getTime();
    return diff === 0 ? (b.id ?? 0) - (a.id ?? 0) : diff;
  });
}
