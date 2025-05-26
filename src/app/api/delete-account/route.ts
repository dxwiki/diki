import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { firestore } from '@/libs/firebaseAdmin';
import fs from 'fs';
import path from 'path';
import { Profile } from '@/types';
import { TermData } from '@/types/database';

export async function POST(request: NextRequest) {
  const cookieStore = cookies();
  const userToken = cookieStore.get('user-token')?.value;
  // userInfoCookie 변수는 사용하지 않지만, 쿠키 자체는 삭제해야 함

  if (!userToken) {
    return NextResponse.json(
      { message: '인증되지 않은 사용자입니다.' },
      { status: 401 }
    );
  }

  try {
    const data = await request.json();
    const username = data.username;

    if (!username) {
      return NextResponse.json(
        { message: '사용자 이름이 필요합니다.' },
        { status: 400 }
      );
    }

    // 1. Firestore에서 프로필 삭제
    const profileRef = firestore.collection('profiles').doc(username);
    const profileDoc = await profileRef.get();

    if (!profileDoc.exists) {
      return NextResponse.json(
        { message: '프로필을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 2. 사용자가 작성한 글 찾기 (publish를 false로 변경)
    const termsSnapshot = await firestore.collection('terms').where('metadata.authors', 'array-contains', username).get();

    // 3. 사용자가 기여한 글 찾기 (contributors에서 제거)
    const contributedSnapshot = await firestore.collection('terms').where('metadata.contributors', 'array-contains', username).get();

    // GitHub 이슈 생성을 위한 데이터 수집
    const affectedTerms: { id: string, title: string, type: 'author' | 'contributor' }[] = [];

    // 작성 글 처리
    const authorBatch = firestore.batch();
    termsSnapshot.forEach((doc) => {
      const termData = doc.data() as TermData;
      authorBatch.update(doc.ref, { publish: false });
      affectedTerms.push({
        id: doc.id,
        title: termData.title?.ko || doc.id,
        type: 'author',
      });
    });

    // 기여 글 처리
    const contributorBatch = firestore.batch();
    contributedSnapshot.forEach((doc) => {
      const termData = doc.data() as TermData;
      if (termData.metadata?.contributors) {
        const updatedContributors = termData.metadata.contributors.filter((c) => c !== username);
        contributorBatch.update(doc.ref, { 'metadata.contributors': updatedContributors });

        // 이미 author로 등록된 글은 중복 추가하지 않음
        if (!affectedTerms.some((term) => term.id === doc.id)) {
          affectedTerms.push({
            id: doc.id,
            title: termData.title?.ko || doc.id,
            type: 'contributor',
          });
        }
      }
    });

    // 프로필 삭제
    await profileRef.delete();

    // 일괄 업데이트 실행
    if (termsSnapshot.size > 0) await authorBatch.commit();
    if (contributedSnapshot.size > 0) await contributorBatch.commit();

    // GitHub 이슈 생성 - 항상 생성하도록 수정
    try {
      await createGitHubIssue(username, affectedTerms);
    } catch (issueError) {
      console.error('GitHub 이슈 생성 오류:', issueError);
      // 이슈 생성 실패는 전체 요청을 실패시키지 않음
    }

    // profiles.json 파일 업데이트
    try {
      const profilesPath = path.join(process.cwd(), 'src', 'data', 'profiles.json');
      if (fs.existsSync(profilesPath)) {
        const fileContent = fs.readFileSync(profilesPath, 'utf8');
        const profiles = JSON.parse(fileContent) as Profile[];
        const updatedProfiles = profiles.filter((p) => p.username !== username);
        fs.writeFileSync(profilesPath, JSON.stringify(updatedProfiles, null, 2));
      }
    } catch (error) {
      console.error('profiles.json 업데이트 오류:', error);
      // 파일 업데이트 실패는 전체 요청을 실패시키지 않음
    }

    // 쿠키 삭제
    cookieStore.delete('user-token');
    cookieStore.delete('user-info');

    return NextResponse.json({
      success: true,
      message: '계정이 성공적으로 삭제되었습니다.',
    });
  } catch (error) {
    console.error('계정 삭제 오류:', error);
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다';
    return NextResponse.json(
      { message: `계정 삭제 실패: ${ errorMessage }` },
      { status: 500 }
    );
  }
}

// GitHub 이슈 생성 함수
async function createGitHubIssue(username: string, affectedTerms: { id: string, title: string, type: 'author' | 'contributor' }[]) {
  const issueBody = formatIssueBody(username, affectedTerms);

  const issueResponse = await fetch(
    `https://api.github.com/repos/${ process.env.GITHUB_REPO_OWNER }/${ process.env.GITHUB_REPO_NAME }/issues`,
    {
      method: 'POST',
      headers: {
        'Authorization': `token ${ process.env.GITHUB_API_TOKEN }`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: `회원 탈퇴: ${ username } 사용자의 컨텐츠 처리`,
        body: issueBody,
        labels: ['delete-account', username],
      }),
    }
  );

  if (!issueResponse.ok) {
    const errorData = await issueResponse.json();
    throw new Error(`GitHub API 오류: ${ errorData.message }`);
  }

  return await issueResponse.json();
}

// 이슈 본문 마크다운 포맷팅 함수
function formatIssueBody(username: string, affectedTerms: { id: string, title: string, type: 'author' | 'contributor' }[]): string {
  const authorTerms = affectedTerms.filter((term) => term.type === 'author');
  const contributorTerms = affectedTerms.filter((term) => term.type === 'contributor');

  return `
# 회원 탈퇴로 인한 컨텐츠 처리

## 탈퇴 회원 정보
- 사용자명: ${ username }

## 영향받은 컨텐츠

### 작성한 글 (비공개 처리됨)
${ authorTerms.length > 0
  ? authorTerms.map((term) => `- ${ term.title } (ID: ${ term.id })`).join('\n')
  : '없음' }

### 기여한 글 (기여자 목록에서 제거됨)
${ contributorTerms.length > 0
  ? contributorTerms.map((term) => `- ${ term.title } (ID: ${ term.id })`).join('\n')
  : '없음' }

## 처리 내용
- 작성한 글은 비공개(publish: false)로 전환되었습니다.
- 기여한 글에서 해당 사용자는 contributors 목록에서 제거되었습니다.
- 사용자 프로필 정보는 삭제되었습니다.

## 추가 조치 사항
- 비공개 처리된 글 중 유지할 가치가 있는 컨텐츠는 검토 후 다른 관리자로 이관해 주세요.
`;
}