import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { Profile } from '@/types';

// GitHub 이슈 생성을 위한 인터페이스
interface UserInfo {
  id: number;
  username: string;
  name: string;
  thumbnail: string;
}

interface ProfileEditData {
  title: {
    ko: string;
    en: string;
  };
  description: {
    short: string;
    full: string;
  };
  metadata: {
    profile_edit: boolean;
    profile_data: Profile;
  };
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
    const userInfo = userInfoCookie ? JSON.parse(userInfoCookie) as UserInfo : null;
    const data = await request.json() as ProfileEditData;

    // 데이터 유효성 검사
    if (!data.title.ko) {
      return NextResponse.json(
        { message: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // GitHub 이슈 마크다운 본문 생성
    const issueBody = formatIssueBody(data, userInfo);

    // GitHub API를 통해 이슈 생성
    const issueResponse = await fetch(
      `https://api.github.com/repos/${ process.env.GITHUB_REPO_OWNER }/${ process.env.GITHUB_REPO_NAME }/issues`,
      {
        method: 'POST',
        headers: {
          'Authorization': `token ${ process.env.GITHUB_API_TOKEN }`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: `프로필 수정 요청: ${ data.title.ko }`,
          body: issueBody,
          labels: ['profile-edit', 'contribution'],
        }),
      }
    );

    if (!issueResponse.ok) {
      const errorData = await issueResponse.json();
      throw new Error(`GitHub API 오류: ${ errorData.message }`);
    }

    const issueData = await issueResponse.json();

    return NextResponse.json({
      success: true,
      issue_number: issueData.number,
      issue_url: issueData.html_url,
    });
  } catch (error) {
    console.error('이슈 생성 오류:', error);
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다';
    return NextResponse.json(
      { message: `이슈 생성 실패: ${ errorMessage }` },
      { status: 500 }
    );
  }
}

// 이슈 본문 마크다운 포맷팅 함수
function formatIssueBody(data: ProfileEditData, userInfo: UserInfo | null): string {
  const profileData = data.metadata.profile_data;

  return `
# 프로필 수정 요청

## 수정 요청자 정보
- 요청자: ${ userInfo?.name || '없음' } (${ userInfo?.username || '없음' })

## 수정할 프로필 정보
- 사용자 이름: ${ profileData.username || '' }
- 이름: ${ profileData.name || '' }
- 직무: ${ profileData.role || '' }
- 이메일: ${ profileData.email || '' }

## 소셜 미디어 정보
- GitHub: ${ profileData.social.github || '' }
- LinkedIn: ${ profileData.social.linkedin || '' }
- Twitter: ${ profileData.social.twitter || '' }

## 수정 내용 설명
${ data.description.full || '' }

## 전체 JSON 데이터
\`\`\`json
${ JSON.stringify(profileData, null, 2) }
\`\`\`
`;
}