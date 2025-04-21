import { NextResponse } from 'next/server';

// GitHub OAuth 로그인 URL로 리다이렉트
export async function GET() {
  const githubClientId = process.env.GITHUB_CLIENT_ID;

  // scope 파라미터를 추가하여 이메일 권한 요청
  const authUrl = `https://github.com/login/oauth/authorize?client_id=${ githubClientId }&scope=read:user user:email`;

  return NextResponse.redirect(authUrl);
}