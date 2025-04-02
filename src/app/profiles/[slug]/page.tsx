import { fetchProfilesData } from '@/utils/fetchData';
import Footer from '@/components/common/Footer';
import { dikiMetadata } from '@/constants';
import { Metadata } from 'next';
import PostCard from '@/components/posts/PostCard';
import { fetchTermsByAuthor } from '@/utils/fetchData';

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
    title: `${ profile.name } 프로필`,
    description: `${ profile.name }님이 작성한 글을 확인할 수 있는 페이지입니다.`,
    openGraph: {
      title: `${ profile.name } 프로필`,
      description: `${ profile.name }님이 작성한 글을 확인할 수 있는 페이지입니다.`,
      url: `${ dikiMetadata.url }/profile/${ params.slug }`,
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
      description: `${ profile.name }님이 작성한 글을 확인할 수 있는 페이지입니다.`,
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

const ProfilePage = async ({ params }: { params: { slug: string } }) => {
  const profiles = await fetchProfilesData();
  const profile = profiles.find((p) => p.username === params.slug);

  if (!profile) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-2xl font-bold">{'프로필을 찾을 수 없습니다'}</h1>
        <p>{'요청하신 프로필을 찾을 수 없습니다.'}</p>
      </div>
    );
  }

  const terms = await fetchTermsByAuthor(params.slug);

  return (
    <>
      <div className="container mx-auto py-10">
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold">{profile.name}{' 님의 포스트'}</h1>
          {terms.length > 0 ? (
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {terms.map((term) => (
                <li key={term.id} className="transition-transform duration-300 hover:-translate-y-2">
                  <PostCard sortType="created" term={term} />
                </li>
              ))}
            </ul>
          ) : (
            <p>{'작성한 글이 없습니다.'}</p>
          )}
        </div>
      </div>
      <div className='block sm:hidden'>
        <Footer />
      </div>
    </>
  );
};

export default ProfilePage;
