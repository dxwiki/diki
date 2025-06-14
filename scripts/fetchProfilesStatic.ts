import { firestore } from '../src/libs/firebaseAdmin';
import { Profile, RankInfo } from '../src/types';
import fs from 'fs';
import path from 'path';

interface UserRankData {
  username: string;
  rank: RankInfo;
}

/**
 * 사용자 등급 정보를 가져오는 함수
 * @returns UserRankData 배열 또는 null (파일이 없는 경우)
 */
function getUserRanks(): UserRankData[] | null {
  const ranksPath = path.join(process.cwd(), 'src', 'data', 'user_ranks.json');
  if (fs.existsSync(ranksPath)) {
    try {
      const ranksData = JSON.parse(fs.readFileSync(ranksPath, 'utf8')) as UserRankData[];
      return ranksData;
    } catch (error) {
      console.error('등급 데이터 읽기 오류:', error);
      return null;
    }
  }
  return null;
}

/**
 * 프로필에 등급 정보를 적용하는 함수
 * @param profiles 프로필 배열
 * @param ranks 등급 정보 배열
 * @returns 등급 정보가 적용된 프로필 배열
 */
function applyRanksToProfiles(profiles: Profile[], ranks: UserRankData[] | null): Profile[] {
  if (!ranks) return profiles;

  // username을 키로 하는 Map 생성하여 검색 최적화
  const rankMap = new Map<string, RankInfo>();
  ranks.forEach((userData) => rankMap.set(userData.username, userData.rank));

  // 프로필에 등급 정보 적용
  return profiles.map((profile) => {
    const rankInfo = rankMap.get(profile.username);
    if (rankInfo) {
      return {
        ...profile,
        rank: rankInfo,
      };
    }
    // 등급 정보가 없는 경우 기본값 설정
    return {
      ...profile,
      rank: profile.rank || { current: 0, postsCount: 0, remainingForNextRank: 1 },
    };
  });
}

/**
 * Firestore에 등급 정보를 업데이트하는 함수
 * @param profiles 업데이트할 프로필 배열
 * @param ranks 등급 정보 배열
 * @returns 업데이트 성공 여부
 */
async function updateRanksInFirestore(profiles: Profile[], ranks: UserRankData[] | null): Promise<boolean> {
  if (!ranks) return false;

  try {
    const batch = firestore.batch();
    const rankMap = new Map<string, RankInfo>();
    ranks.forEach((userData) => rankMap.set(userData.username, userData.rank));

    let updateCount = 0;

    for (const profile of profiles) {
      const rankInfo = rankMap.get(profile.username);
      if (rankInfo) {
        const docRef = firestore.collection('profiles').doc(profile.username);
        batch.update(docRef, {
          rank: rankInfo,
        });
        updateCount++;
      }
    }

    if (updateCount > 0) {
      await batch.commit();
      console.log(`Firestore에 ${ updateCount }개 프로필 등급 정보 업데이트 완료`);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Firestore 등급 업데이트 오류:', error);
    return false;
  }
}

/**
 * 메인 함수: 프로필 데이터를 가져와서 등급 정보를 적용하고 저장
 */
async function fetchAndSaveProfiles(): Promise<void> {
  try {
    console.log('Firestore에서 프로필 데이터 가져오는 중...');

    // Firestore에서 프로필 데이터 가져오기
    const profilesCollection = await firestore.collection('profiles').get();

    let profilesData = profilesCollection.docs.map((doc) => {
      const data = doc.data();
      return {
        id: data.id,
        email: data.email,
        name: data.name,
        username: data.username,
        role: data.role,
        thumbnail: data.thumbnail,
        intro: data.intro || '',
        social: {
          github: data.social?.github,
          linkedin: data.social?.linkedin,
        },
        rank: data.rank || { current: 0, postsCount: 0, remainingForNextRank: 1 },
        showLinks: data.showLinks || {
          email: true,
          github: true,
          linkedin: true,
        },
      } as Profile;
    });

    // 프로필 데이터 정렬 (ID 기준)
    profilesData.sort((a, b) => a.id - b.id);

    // user_ranks.json 파일에서 등급 정보 가져오기
    const ranksData = getUserRanks();

    if (ranksData) {
      // 등급 정보를 프로필에 적용
      profilesData = applyRanksToProfiles(profilesData, ranksData);

      // Firestore에 업데이트된 등급 정보 저장
      const updated = await updateRanksInFirestore(profilesData, ranksData);

      if (updated) {
        // 임시 파일 삭제
        const ranksPath = path.join(process.cwd(), 'src', 'data', 'user_ranks.json');
        fs.unlinkSync(ranksPath);
        console.log('임시 user_ranks.json 파일 삭제 완료');
      }
    } else {
      console.log('등급 데이터를 찾을 수 없음, 기존 등급 사용');
    }

    // 데이터 디렉토리가 없으면 생성
    const dataDir = path.join(process.cwd(), 'src', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // JSON 파일로 저장
    fs.writeFileSync(
      path.join(dataDir, 'profiles.json'),
      JSON.stringify(profilesData, null, 2)
    );

    console.log(`총 ${ profilesData.length }개의 프로필을 profiles.json에 저장 완료`);
  } catch (error) {
    console.error('프로필 가져오기 오류:', error);
    process.exit(1);
  }
}

// 스크립트 실행
fetchAndSaveProfiles();