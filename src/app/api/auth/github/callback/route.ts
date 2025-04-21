import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { firestore } from '@/libs/firebaseAdmin';

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

    // Firestore에 사용자 정보 저장 또는 업데이트
    const userProfile = {
      id: userData.id,
      email: primaryEmail,
      username: userData.login,
      name: userData.name || userData.login,
      role: 'contributor', // 기본 역할
      social: {
        github: userData.html_url,
      },
      thumbnail: userData.avatar_url,
      updatedAt: new Date().toISOString(),
    };

    // 기존 사용자 확인
    const userDoc = await firestore.collection('profiles').where('id', '==', userData.id).get();

    if (userDoc.empty) {
      // 새 사용자 추가
      await firestore.collection('profiles').add(userProfile);
    } else {
      // 기존 사용자 정보 업데이트
      await userDoc.docs[0].ref.update(userProfile);
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

    cookieStore.set('user-info', JSON.stringify({
      id: userData.id,
      username: userData.login,
      name: userData.name || userData.login,
      thumbnail: userData.avatar_url,
    }), {
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