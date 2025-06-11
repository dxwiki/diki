import TooltipButton from '@/components/ui/TooltipButton';
import { Check, Mail } from 'lucide-react';
import Image from 'next/image';
import { useState, useRef, useEffect, useCallback } from 'react';

interface ContactButtonWrapperProps {
  email: string | undefined;
  github: string | undefined;
  linkedin: string | undefined;
}

// 이메일 팝오버 컴포넌트
const EmailPopover = ({ email }: { email: string }) => {
  const [showPopover, setShowPopover] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  const handleCopyEmail = useCallback(() => {
    navigator.clipboard.writeText(email)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch((err) => {
        console.error('이메일 복사 실패:', err);
      });
  }, [email]);

  // 외부 클릭 감지하여 팝오버 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current
        && buttonRef.current
        && !popoverRef.current.contains(event.target as Node)
        && !buttonRef.current.contains(event.target as Node)
      ) {
        setShowPopover(false);
      }
    };

    if (showPopover) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPopover]);

  return (
    <div className="relative">
      <TooltipButton
        ref={buttonRef}
        tooltip="이메일"
        onClick={() => setShowPopover(!showPopover)}
        aria-label="이메일"
        className={`p-2 border border-light rounded-md shrink-0 hover:border-primary hover:bg-background-secondary ${
          showPopover ? 'border-primary bg-background-secondary' : ''
        }`}
        newWindow={true}
      >
        <Mail className='size-4' />
      </TooltipButton>

      {showPopover && (
        <div
          ref={popoverRef}
          className="animate-slideDown absolute left-[-90px] top-[42px] z-50 w-full min-w-52 p-2
            flex justify-between items-center rounded-lg bg-background border border-primary shadow-lg
            before:content-[''] before:absolute before:top-[-8px] before:left-[98px]
            before:size-0 before:border-x-8 before:border-x-transparent before:border-b-8
            before:border-b-primary"
        >
          <p className="p-1 rounded-l-md text-sm font-medium text-main truncate">{email}</p>
          <button
            onClick={handleCopyEmail}
            className={`p-1.5 flex items-center justify-center text-xs rounded-r-md ${
              copySuccess ? 'text-level-3' : 'text-gray1 hover:text-primary'
            }`}
            disabled={copySuccess}
          >
            {copySuccess ? <Check className="size-4" /> : <p className="text-gray1 hover:text-primary">{'copy'}</p>}
          </button>
        </div>
      )}
    </div>
  );
};

const ContactButtonWrapper = ({ email, github, linkedin }: ContactButtonWrapperProps) => {
  return (
    <div className="flex shrink-0 items-center justify-center gap-2">
      {email && <EmailPopover email={email} />}

      {github && (
        <TooltipButton
          isLink={true}
          tooltip="깃허브"
          aria-label="깃허브"
          href={`https://github.com/${ github }`}
          className="p-2 border border-light rounded-md shrink-0 hover:border-primary hover:bg-background-secondary"
          newWindow={true}
        >
          <Image
            src="/images/github-mark.png"
            alt="github"
            className="block dark:hidden size-4"
            width={24}
            height={24}
          />
          <Image
            src="/images/github-mark-white.png"
            alt="github"
            className="hidden dark:block size-4"
            width={24}
            height={24}
          />
        </TooltipButton>
      )}

      {linkedin && (
        <TooltipButton
          isLink={true}
          tooltip="링크드인"
          aria-label="링크드인"
          href={`https://linkedin.com/in/${ linkedin }`}
          className="p-2 border border-light rounded-md shrink-0 hover:border-primary hover:bg-background-secondary"
          newWindow={true}
        >
          <Image
            src="/images/linkedin.jpeg"
            alt="linkedin"
            className="rounded-sm size-4"
            width={24}
            height={24}
          />
        </TooltipButton>
      )}
    </div>
  );
};

export default ContactButtonWrapper;