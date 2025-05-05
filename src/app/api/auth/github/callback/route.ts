import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { firestore } from '@/libs/firebaseAdmin';
import path from 'path';
import fs from 'fs';
import { Profile } from '@/types';

interface GitHubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
  visibility: string | null;
}

export async function GET(request: NextRequest) {
  // 쿼리 파라미터에서 코드 추출
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=github_code_missing', process.env.NEXT_PUBLIC_BASE_URL || ''));
  }

  try {
    // GitHub 액세스 토큰 요청
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error('GitHub OAuth error:', tokenData.error);
      return NextResponse.redirect(new URL(`/login?error=${ tokenData.error }`, process.env.NEXT_PUBLIC_BASE_URL || ''));
    }

    const accessToken = tokenData.access_token;

    // GitHub 사용자 정보 요청
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `token ${ accessToken }`,
      },
    });

    const userData = await userResponse.json();

    // 사용자 이메일 가져오기
    const emailResponse = await fetch('https://api.github.com/user/emails', {
      headers: {
        'Authorization': `token ${ accessToken }`,
      },
    });

    const emailData = await emailResponse.json() as GitHubEmail[];
    const primaryEmail = emailData.find((email: GitHubEmail) => email.primary)?.email || emailData[0]?.email;

    if (!primaryEmail) {
      return NextResponse.redirect(new URL('/login?error=no_email', process.env.NEXT_PUBLIC_BASE_URL || ''));
    }

    // username으로 사용할 값
    const username = userData.login;

    // 기존 프로필 데이터에서 사용자 확인
    let existingProfile: Profile | undefined;
    let profiles: Profile[] = [];
    let newId = 1;

    try {
      const profilesFilePath = path.join(process.cwd(), 'src', 'data', 'profiles.json');
      if (fs.existsSync(profilesFilePath)) {
        const profilesContent = fs.readFileSync(profilesFilePath, 'utf8');
        profiles = JSON.parse(profilesContent) as Profile[];

        // username으로 기존 프로필 찾기
        existingProfile = profiles.find((profile) => profile.username === username);

        // 가장 큰 ID 값 찾기 (새 사용자인 경우)
        if (!existingProfile && profiles.length > 0) {
          const maxId = Math.max(...profiles.map((profile) => profile.id));
          newId = maxId + 1;
        }
      }
    } catch (error) {
      console.error('Error reading profiles data:', error);
    }

    // Firestore 컬렉션에서 가장 큰 ID 값 확인
    let firestoreMaxId = 0;

    // Firestore에서 프로필 데이터 가져오기
    const profilesSnapshot = await firestore.collection('profiles').get();
    const userDoc = profilesSnapshot.docs.find((doc) => doc.id === username);

    if (!existingProfile) {
      try {
        if (!profilesSnapshot.empty) {
          profilesSnapshot.forEach((doc) => {
            const profileData = doc.data();
            if (profileData.id && typeof profileData.id === 'number') {
              firestoreMaxId = Math.max(firestoreMaxId, profileData.id);
            }
          });
          // Firestore의 최대 ID와 로컬 프로필의 최대 ID 중 더 큰 값 + 1을 사용
          newId = Math.max(newId, firestoreMaxId + 1);
        }
      } catch (error) {
        console.error('Error getting profiles from Firestore:', error);
      }
    }

    // Firestore에 저장할 사용자 정보 준비
    let firestoreData;

    // 쿠키에 저장할 사용자 정보
    let cookieUserInfo;

    // 기존 프로필이 있으면 해당 데이터 사용
    if (existingProfile) {
      firestoreData = {
        ...existingProfile,
        updatedAt: new Date().toISOString(),
      };

      cookieUserInfo = {
        id: existingProfile.id,
        username: existingProfile.username,
        name: existingProfile.name,
        thumbnail: existingProfile.thumbnail,
        email: existingProfile.email,
      };
    }
    // 새 사용자면 새 프로필 생성
    else {
      firestoreData = {
        id: newId,
        email: primaryEmail,
        username: username,
        name: userData.name || userData.login,
        role: 'contributor', // 기본 역할
        social: {
          github: username,
        },
        thumbnail: userData.avatar_url,
        updatedAt: new Date().toISOString(),
      };

      cookieUserInfo = {
        id: newId,
        username: username,
        name: userData.name || userData.login,
        thumbnail: userData.avatar_url,
        email: primaryEmail,
        social: {
          github: username,
        },
      };
    }

    // Firestore에 사용자 정보 저장 또는 업데이트 (이미 가져온 데이터 활용)
    if (!userDoc) {
      // 새 사용자 추가 - 문서 ID를 username으로 설정
      await firestore.collection('profiles').doc(username).set(firestoreData);
    } else {
      // 기존 사용자 정보 업데이트
      if (existingProfile) {
        // 프로필 데이터가 기존에 있으면 해당 데이터로 업데이트
        await userDoc.ref.update(firestoreData);
      } else {
        // 기존 Firestore 문서는 있지만 프로필 데이터가 없는 경우
        const existingData = userDoc.data();
        await userDoc.ref.update({
          ...firestoreData,
          id: existingData.id || newId,
        });
      }
    }

    // 쿠키에 사용자 정보 저장 (7일 유효)
    const cookieStore = cookies();
    cookieStore.set('user-token', accessToken, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7일
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    cookieStore.set('user-info', JSON.stringify(cookieUserInfo), {
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7일
      httpOnly: false, // 클라이언트에서 접근 가능하도록
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    // 로그인 성공 후 리다이렉트
    return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_BASE_URL || ''));
  } catch (error) {
    console.error('GitHub OAuth error:', error);
    return NextResponse.redirect(new URL('/login?error=github_auth_failed', process.env.NEXT_PUBLIC_BASE_URL || ''));
  }
}