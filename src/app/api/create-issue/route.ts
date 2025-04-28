import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { TermData } from '@/types/database';

interface UserInfo {
  id: number;
  username: string;
  name: string;
  thumbnail: string;
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
    const data = await request.json() as TermData;

    // 문서 데이터 유효성 검사
    if (!data.title?.ko || !data.description?.short) {
      return NextResponse.json(
        { message: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // URL 생성 (영문 제목 기반)
    if (data.title.en) {
      const urlSlug = data.title.en
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');

      data.url = `/posts/${ urlSlug }`;
    }

    // 작성자 정보 추가
    if (userInfo?.name && data.metadata?.authors) {
      if (!data.metadata.authors.includes(userInfo.name)) {
        data.metadata.authors.push(userInfo.name);
      }
    }

    // 날짜 형식 확인
    const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    if (data.metadata) {
      data.metadata.created_at = data.metadata.created_at || currentDate;
      data.metadata.updated_at = currentDate;
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
          title: `새 포스트 추가 요청: ${ data.title.ko }`,
          body: issueBody,
          labels: ['documentation', 'contribution'],
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
function formatIssueBody(data: TermData, userInfo: UserInfo | null): string {
  return `
# 새 포스트 추가 요청

## 기본 정보
- 한글 제목: ${ data.title?.ko || '' }
- 영문 제목: ${ data.title?.en || '' }
- 기여자: ${ userInfo?.name || '없음' }

## 설명
### 짧은 설명
${ data.description?.short || '' }

### 개념(전체 설명)
${ data.description?.full || '' }

## 난이도
- 레벨: ${ data.difficulty?.level || '' }
- 설명: ${ data.difficulty?.description || '' }

## 관련 용어
${ (data.terms || []).map((term) => `- ${ term.term || '' }: ${ term.description || '' }`).join('\n') }
${ data.terms?.length === 0 ? '관련 용어 없음' : '' }

## 직무 연관도
### 데이터 분석가
- 점수: ${ data.relevance?.analyst?.score || 1 }
- 설명: ${ data.relevance?.analyst?.description || '' }

### 데이터 엔지니어
- 점수: ${ data.relevance?.engineer?.score || 1 }
- 설명: ${ data.relevance?.engineer?.description || '' }

### 데이터 과학자
- 점수: ${ data.relevance?.scientist?.score || 1 }
- 설명: ${ data.relevance?.scientist?.description || '' }

## 사용 사례
- 설명: ${ data.usecase?.description || '' }
- 예시: ${ data.usecase?.example || '' }
- 산업 분야: ${ (data.usecase?.industries || []).join(', ') }

## 태그
${ (data.tags || []).map((tag) => `- ${ tag.name || '' }`).join('\n') }

## 전체 JSON 데이터
\`\`\`json
${ JSON.stringify(data, null, 2) }
\`\`\`
`;
}