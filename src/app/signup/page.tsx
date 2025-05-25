'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import PrivacyPolicy from '@/components/common/PrivacyPolicy';

const errorMessages: Record<string, string> = {
  github_code_missing: 'GitHub에서 인증 코드를 받지 못했습니다.',
  github_auth_failed: 'GitHub 인증에 실패했습니다.',
  no_email: 'GitHub 계정에서 이메일을 찾을 수 없습니다.',
  privacy_required: '개인정보 처리방침 동의가 필요합니다.',
  user_already_exists: '이미 가입된 사용자입니다.',
};

function SignupContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [privacyChecked, setPrivacyChecked] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [showPrivacyWarning, setShowPrivacyWarning] = useState(false);

  useEffect(() => {
    if (error && errorMessages[error]) {
      setErrorMsg(errorMessages[error]);
    } else if (error) {
      setErrorMsg(`회원가입 오류: ${ error }`);
    }
  }, [error]);

  const handlePrivacyCheckChange = (checked: boolean) => {
    setPrivacyChecked(checked);
    if (checked) {
      setShowPrivacyWarning(false);
    }
  };

  const handleScrolledToBottom = (scrolled: boolean) => {
    setHasScrolledToBottom(scrolled);
  };

  // 버튼 활성화 조건: 스크롤 끝까지 + 체크박스 체크
  const isSignupButtonEnabled = privacyChecked && hasScrolledToBottom;

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <div className="w-full p-4 md:p-8 space-y-6 bg-white dark:bg-black dark:border dark:border-accent rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center">
          <span className="text-primary">
            {'D'}
          </span>
          {'iki 회원가입'}
        </h1>

        {errorMsg && (
          <div className="p-2.5 mb-4 text-center text-red-700 bg-red-100 dark:bg-red-900 dark:text-red-200 rounded-lg">
            {errorMsg}
          </div>
        )}

        <div className="space-y-5">
          <div className="bg-gray5 p-4 rounded-lg">
            <h2 className="text-lg font-medium text-main mb-2">{'Diki 서비스 이용 안내'}</h2>
            <p className="text-sm text-sub mb-1">{'- GitHub 계정으로 간편하게 가입하실 수 있습니다.'}</p>
            <p className="text-sm text-sub mb-1">{'- 가입 후 글을 작성하고 기여할 수 있습니다.'}</p>
            <p className="text-sm text-sub">{'- 개인정보 처리방침에 동의하셔야 이용이 가능합니다.'}</p>
          </div>

          <div>
            <PrivacyPolicy
              onCheckChange={handlePrivacyCheckChange}
              isChecked={privacyChecked}
              onScrolledToBottom={handleScrolledToBottom}
            />
            {showPrivacyWarning && !privacyChecked && (
              <p className="text-xs text-primary mt-1">{'개인정보 처리방침에 동의해 주세요.'}</p>
            )}
          </div>

          <a
            href="/api/auth/github?signup=true"
            className={`flex items-center justify-center w-full px-4 py-3 space-x-3 font-bold ${
              isSignupButtonEnabled
                ? 'bg-primary dark:bg-secondary hover:bg-accent dark:hover:bg-background-secondary text-white'
                : 'bg-gray3 dark:bg-gray4 cursor-not-allowed text-main'
            } rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray1 transition-colors`}
            onClick={(e) => {
              if (!isSignupButtonEnabled) {
                e.preventDefault();
                setShowPrivacyWarning(true);
              }
            }}
            aria-disabled={!isSignupButtonEnabled}
          >
            <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            <span>{'GitHub로 회원가입'}</span>
          </a>
        </div>

        <div className="w-full flex items-center justify-center gap-2 text-sm text-gray1 mt-6">
          <p>{'이미 계정이 있으신가요?'}</p>
          <Link href="/login" className="text-primary hover:underline font-medium">
            {'로그인'}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[70vh]">{'로딩 중...'}</div>}>
      <SignupContent />
    </Suspense>
  );
}