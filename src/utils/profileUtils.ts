import { cookies } from 'next/headers';
import { Profile, SocialType } from '@/types';

/**
 * 쿠키에서 사용자 프로필 정보를 가져오는 함수
 * @param username 확인할 사용자명
 * @returns 쿠키 기반 프로필, 소유자 여부, 사용자 정보
 */
export function getUserProfileFromCookie(username: string) {
  const cookieStore = cookies();
  const userInfoCookie = cookieStore.get('user-info');
  const userInfo = userInfoCookie ? JSON.parse(userInfoCookie.value) : null;
  
  // 현재 사용자가 프로필 페이지의 소유자인지 확인
  const isOwnProfile = userInfo && userInfo.username === username;
  
  // 쿠키에서 프로필 생성 (사용자 자신의 프로필인 경우)
  let cookieProfile: Profile | undefined = undefined;
  if (isOwnProfile) {
    const social: SocialType = {
      github: userInfo.username ||'',
      linkedin: userInfo.username || '',
      twitter: userInfo.username || ''
    };

    cookieProfile = {
      id: userInfo.id,
      username: userInfo.username,
      name: userInfo.name,
      thumbnail: userInfo.thumbnail,
      email: userInfo.email || '',  // 쿠키에 이메일 정보가 있으면 사용
      role: 'contributor', // 기본 역할
      social: social,
      updatedAt: new Date().toISOString() // 현재 시간으로 설정
    };
  }
  
  return { cookieProfile, isOwnProfile, userInfo };
} 