import { NextResponse } from 'next/server';

// GitHub OAuth 로그인 URL로 리다이렉트
export async function GET() {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = process.env.NEXT_PUBLIC_BASE_URL + '/api/auth/github/callback';

  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${ clientId }&redirect_uri=${ redirectUri }`;

  return NextResponse.redirect(githubAuthUrl);
}