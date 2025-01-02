'use client';

import { Profile } from '@/types';
import { Mail } from 'lucide-react';
import TooltipButton from '@/components/ui/TooltipButton';
import Image from 'next/image';

interface ContactClientProps {
  profile: Profile[];
}

const ContactClient = ({ profile }: ContactClientProps) => {
  return (
    <div className="relative min-h-half px-4 py-10" >
      {/* <div
        className="absolute top-0 left-0 z-0 w-full min-h-[80vh] opacity-100 dark:opacity-65 blur-xl
        bg-[url(https://cdn.pixabay.com/photo/2022/04/18/17/27/artwork-7141136_1280.png)]
        dark:bg-[url(https://cdn.pixabay.com/photo/2020/06/20/05/26/color-5319718_1280.jpg)]"
        style={{  backgroundSize: 'cover', backgroundPosition: 'center' }}
      /> */}
      <h2 className="text-xl font-bold text-sub mb-8 z-10">
        {'Contact Us'}
      </h2>
      <div className="w-full min-h-[60vh] mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
        {profile.map((p: Profile) => (
          <div
            key={p.id}
            className="shadow-lg border border-light rounded-md flex flex-col justify-center items-center text-center transition-transform hover:scale-105"
          >
            <div className='size-24 sm:size-36 rounded-full flex items-center justify-center my-2 mb-4' style={{ backgroundImage: `url(${ p.thumbnail })`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
            <h2 className="text-xl font-semibold text-main">
              {p.name}
            </h2>
            <div className='text-sm text-gray1 mt-1 mb-2 sm:mt-2 sm:mb-4'>
              {p.role}
            </div>
            <div className="flex items-center justify-center gap-4 mb-2">
              <TooltipButton
                isLink={true}
                tooltip="메일"
                href={`mailto:${ p.email }`}
                className="p-2 border border-light rounded-md"
              >
                <Mail size={20} />
              </TooltipButton>
              <TooltipButton
                isLink={true}
                tooltip="깃허브"
                href={`https://github.com/${ p.social.github }`}
                className="p-2 border border-light rounded-md"
              >
                <Image
                  src="/github-mark.png"
                  alt="github"
                  width={20}
                  height={20}
                  className="block dark:hidden"
                />
                <Image
                  src="/github-mark-white.png"
                  alt="github"
                  width={20}
                  height={20}
                  className="hidden dark:block"
                />
              </TooltipButton>
              <TooltipButton
                isLink={true}
                tooltip="링크드인"
                href={`https://linkedin.com/in/${ p.social.linkedin }`}
                className="p-2 border border-light rounded-md"
              >
                <Image src="/linkedin-logo.jpg" alt="linkedin" width={20} height={20} className="rounded-sm" />
              </TooltipButton>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContactClient;