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

// github OAuth 코드 검증 및 토큰 발급
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const isSignupFlow = state === 'signup';

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=github_code_missing', process.env.NEXT_PUBLIC_BASE_URL || ''));
  }

  try {
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
      const errorRoute = isSignupFlow ? '/signup' : '/login';
      return NextResponse.redirect(new URL(`${ errorRoute }?error=${ tokenData.error }`, process.env.NEXT_PUBLIC_BASE_URL || ''));
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
      const errorRoute = isSignupFlow ? '/signup' : '/login';
      return NextResponse.redirect(new URL(`${ errorRoute }?error=no_email`, process.env.NEXT_PUBLIC_BASE_URL || ''));
    }

    // username으로 사용할 값
    const username = userData.login;

    // 기존 프로필 데이터에서 사용자 확인
    let existingProfile: Profile | undefined;
    let profiles: Profile[] = [];

    try {
      const profilesFilePath = path.join(process.cwd(), 'src', 'data', 'profiles.json');
      if (fs.existsSync(profilesFilePath)) {
        const profilesContent = fs.readFileSync(profilesFilePath, 'utf8');
        profiles = JSON.parse(profilesContent) as Profile[];
        existingProfile = profiles.find((profile) => profile.username === username);
      }
    } catch (error) {
      console.error('Error reading profiles data:', error);
    }

    const profilesSnapshot = await firestore.collection('profiles').get();
    const userDoc = profilesSnapshot.docs.find((doc) => doc.id === username);

    // 회원가입/로그인 구분 처리
    if (isSignupFlow && (userDoc || existingProfile)) {
      // 회원가입 시도했는데 이미 사용자가 존재하는 경우
      return NextResponse.redirect(new URL('/login?error=user_already_exists', process.env.NEXT_PUBLIC_BASE_URL || ''));
    } else if (!isSignupFlow && !userDoc && !existingProfile) {
      // 로그인 시도했는데 사용자가 존재하지 않는 경우 - 회원가입으로 리다이렉트하고 OAuth 연결 중단
      return NextResponse.redirect(new URL('/signup?error=user_not_found', process.env.NEXT_PUBLIC_BASE_URL || ''));
    }

    let firestoreData;
    let cookieUserInfo;
    let newId = 1;

    if (existingProfile || userDoc) {
      // 기존 사용자 정보 업데이트
      firestoreData = {
        ...(existingProfile || (userDoc ? userDoc.data() : {})),
        updatedAt: new Date().toISOString(),
      };

      cookieUserInfo = {
        id: existingProfile?.id || (userDoc ? userDoc.data().id : newId),
        username: existingProfile?.username || username,
        name: existingProfile?.name || userData.name || userData.login,
        thumbnail: existingProfile?.thumbnail || userData.avatar_url,
        email: existingProfile?.email || primaryEmail,
        social: existingProfile?.social || {
          github: username,
          linkedin: username,
        },
        rank: existingProfile?.rank || (userDoc ? userDoc.data().rank : { current: 0, postsCount: 0, remainingForNextRank: 1 }),
      };
    } else if (isSignupFlow) {
      // 회원가입 플로우에서만 신규 사용자 정보 생성

      // 신규 사용자 ID 계산
      let firestoreMaxId = 0;
      if (!profilesSnapshot.empty) {
        profilesSnapshot.forEach((doc) => {
          const profileData = doc.data();
          if (profileData.id && typeof profileData.id === 'number') {
            firestoreMaxId = Math.max(firestoreMaxId, profileData.id);
          }
        });
        newId = Math.max(newId, firestoreMaxId + 1);
      }

      firestoreData = {
        id: newId,
        email: primaryEmail,
        username: username,
        name: userData.name || userData.login,
        role: 'contributor',
        social: {
          github: username,
          linkedin: username,
        },
        thumbnail: userData.avatar_url,
        updatedAt: new Date().toISOString(),
        rank: { current: 0, postsCount: 0, remainingForNextRank: 1 },
      };

      cookieUserInfo = {
        id: newId,
        username: username,
        name: userData.name || userData.login,
        thumbnail: userData.avatar_url,
        email: primaryEmail,
        social: {
          github: username,
          linkedin: username,
        },
        rank: { current: 0, postsCount: 0, remainingForNextRank: 1 },
      };
    } else {
      // 로그인 플로우인데 여기까지 왔다면 오류 (이미 위에서 처리했지만 안전장치)
      return NextResponse.redirect(new URL('/signup?error=user_not_found', process.env.NEXT_PUBLIC_BASE_URL || ''));
    }

    // Firestore에 사용자 정보 저장 또는 업데이트
    if (existingProfile || userDoc) {
      // 기존 사용자 업데이트
      if (!userDoc) {
        await firestore.collection('profiles').doc(username).set(firestoreData);
      } else {
        if (existingProfile) {
          await userDoc.ref.update(firestoreData);
        } else {
          const existingData = userDoc.data();
          await userDoc.ref.update({
            ...firestoreData,
            id: existingData.id || newId,
          });
        }
      }
    } else if (isSignupFlow) {
      // 회원가입 플로우에서만 새 사용자 추가
      await firestore.collection('profiles').doc(username).set(firestoreData);
    }

    // 쿠키에 사용자 정보 저장 (7일 유효)
    const cookieStore = cookies();
    cookieStore.set('user-token', accessToken, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    cookieStore.set('user-info', JSON.stringify(cookieUserInfo), {
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    // 로그인 성공 후 리다이렉트
    return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_BASE_URL || ''));
  } catch (error) {
    console.error('GitHub OAuth error:', error);
    const errorRoute = isSignupFlow ? '/signup' : '/login';
    return NextResponse.redirect(new URL(`${ errorRoute }?error=github_auth_failed`, process.env.NEXT_PUBLIC_BASE_URL || ''));
  }
}