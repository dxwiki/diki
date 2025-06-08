import * as fs from 'fs';
import * as path from 'path';
import { TermData } from '../src/types';
import { RankInfo } from '../src/types/profiles';

// 등급 기준 설정
const RANK_THRESHOLDS = [0, 1, 5, 10, 20, 50, 100, 200];

interface UserRankData {
  username: string;
  rank: RankInfo;
}

function calculateRanks() {
  try {
    // terms.json 파일 읽기
    const termsPath = path.join(process.cwd(), 'src', 'data', 'terms.json');
    if (!fs.existsSync(termsPath)) {
      console.error('terms.json 파일을 찾을 수 없습니다.');
      process.exit(1);
    }

    const termsData = JSON.parse(fs.readFileSync(termsPath, 'utf8')) as TermData[];

    // 각 사용자별 작성 글 수 계산
    const authorCounts: Record<string, number> = {};

    termsData.forEach((term) => {
      if (term.metadata && term.metadata.authors) {
        term.metadata.authors.forEach((author: string) => {
          authorCounts[author] = (authorCounts[author] || 0) + 1;
        });
      }
    });

    // 등급 정보 계산 및 저장
    const ranksData: UserRankData[] = Object.entries(authorCounts).map(([username, postsCount]) => {
      const rankInfo = calculateRankInfo(postsCount);
      return { username, rank: rankInfo };
    });

    // 결과를 임시 파일에 저장
    const dataDir = path.join(process.cwd(), 'src', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    fs.writeFileSync(
      path.join(dataDir, 'user_ranks.json'),
      JSON.stringify(ranksData, null, 2)
    );

    console.log(`총 ${ ranksData.length }명의 사용자에 대한 등급 계산 완료`);
  } catch (error) {
    console.error('사용자 등급 계산 중 오류 발생:', error);
    process.exit(1);
  }
}

// 작성 글 수에 따른 등급 및 다음 등급까지 필요한 글 수 계산 함수
function calculateRankInfo(postsCount: number): RankInfo {
  let current = 0;

  // 현재 등급 계산
  for (let i = RANK_THRESHOLDS.length - 1; i >= 0; i--) {
    if (postsCount >= RANK_THRESHOLDS[i]) {
      current = i;
      break;
    }
  }

  // 다음 등급까지 필요한 글 수 계산
  let remainingForNextRank = 0;
  if (current < RANK_THRESHOLDS.length - 1) {
    remainingForNextRank = RANK_THRESHOLDS[current + 1] - postsCount;
  } else {
    // 최대 등급인 경우
    remainingForNextRank = 0;
  }

  return {
    current,
    postsCount,
    remainingForNextRank,
  };
}

calculateRanks();