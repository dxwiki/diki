import { fetchProfilesData, fetchTermsByAuthor, fetchTermsByContributor } from '@/utils/fetchData';
import { dikiMetadata } from '@/constants';
import { Metadata } from 'next';
import ProfileClient from '@/components/profiles/ProfileClient';
import Footer from '@/components/common/Footer';
import { getUserProfileFromCookie } from '@/utils/profileUtils';
import JsonLdSchema, { generatePersonSchema } from '@/components/meta/JsonLdSchema';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const profiles = await fetchProfilesData();
  let profile = profiles.find((p) => p.username === params.slug);

  // profiles.json에 없으면 쿠키에서 가져오기 시도
  if (!profile) {
    const { cookieProfile } = getUserProfileFromCookie(params.slug);
    profile = cookieProfile;
  }

  if (!profile) {
    return {
      title: '프로필을 찾을 수 없습니다',
      description: '요청하신 프로필을 찾을 수 없습니다.',
    };
  }

  return {
    title: `${ profile.name } 프로필`,
    description: `${ profile.name }님의 프로필 페이지입니다.`,
    alternates: {
      canonical: `${ dikiMetadata.url }/profiles/${ params.slug }`,
    },
    keywords: ['디키', 'Diki', profile.name, '프로필', '데이터전문가'],
    openGraph: {
      title: `${ profile.name } 프로필`,
      description: `${ profile.name }님의 프로필 페이지입니다.`,
      url: `${ dikiMetadata.url }/profiles/${ params.slug }`,
      siteName: dikiMetadata.title,
      locale: 'ko_KR',
      type: 'website',
      images: [
        {
          url: profile.thumbnail || dikiMetadata.thumbnailURL,
          width: 1200,
          height: 630,
          alt: `${ profile.name } 프로필`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${ profile.name } 프로필`,
      description: `${ profile.name }님의 프로필 페이지입니다.`,
      images: [profile.thumbnail || dikiMetadata.thumbnailURL],
    },
  };
}

export async function generateStaticParams() {
  const profiles = await fetchProfilesData();
  return profiles.map((profile) => ({
    slug: profile.username,
  }));
}

export default async function ProfilePage({ params }: { params: { slug: string } }) {
  const profiles = await fetchProfilesData();
  let profile = profiles.find((p) => p.username === params.slug);

  // 쿠키에서 사용자 정보 가져오기
  const { cookieProfile, isOwnProfile } = getUserProfileFromCookie(params.slug);

  // profiles.json에 없고 쿠키에 정보가 있는 경우
  if (!profile && cookieProfile) {
    profile = cookieProfile;
  }

  if (!profile) {
    return (
      <>
        <h1 className="text-2xl font-bold">{'프로필을 찾을 수 없습니다'}</h1>
        <p>{'요청하신 프로필을 찾을 수 없습니다.'}</p>
      </>
    );
  }

  // 두 데이터를 모두 가져옵니다
  const [posts, contributions] = await Promise.all([
    fetchTermsByAuthor(params.slug),
    fetchTermsByContributor(params.slug),
  ]);

  // 중복 제거(같은 글이 작성과 기여 모두에 포함될 수 있으므로)
  const allTerms = [...posts];

  // 이미 포함되지 않은 기여 글만 추가
  contributions.forEach((term) => {
    if (!allTerms.some((existingTerm) => existingTerm.id === term.id)) {
      allTerms.push(term);
    }
  });

  return (
    <>
      <JsonLdSchema
        id="person-schema"
        schema={generatePersonSchema(
          profile.name,
          `${ profile.name }님의 프로필 페이지입니다.`,
          `${ dikiMetadata.url }/profiles/${ params.slug }`,
          profile.thumbnail
        )}
      />
      <div className="flex flex-col gap-5">
        <ProfileClient
          username={params.slug}
          profile={profile}
          isOwnProfile={isOwnProfile}
          postsData={posts}
          contributesData={contributions}
          allTermsData={allTerms}
        />
      </div>
      <div className='block sm:hidden'>
        <Footer />
      </div>
    </>
  );
}
