import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { Profile } from '@/types';
import { firestore } from '@/libs/firebaseAdmin';
import fs from 'fs';
import path from 'path';

interface ProfileEditData {
  profile_data: Profile;
}

export async function POST(request: NextRequest) {
  const cookieStore = cookies();
  const userToken = cookieStore.get('user-token')?.value;
  const userInfoCookie = cookieStore.get('user-info')?.value;

  if (!userToken) {
    return NextResponse.json(
      { message: '인증되지 않은 사용자입니다.' },
      { status: 401 }
    );
  }

  try {
    const data = await request.json() as ProfileEditData;

    // Firestore에 프로필 업데이트
    const profileRef = firestore.collection('profiles').doc(data.profile_data.username);
    const profileDoc = await profileRef.get();

    if (!profileDoc.exists) {
      return NextResponse.json(
        { message: '프로필을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 업데이트할 데이터 준비
    const updateData = {
      ...data.profile_data,
      username: profileDoc.data()?.username,
      updatedAt: new Date().toISOString(),
      intro: data.profile_data.intro,
      showLinks: data.profile_data.showLinks || {
        email: true,
        github: true,
        linkedin: true,
      },
    };

    // Firestore 업데이트
    await profileRef.update(updateData);

    // profiles.json 파일 업데이트
    const profilesPath = path.join(process.cwd(), 'src', 'data', 'profiles.json');
    let profiles: Profile[] = [];

    try {
      // 기존 profiles.json 파일 읽기
      if (fs.existsSync(profilesPath)) {
        const fileContent = fs.readFileSync(profilesPath, 'utf8');
        profiles = JSON.parse(fileContent);
      }

      // 프로필 업데이트 또는 추가
      const existingIndex = profiles.findIndex((p) => p.username === updateData.username);
      if (existingIndex !== -1) {
        profiles[existingIndex] = updateData;
      } else {
        profiles.push(updateData);
      }

      // 파일에 저장
      fs.writeFileSync(profilesPath, JSON.stringify(profiles, null, 2));
    } catch (error) {
      console.error('profiles.json 업데이트 오류:', error);
      // profiles.json 업데이트 실패는 전체 요청을 실패시키지 않음
    }

    // 쿠키 업데이트
    if (userInfoCookie) {
      try {
        const userInfo = JSON.parse(userInfoCookie);
        const updatedUserInfo = {
          ...userInfo,
          name: updateData.name,
          thumbnail: updateData.thumbnail,
          username: updateData.username,
          intro: updateData.intro,
          social: updateData.social,
          showLinks: updateData.showLinks,
        };

        // 쿠키 업데이트
        cookieStore.set('user-info', JSON.stringify(updatedUserInfo), {
          path: '/',
          maxAge: 60 * 60 * 24 * 7, // 7일
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
        });
      } catch (error) {
        console.error('쿠키 업데이트 오류:', error);
      }
    }

    return NextResponse.json({
      success: true,
      message: '프로필이 성공적으로 업데이트되었습니다.',
      profile: updateData,
    });
  } catch (error) {
    console.error('프로필 업데이트 오류:', error);
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다';
    return NextResponse.json(
      { message: `프로필 업데이트 실패: ${ errorMessage }` },
      { status: 500 }
    );
  }
}