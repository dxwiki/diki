import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  // 쿠키 삭제
  const cookieStore = cookies();
  cookieStore.delete('user-token');
  cookieStore.delete('user-info');

  return NextResponse.json({ success: true });
}