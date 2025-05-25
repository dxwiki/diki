'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface PrivacyPolicyProps {
  onCheckChange: (checked: boolean)=> void;
  isChecked: boolean;
}

export default function PrivacyPolicy({ onCheckChange, isChecked }: PrivacyPolicyProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [height, setHeight] = useState<number | undefined>(undefined);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [autoCheckApplied, setAutoCheckApplied] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const policyContentRef = useRef<HTMLDivElement>(null);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // 스크롤이 끝까지 내려갔는지 확인
  const checkScrollPosition = useCallback(() => {
    if (policyContentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = policyContentRef.current;
      const isAtBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 10;

      if (isAtBottom && !hasScrolledToBottom) {
        setHasScrolledToBottom(true);

        if (!autoCheckApplied && !isChecked) {
          onCheckChange(true);
          setAutoCheckApplied(true);
        }
      }
    }
  }, [hasScrolledToBottom, autoCheckApplied, isChecked, onCheckChange]);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(isExpanded ? contentRef.current.scrollHeight : 0);
    }
  }, [isExpanded]);

  useEffect(() => {
    const policyContent = policyContentRef.current;
    if (policyContent && isExpanded) {
      policyContent.addEventListener('scroll', checkScrollPosition);

      return () => {
        policyContent.removeEventListener('scroll', checkScrollPosition);
      };
    }
  }, [isExpanded, checkScrollPosition]);

  useEffect(() => {
    if (!isChecked) {
      setAutoCheckApplied(false);
    }
  }, [isChecked]);

  useEffect(() => {
    const signupContainer = document.querySelector('.signup-container');
    if (signupContainer) {
      if (isExpanded) {
        signupContainer.classList.add('expanded-policy');
      } else {
        signupContainer.classList.remove('expanded-policy');
      }
    }

    return () => {
      if (signupContainer) {
        signupContainer.classList.remove('expanded-policy');
      }
    };
  }, [isExpanded]);

  return (
    <div className="w-full">
      <div
        className="flex items-center space-x-2 cursor-pointer"
        onClick={() => {
          if (!isExpanded) {
            toggleExpand();
          }
        }}
      >
        <input
          type="checkbox"
          id="privacy-check"
          checked={isChecked}
          onChange={(e) => {
            // 스크롤을 끝까지 내렸을 때만 체크박스 변경 가능
            if (hasScrolledToBottom) {
              onCheckChange(e.target.checked);
            } else if (!isExpanded) {
              // 체크박스 클릭 시 펼치기
              toggleExpand();
            }
          }}
          className="size-4 accent-primary cursor-pointer"
          onClick={(e) => {
            // 이벤트 버블링 중지
            e.stopPropagation();
            // 스크롤을 다 내리지 않았다면 체크박스 클릭 시 이벤트 중지
            if (!hasScrolledToBottom) {
              e.preventDefault();
            }
          }}
        />
        <label
          htmlFor="privacy-check"
          className="text-sm text-main cursor-pointer grow"
          onClick={(e) => e.stopPropagation()}
        >
          {'[필수] 개인정보 처리방침'}
        </label>
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleExpand();
          }}
          className="text-main hover:text-primary transition-colors"
          aria-label={isExpanded ? '개인정보 처리방침 닫기' : '개인정보 처리방침 열기'}
        >
          {isExpanded
            ? (
              <span className="text-sm flex items-center gap-1">
                {'닫기'}
                <ChevronUp size={18} />
              </span>
            )
            : (
              <span className="text-sm flex items-center gap-1">
                {'상세'}
                <ChevronDown size={18} />
              </span>
            )
          }
        </button>
      </div>

      <div
        className={`mt-3 overflow-hidden transition-all duration-300 ease-in-out ${ isExpanded ? 'opacity-100' : 'opacity-0' }`}
        style={{ height: height ? `${ height }px` : '0px' }}
      >
        <div
          ref={contentRef}
          className={`p-2 md:p-6 bg-gray5 rounded-md text-sm ${ isExpanded ? 'animate-slideDown' : '' }`}
        >
          <div
            ref={policyContentRef}
            className="privacy-policy-content overflow-y-auto max-h-64 md:max-h-96"
          >
            <h2 className="text-center text-lg font-bold mb-4">{'개인정보 처리방침'}</h2>
            <p className="my-2">
              {'Diki는 「개인정보 보호법」 등 관련 법령에 따라 이용자의 개인정보를 보호하고, 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 다음과 같이 개인정보 처리방침을 수립·공개합니다.'}
            </p>

            <h3 className="text-base font-semibold mt-4 mb-2">{'1. 수집하는 개인정보 항목 및 수집 방법'}</h3>
            <p className="pl-3">{'당사는 GitHub 계정 연동을 통해 다음과 같은 개인정보를 수집합니다.'}</p>

            <p className="font-semibold mt-3 mb-1 pl-3">{'1) 수집 항목'}</p>
            <div className="pl-6 md:pl-12 space-y-3">
              <div>
                <p className="font-medium mb-1">{'기본 사용자 정보'}</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>{'GitHub 사용자명 (username)'}</li>
                  <li>{'사용자 이름 (name)'}</li>
                  <li>{'프로필 이미지 URL (avatar_url)'}</li>
                </ul>
              </div>

              <div>
                <p className="font-medium mb-1">{'이메일 정보'}</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>{'이메일 주소 (email)'}</li>
                  <li>{'이메일 상태'}</li>
                  <ul className="list-circle pl-6 space-y-1">
                    <li>{'기본 이메일 여부 (primary)'}</li>
                    <li>{'인증 여부 (verified)'}</li>
                    <li>{'공개 여부 (visibility)'}</li>
                  </ul>
                </ul>
              </div>

              <div>
                <p className="font-medium mb-1">{'계정 관련 정보'}</p>
                <ul className="list-disc pl-6">
                  <li>{'GitHub 액세스 토큰 (access token)'}</li>
                </ul>
              </div>
            </div>

            <p className="font-semibold mt-4 mb-2 pl-3">{'2) 수집 방법'}</p>
            <div className="pl-6 md:pl-12">
              <p className="mb-2">{'OAuth 2.0 기반의 GitHub 로그인 연동을 통해 사용자의 명시적 동의를 받은 후, 아래 정보를 수집합니다:'}</p>
              <ul className="list-disc pl-6 space-y-1 mb-3">
                <li>{'GitHub 사용자명 (username)'}</li>
                <li>{'사용자 이름 (name)'}</li>
                <li>{'프로필 이미지 URL (avatar_url)'}</li>
                <li>{'이메일 주소 및 상태 (email, primary, verified, visibility)'}</li>
              </ul>
              <p>{'GitHub 액세스 토큰은 사용자 인증 처리에 일시적으로만 사용되며, 인증이 완료된 후 즉시 파기됩니다.'}</p>
            </div>

            <h3 className="text-base font-semibold mt-4 mb-2">{'2. 개인정보의 수집 및 이용 목적'}</h3>
            <p className="pl-3">{'수집한 개인정보는 다음 목적에 한하여 사용됩니다.'}</p>
            <ul className="list-disc pl-6 md:pl-8">
              <li className="mb-1">{'사용자 식별 및 서비스 이용을 위한 로그인 인증'}</li>
              <li className="mb-1">{'사용자 게시글 작성 기능 제공'}</li>
              <li className="mb-1">{'사용자 계정 연동 유지 및 관리'}</li>
            </ul>

            <h3 className="text-base font-semibold mt-4 mb-2">{'3. 개인정보의 보유 및 이용 기간'}</h3>
            <p className="mb-1 pl-3">{'수집된 개인정보는 회원 탈퇴 시 즉시 파기하며, 별도 보관하지 않습니다.'}</p>
            <p className="pl-3">{'단, 관계 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관 후 즉시 파기합니다.'}</p>

            <h3 className="text-base font-semibold mt-4 mb-2">{'4. 개인정보 제3자 제공'}</h3>
            <p className="mb-1 pl-3">{'당사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다.'}</p>
            <p className="pl-3">{'단, 법령에 특별한 규정이 있는 경우는 예외로 합니다.'}</p>

            <h3 className="text-base font-semibold mt-4 mb-2">{'5. 개인정보의 파기 절차 및 방법'}</h3>
            <p className="mb-1 pl-3">{'회원 탈퇴 또는 서비스 목적 달성 시 수집된 개인정보는 지체 없이 파기되며, 전자적 파일 형태는 복구 불가능한 기술적 방법으로 안전하게 삭제합니다.'}</p>
            <p className="mb-1 pl-3">{'단, GitHub OAuth의 정책상 연동된 Authorized OAuth App은 사용자가 직접 GitHub 계정 설정에서 해제(revoke)해야 합니다.'}</p>
            <p className="pl-3 text-level-5">{'이 경우, [개인 프로필] - [Settings] - [Applications] - [Authorized OAuth Apps] 에서 해제할 수 있습니다.'}</p>

            <h3 className="text-base font-semibold mt-4 mb-2">{'6. 이용자의 권리와 행사 방법'}</h3>
            <p className="mb-1 pl-3">{'이용자는 언제든지 다음과 같은 권리를 행사할 수 있습니다:'}</p>
            <ul className="list-disc pl-6 md:pl-8">
              <li className="mb-1">{'개인정보 열람 요청'}</li>
              <li className="mb-1">{'오류 등이 있을 경우 정정 요청'}</li>
              <li className="mb-1">{'삭제 및 처리 정지 요청'}</li>
            </ul>
            <p className="pl-3">{'요청은 서비스 내 문의 채널 또는 이메일(dxwiki.team@gmail.com)을 통해 가능합니다.'}</p>

            <div className="mt-6 mb-2 text-center">
              {hasScrolledToBottom && (
                <p className="text-primary text-sm mt-1">{'스크롤을 완료하셨습니다. 자동으로 동의 처리됩니다.'}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}