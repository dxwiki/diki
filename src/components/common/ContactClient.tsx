'use client';

import Link from 'next/link';
import { Profile } from '@/types';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { getAuthorSlug } from '@/utils/filters';
import TooltipButton from '@/components/ui/TooltipButton';
import { useEffect, useState, useMemo } from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ContactButtonWrapper from '@/components/profiles/ContactButtonWrapper';

const ContactClient = () => {
  const profiles = useSelector((state: RootState) => state.profiles.profiles);
  const terms = useSelector((state: RootState) => state.terms.terms);
  const [isDataReady, setIsDataReady] = useState(false);

  const ownerProfiles = useMemo(
    () => profiles.filter((p) => p.role === 'owner').sort((a, b) => a.id - b.id),
    [profiles]
  );

  const activeContributors = useMemo(() => {
    const contributorProfiles = profiles.filter((p) => p.role === 'contributor');
    return contributorProfiles.filter((profile) =>
      terms.some((term) =>
        Array.isArray(term.metadata?.authors) && term.metadata.authors.includes(profile.username)
      )
    ).sort((a, b) => a.id - b.id);
  }, [profiles, terms]);

  useEffect(() => {
    if (profiles.length > 0 && terms.length > 0) {
      setIsDataReady(true);
    }
  }, [profiles, terms]);

  if (!isDataReady) {
    return (
      <LoadingSpinner />
    );
  }

  const ProfileCard = ({ profile, isOwner = false }: { profile: Profile, isOwner?: boolean }) => {
    const authorSlug = getAuthorSlug(profile.username);
    return (
      <div
        className={`flex flex-col md:flex-row justify-center items-center text-center transition-transform 
          ${ isOwner ? 'gap-0 md:gap-10' : 'gap-0 md:gap-4' } border w-full py-5 md:py-0 border-gray4 rounded-xl md:border-0
          `}
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
            <ContactButtonWrapper
              email={profile.email}
              github={profile.social.github}
              linkedin={profile.social.linkedin}
            />
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

        {activeContributors.length > 0 && (
          <section className="w-full mb-10">
            <div className="flex flex-col items-center md:items-start gap-1 mb-8">
              <h3 className="text-xl md:text-2xl text-sub">
                {'Knowledge Sharers'}
              </h3>
              <p className="hidden md:block md:text-base text-gray2">
                {'지식을 나누며 함께 성장해 주신 분들입니다.'}
              </p>
            </div>
            <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 z-10">
              {activeContributors.map((profile) => (
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