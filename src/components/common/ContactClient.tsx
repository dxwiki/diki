'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Profile } from '@/types';
import { Mail } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { getAuthorSlug } from '@/utils/filters';
import TooltipButton from '@/components/ui/TooltipButton';
import { useEffect, useState } from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const ContactClient = () => {
  const profiles = useSelector((state: RootState) => state.profiles.profiles);
  const [isDataReady, setIsDataReady] = useState(false);

  useEffect(() => {
    if (profiles.length > 0) {
      setIsDataReady(true);
    }
  }, [profiles]);

  if (!isDataReady) {
    return (
      <LoadingSpinner />
    );
  }

  const ownerProfiles = profiles.filter((p) => p.role === 'owner').sort((a, b) => a.id - b.id);
  const contributorProfiles = profiles.filter((p) => p.role === 'contributor').sort((a, b) => a.id - b.id);

  const ProfileCard = ({ profile, isOwner = false }: { profile: Profile, isOwner?: boolean }) => {
    const authorSlug = getAuthorSlug(profile.username);
    return (
      <div
        className="flex flex-col md:flex-row justify-center items-center text-center transition-transform gap-0 md:gap-10 border w-full py-5 md:py-0 border-gray4 rounded-xl md:border-0"
      >
        <Link href={`/profiles/${ authorSlug }`}>
          <div
            className={`${ isOwner ? 'size-24 md:size-36 mb-4' : 'size-20 md:size-28' } rounded-full md:rounded-xl flex items-center justify-center my-2`}
            style={{ backgroundImage: `url(${ profile.thumbnail })`, backgroundSize: 'cover', backgroundPosition: 'center' }}
          />
        </Link>
        <div className='flex flex-col justify-center items-center md:items-start gap-1'>
          <TooltipButton
            tooltip={`${ profile.name }님의 프로필 보기`}
            isLink={true}
            href={`/profiles/${ authorSlug }`}
            className='text-center text-xl md:text-2xl font-semibold text-primary hover:text-accent hover:underline hover:underline-offset-4'
          >
            {profile.name}
          </TooltipButton>
          <div className='text-[13px] md:text-base text-main text-center font-tinos'>
            {profile.role}
          </div>
          <div className="flex items-center justify-center gap-4 mt-2">
            <TooltipButton
              isLink={true}
              tooltip="메일 보내기"
              href={`mailto:${ profile.email }`}
              className="p-2 border border-light rounded-md shrink-0"
            >
              <Mail className='size-6 md:size-5' />
            </TooltipButton>
            <TooltipButton
              isLink={true}
              tooltip="깃허브"
              href={`https://github.com/${ profile.social.github }`}
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
              href={`https://linkedin.com/in/${ profile.social.linkedin }`}
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
    );
  };

  return (
    <div className="relative">
      <h2 className="w-full flex justify-center items-center text-4xl md:text-8xl font-bold text-sub mt-10 md:mt-40 mb-4 z-10">
        {'Contact Us'}
      </h2>
      <Link
        href="/"
        className="w-full flex justify-center items-center text-2xl md:text-4xl text-primary mb-8 z-10 font-tinos"
      >
        {'Diki : Data Wiki'}
      </Link>

      <div className="container mx-auto px-4 max-w-5xl">
        <section className="w-full mb-16">
          <div className="w-full grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-5 md:gap-10 z-10">
            {ownerProfiles.map((profile) => (
              <ProfileCard key={profile.id} profile={profile} isOwner={true} />
            ))}
          </div>
        </section>

        {contributorProfiles.length > 0 && (
          <section className="w-full mb-10">
            <div className="flex flex-col items-center md:items-start gap-1 mb-8">
              <h3 className="text-xl md:text-2xl text-sub">
                {'Thanks to our Contributors'}
              </h3>
              <p className="hidden md:block md:text-base text-gray2">
                {'Diki의 발전에 기여해 주신 모든 분들께 감사드립니다.'}
              </p>
            </div>
            <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 z-10">
              {contributorProfiles.map((profile) => (
                <ProfileCard key={profile.id} profile={profile} isOwner={false} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ContactClient;