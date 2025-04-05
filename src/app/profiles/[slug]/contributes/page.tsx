import { fetchProfilesData, fetchTermsByContributor, fetchTermsByAuthor } from '@/utils/fetchData';
import { Metadata } from 'next';
import { dikiMetadata } from '@/constants';
import ProfileClient from '@/components/profiles/ProfileClient';
import Footer from '@/components/common/Footer';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const profiles = await fetchProfilesData();
  const profile = profiles.find((p) => p.username === params.slug);

  if (!profile) {
    return {
      title: '프로필을 찾을 수 없습니다',
      description: '요청하신 프로필을 찾을 수 없습니다.',
    };
  }

  return {
    title: `${ profile.name }의 기여(편집글)`,
    description: `${ profile.name }님이 기여(편집)한 글을 확인할 수 있는 페이지입니다.`,
    openGraph: {
      title: `${ profile.name }의 기여(편집글)`,
      description: `${ profile.name }님이 기여(편집)한 글을 확인할 수 있는 페이지입니다.`,
      url: `${ dikiMetadata.url }/profiles/${ params.slug }/contributes`,
      siteName: dikiMetadata.title,
      locale: 'ko_KR',
      type: 'website',
      images: [
        {
          url: profile.thumbnail || dikiMetadata.thumbnailURL,
          width: 1200,
          height: 630,
          alt: `${ profile.name }의 기여(편집글)`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${ profile.name }의 기여(편집글)`,
      description: `${ profile.name }님이 기여(편집)한 글을 확인할 수 있는 페이지입니다.`,
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

export default async function ContributePage({ params }: { params: { slug: string } }) {
  const profiles = await fetchProfilesData();
  const profile = profiles.find((p) => p.username === params.slug);

  if (!profile) {
    return (
      <>
        <h1 className="text-2xl font-bold">{'프로필을 찾을 수 없습니다'}</h1>
        <p>{'요청하신 프로필을 찾을 수 없습니다.'}</p>
      </>
    );
  }

  // 두 데이터를 모두 가져옵니다
  const [contributions, posts] = await Promise.all([
    fetchTermsByContributor(params.slug),
    fetchTermsByAuthor(params.slug),
  ]);

  return (
    <>
      <div className="flex flex-col gap-5">
        <ProfileClient
          initialTerms={contributions}
          username={params.slug}
          activeTab="contributes"
          contributeCount={contributions.length}
          postsCount={posts.length}
          profile={profile}
        />
      </div>
      <div className='block sm:hidden'>
        <Footer />
      </div>
    </>
  );
}