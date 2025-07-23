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

    // description.full의 줄바꿈 문자를 <br> 태그로 변환
    if (data.description?.full) {
      data.description.full = data.description.full.replace(/\n/g, '<br>');
    }

    // 작성자 정보 추가
    if (userInfo?.username && data.metadata?.authors) {
      if (!data.metadata.authors.includes(userInfo.username)) {
        data.metadata.authors.push(userInfo.username);
      }
    }

    // 날짜 형식 확인
    const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    if (data.metadata) {
      data.metadata.created_at = currentDate;
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
          labels: ['new-post', userInfo?.username || 'username 확인 안됨'],
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
  // description.full의 줄바꿈 문자를 <br> 태그로 변환
  const formattedDescription = data.description?.full || '';

  // references 객체를 마크다운 형식으로 포맷팅
  let referencesMarkdown = '';

  if (data.references) {
    // 튜토리얼 목록
    if (data.references.tutorials && data.references.tutorials.length > 0) {
      referencesMarkdown += '\n### 튜토리얼\n';
      data.references.tutorials.forEach((tutorial, index) => {
        referencesMarkdown += `${ index + 1 }. **${ tutorial.title || '제목 없음' }**\n`;
        if (tutorial.platform) referencesMarkdown += `   - 플랫폼: ${ tutorial.platform }\n`;
        if (tutorial.external_link) referencesMarkdown += `   - 링크: ${ tutorial.external_link }\n`;
      });
    }

    // 참고서적 목록
    if (data.references.books && data.references.books.length > 0) {
      referencesMarkdown += '\n### 참고서적\n';
      data.references.books.forEach((book, index) => {
        referencesMarkdown += `${ index + 1 }. **${ book.title || '제목 없음' }**\n`;
        if (book.authors && book.authors.length > 0) referencesMarkdown += `   - 저자: ${ book.authors.join(', ') }\n`;
        if (book.publisher) referencesMarkdown += `   - 출판사: ${ book.publisher }\n`;
        if (book.year) referencesMarkdown += `   - 출판년도: ${ book.year }\n`;
        if (book.isbn) referencesMarkdown += `   - ISBN: ${ book.isbn }\n`;
        if (book.external_link) referencesMarkdown += `   - 링크: ${ book.external_link }\n`;
      });
    }

    // 연구논문 목록
    if (data.references.academic && data.references.academic.length > 0) {
      referencesMarkdown += '\n### 연구논문\n';
      data.references.academic.forEach((paper, index) => {
        referencesMarkdown += `${ index + 1 }. **${ paper.title || '제목 없음' }**\n`;
        if (paper.authors && paper.authors.length > 0) referencesMarkdown += `   - 저자: ${ paper.authors.join(', ') }\n`;
        if (paper.year) referencesMarkdown += `   - 출판년도: ${ paper.year }\n`;
        if (paper.doi) referencesMarkdown += `   - DOI: ${ paper.doi }\n`;
        if (paper.external_link) referencesMarkdown += `   - 링크: ${ paper.external_link }\n`;
      });
    }

    // 오픈소스 목록
    if (data.references.opensource && data.references.opensource.length > 0) {
      referencesMarkdown += '\n### 오픈소스\n';
      data.references.opensource.forEach((os, index) => {
        referencesMarkdown += `${ index + 1 }. **${ os.name || '이름 없음' }**\n`;
        if (os.license) referencesMarkdown += `   - 라이선스: ${ os.license }\n`;
        if (os.description) referencesMarkdown += `   - 설명: ${ os.description }\n`;
        if (os.external_link) referencesMarkdown += `   - 링크: ${ os.external_link }\n`;
      });
    }

    // 참고 자료가 없는 경우
    if (referencesMarkdown === '') {
      referencesMarkdown = '참고 자료 없음';
    }
  } else {
    referencesMarkdown = '참고 자료 없음';
  }

  return `
# 새 포스트 추가 요청

## 기본 정보
- 한글 제목: ${ data.title?.ko || '' }
- 영문 제목: ${ data.title?.en || '' }
- 기타 제목: ${ data.title?.etc || '' }
- 기여자: ${ userInfo?.username || '없음' }

## 설명
### 짧은 설명
${ data.description?.short || '' }

### 개념(전체 설명)
${ formattedDescription }

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

## 참고 자료
${ referencesMarkdown }

## 태그(관련 포스트)
${ (data.tags || []).map((tag) => `- ${ tag.name || '' }`).join('\n') }

## 전체 JSON 데이터
\`\`\`json
${ JSON.stringify(data, null, 2) }
\`\`\`
`;
}