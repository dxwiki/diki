'use client';

// import { useEffect, useState } from 'react';
// import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function ThankYouPage() {
  // const searchParams = useSearchParams();
  // const issueNumber = searchParams.get('issue');
  // const [_issueUrl, setIssueUrl] = useState<string | null>(null);

  // useEffect(() => {
  //   if (issueNumber) {
  //     // GitHub 저장소 URL 형식
  //     const url = `https://github.com/${ process.env.NEXT_PUBLIC_GITHUB_REPO_OWNER }/${ process.env.NEXT_PUBLIC_GITHUB_REPO_NAME }/issues/${ issueNumber }`;
  //     setIssueUrl(url);
  //   }
  // }, [issueNumber]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-background rounded-lg shadow-md text-center dark:bg-gray-800">
        <h1 className="text-2xl font-bold">{'감사합니다!'}</h1>

        <div className="py-4">
          <p className="mb- text-sub whitespace-pre-line">
            {'작성하신 포스트가 Github Issue(비공개 레포지토리)에'}
            <br />
            {'등록되었으며, 내부 검토 후 반영될 예정입니다.'}
          </p>

          {/* {issueUrl && (
            <div className="mt-4">
              <a
                href={issueUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline underline-offset-4"
              >
                {'이슈 #'}{issueNumber} {'확인하기'}
              </a>
            </div>
          )} */}
        </div>

        <div className="flex justify-center space-x-4">
          <Link
            href="/"
            className="px-4 py-2 text-gray1 rounded-md hover:text-main"
          >
            {'홈으로 돌아가기'}
          </Link>

          <Link
            href="/posts/create"
            className="px-4 py-2 text-white bg-primary dark:bg-secondary hover:bg-accent dark:hover:bg-background-secondary rounded-md border-gray4"
          >
            {'다른 포스트 작성하기'}
          </Link>
        </div>
      </div>
    </div>
  );
}