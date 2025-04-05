import TooltipButton from '@/components/ui/TooltipButton';
import { Mail } from 'lucide-react';
import Image from 'next/image';

interface ContactButtonWrapperProps {
  email: string | undefined;
  github: string | undefined;
  linkedin: string | undefined;
}

const ContactButtonWrapper = ({ email, github, linkedin }: ContactButtonWrapperProps) => {
  return(
    <div className="flex items-center justify-center gap-2">
      {email && (
        <TooltipButton
          isLink={true}
          tooltip="메일 보내기"
          href={`mailto:${ email }`}
          className="p-2 border border-light rounded-md shrink-0"
        >
          <Mail className='size-4' />
        </TooltipButton>
      )}
      {github && (
        <TooltipButton
          isLink={true}
          tooltip="깃허브"
          href={`https://github.com/${ github }`}
          className="p-2 border border-light rounded-md shrink-0"
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
          href={`https://linkedin.com/in/${ linkedin }`}
          className="p-2 border border-light rounded-md shrink-0"
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