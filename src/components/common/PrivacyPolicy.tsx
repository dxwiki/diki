'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface PrivacyPolicyProps {
  onCheckChange: (checked: boolean)=> void;
  isChecked: boolean;
}

export default function PrivacyPolicy({ onCheckChange, isChecked }: PrivacyPolicyProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [height, setHeight] = useState<number | undefined>(undefined);
  const contentRef = useRef<HTMLDivElement>(null);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  useEffect(() => {
    if (contentRef.current) {
      setHeight(isExpanded ? contentRef.current.scrollHeight : 0);
    }
  }, [isExpanded]);

  return (
    <div className="w-full">
      <div className="flex items-center space-x-2 cursor-pointer">
        <input
          type="checkbox"
          id="privacy-check"
          checked={isChecked}
          onChange={(e) => onCheckChange(e.target.checked)}
          className="size-4 accent-primary cursor-pointer"
        />
        <label htmlFor="privacy-check" className="text-sm text-main cursor-pointer grow">
          {'[필수] 개인정보 처리방침'}
        </label>
        <button
          onClick={toggleExpand}
          className="text-gray2 hover:text-main transition-colors"
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
          className={`p-2 md:p-4 bg-gray5 rounded-md text-sm ${ isExpanded ? 'animate-slideDown' : '' }`}
        >
          <div className="prose prose-sm dark:prose-invert overflow-y-auto max-h-64">
            <h2 className="text-lg font-bold">{'개인정보 처리방침'}</h2>
            <p>
              {'Diki는 「개인정보 보호법」 등 관련 법령에 따라 이용자의 개인정보를 보호하고, 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 다음과 같이 개인정보처리방침을 수립·공개합니다.'}
            </p>

            <h3 className="text-base font-semibold mt-4">{'1. 수집하는 개인정보 항목 및 수집 방법'}</h3>
            <p>{'당사는 GitHub 계정 연동을 통해 다음과 같은 개인정보를 수집합니다.'}</p>

            <p className="font-medium">{'1) 수집 항목'}</p>
            <p>{'기본 사용자 정보: GitHub 사용자명(username), 사용자 이름(name), 프로필 이미지 URL(avatar_url)'}</p>
            <p>{'이메일 정보: 이메일 주소(email), 이메일 상태(primary, verified, visibility)'}</p>
            <p>{'계정 관련 정보: GitHub 액세스 토큰(access token)'}</p>

            <p className="font-medium">{'2) 수집 방법'}</p>
            <p>{'OAuth 2.0 기반의 GitHub 로그인 연동을 통해 사용자의 명시적 동의를 받은 후, GitHub 사용자명(username), 사용자 이름(name), 프로필 이미지 URL(avatar_url), 이메일 주소(email), 이메일 상태(primary, verified, visibility)를 수집합니다.'}</p>
            <p>{'GitHub 액세스 토큰은 사용자 인증 처리에만 일시적으로 사용되며, 인증 이후 즉시 파기됩니다.'}</p>

            <h3 className="text-base font-semibold mt-4">{'2. 개인정보의 수집 및 이용 목적'}</h3>
            <p>{'수집한 개인정보는 다음 목적에 한하여 사용됩니다.'}</p>
            <ul className="list-disc pl-5">
              <li>{'사용자 식별 및 서비스 이용을 위한 로그인 인증'}</li>
              <li>{'사용자 게시글 작성 기능 제공'}</li>
              <li>{'사용자 계정 연동 유지 및 관리'}</li>
            </ul>

            <h3 className="text-base font-semibold mt-4">{'3. 개인정보의 보유 및 이용 기간'}</h3>
            <p>{'수집된 개인정보는 회원 탈퇴 시 즉시 파기하며, 별도 보관하지 않습니다.'}</p>
            <p>{'단, 관계 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관 후 즉시 파기합니다.'}</p>

            <h3 className="text-base font-semibold mt-4">{'4. 개인정보 제3자 제공'}</h3>
            <p>{'당사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다.'}</p>
            <p>{'다만, 법령에 특별한 규정이 있는 경우는 예외로 합니다.'}</p>

            <h3 className="text-base font-semibold mt-4">{'5. 개인정보의 파기 절차 및 방법'}</h3>
            <p>{'회원 탈퇴 또는 서비스 목적 달성 시 수집된 개인정보는 지체 없이 파기됩니다.'}</p>
            <p>{'전자적 파일 형태는 복구 불가능한 기술적 방법으로 안전하게 삭제합니다.'}</p>

            <h3 className="text-base font-semibold mt-4">{'6. 이용자의 권리와 행사 방법'}</h3>
            <p>{'이용자는 언제든지 다음과 같은 권리를 행사할 수 있습니다:'}</p>
            <ul className="list-disc pl-5">
              <li>{'개인정보 열람 요청'}</li>
              <li>{'오류 등이 있을 경우 정정 요청'}</li>
              <li>{'삭제 및 처리 정지 요청'}</li>
            </ul>
            <p>{'요청은 서비스 내 문의 채널 또는 이메일을 통해 가능합니다.'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}