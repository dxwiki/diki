import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { Profile } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const username = params.slug;

    // profiles.json 파일 경로
    const filePath = path.join(process.cwd(), 'src', 'data', 'profiles.json');

    // 파일 존재 여부 확인
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { message: '프로필 데이터 파일이 존재하지 않습니다.' },
        { status: 404 }
      );
    }

    // 파일 읽기
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const profiles = JSON.parse(fileContent) as Profile[];

    // username으로 프로필 찾기
    const profile = profiles.find((p) => p.username === username);

    if (!profile) {
      return NextResponse.json(
        { message: '요청한 프로필을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { message: '프로필 데이터를 가져오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}