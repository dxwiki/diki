import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const isSignup = searchParams.get('signup') === 'true';
  const githubClientId = process.env.GITHUB_CLIENT_ID;

  // 상태 정보 추가 (signup 여부)
  const state = isSignup ? 'signup' : 'login';
  const authUrl = `https://github.com/login/oauth/authorize?client_id=${ githubClientId }&scope=read:user user:email&state=${ state }`;

  return NextResponse.redirect(authUrl);
}