'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Profile } from '@/types';
import { Mail } from 'lucide-react';
import { getAuthorSlug } from '@/utils/filters';
import TooltipButton from '@/components/ui/TooltipButton';
interface ContactClientProps {
  profile: Profile[];
}

const ContactClient = ({ profile }: ContactClientProps) => {
  return (
    <div className="relative" >
      <h2 className="w-full flex justify-center items-center text-4xl md:text-8xl font-bold text-sub mt-10 md:mt-40 mb-4 z-10">
        {'Contact Us'}
      </h2>
      <Link
        href="/"
        className="w-full flex justify-center items-center text-2xl md:text-4xl text-primary mb-8 z-10 font-tinos"
      >
        {'Diki : Data Wiki'}
      </Link>
      <div className="w-full min-h-[30vh] flex flex-col md:flex-row justify-center items-center gap-5 md:gap-10 z-10 mb-10">
        {profile.map((p: Profile) => (
          <div
            key={p.id}
            className="flex flex-col md:flex-row justify-center items-center text-center transition-transform gap-0 md:gap-10 border w-full py-5 md:py-0 border-gray4 rounded-xl md:border-0"
          >
            <Link href={`/profiles/${ getAuthorSlug(p.name) }`}>
              <div className='size-24 md:size-36 rounded-full md:rounded-xl flex items-center justify-center my-2 mb-4' style={{ backgroundImage: `url(${ p.thumbnail })`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
            </Link>
            <div className='flex flex-col justify-center items-center md:items-start gap-1'>
              <TooltipButton
                tooltip={`${ p.name }님의 포스트 보기`}
                isLink={true}
                href={`/profiles/${ getAuthorSlug(p.name) }`}
                className='text-center text-xl md:text-2xl font-semibold text-primary hover:text-accent hover:underline hover:underline-offset-4'
              >
                {p.name}
              </TooltipButton>
              <div className='text-[13px] md:text-base text-main text-center font-tinos'>
                {p.role}
              </div>
              <div className="flex items-center justify-center gap-4 mt-2">
                <TooltipButton
                  isLink={true}
                  tooltip="메일 보내기"
                  href={`mailto:${ p.email }`}
                  className="p-2 border border-light rounded-md shrink-0"
                >
                  <Mail className='size-6 md:size-5' />
                </TooltipButton>
                <TooltipButton
                  isLink={true}
                  tooltip="깃허브"
                  href={`https://github.com/${ p.social.github }`}
                  className="p-2 border border-light rounded-md shrink-0"
                >
                  <Image
                    src="/images/github-mark.png"
                    alt="github"
                    className="block dark:hidden size-6 md:size-5"
                    width={24}
                    height={24}
                  />
                  <Image
                    src="/images/github-mark-white.png"
                    alt="github"
                    className="hidden dark:block size-6 md:size-5"
                    width={24}
                    height={24}
                  />
                </TooltipButton>
                <TooltipButton
                  isLink={true}
                  tooltip="링크드인"
                  href={`https://linkedin.com/in/${ p.social.linkedin }`}
                  className="p-2 border border-light rounded-md shrink-0"
                >
                  <Image
                    src="/images/linkedin.jpeg"
                    alt="linkedin"
                    className="rounded-sm size-6 md:size-5"
                    width={24}
                    height={24}
                  />
                </TooltipButton>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* <div className='mx-auto px-20 hidden lg:flex flex-col gap-2'>
        <CarouselWrapper itemCount={terms.length} itemWidth={120}>
          {terms.map((term) => (
            <Link
            key={term.url + '-left'}
            href={`${ term.url }`}
            className='w-[120px] px-2.5 py-1.5 flex justify-center items-center text-gray2 rounded-lg border border-gray2 hover:border-primary hover:text-primary hover:font-semibold transition-colors text-[13px] md:text-sm shrink-0 bg-background'
            >
              <span className="overflow-hidden text-nowrap text-ellipsis">
                {term.title?.ko}
              </span>
            </Link>
          ))}
        </CarouselWrapper>
        <CarouselWrapperRight itemCount={terms.length} itemWidth={120}>
          {terms.map((term) => (
            <Link
            key={term.url + '-right'}
            href={`${ term.url }`}
            className='w-[120px] px-2.5 py-1.5 flex justify-center items-center text-gray1 rounded-lg border border-gray1 hover:border-primary hover:text-primary hover:font-semibold transition-colors text-[13px] md:text-sm shrink-0 bg-background'
            >
              <span className="overflow-hidden text-nowrap text-ellipsis">
                {term.title?.ko}
              </span>
            </Link>
          ))}
        </CarouselWrapperRight>
        <CarouselWrapper itemCount={terms.length} itemWidth={120} speed={0.4}>
          {terms.map((term) => (
            <Link
            key={term.url + '-left-fast'}
            href={`${ term.url }`}
            className='w-[120px] px-2.5 py-1.5 flex justify-center items-center text-gray0 rounded-lg border border-gray0 hover:border-primary hover:text-primary hover:font-semibold transition-colors text-[13px] md:text-sm shrink-0 bg-background'
            >
              <span className="overflow-hidden text-nowrap text-ellipsis">
                {term.title?.ko}
              </span>
            </Link>
          ))}
        </CarouselWrapper>
      </div> */}
    </div>
  );
};

export default ContactClient;