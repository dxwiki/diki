import { SearchDetailInput } from '@/components/search/SearchDetailInput';
import { Suspense } from 'react';
import PostList from '@/components/posts/PostList';
import Footer from '@/components/common/Footer';
import PostCard from '@/components/posts/PostCard';
import { readPublishedTerms, sortByCreatedDesc } from '@/utils/termsServer';
import { dikiMetadata } from '@/constants';
import { Metadata } from 'next';
import JsonLdSchema, { generateCollectionPageSchema } from '@/components/meta/JsonLdSchema';

export function generateMetadata(): Metadata {
  return {
    title: '데이터 용어 목록',
    description: '머신러닝, 딥러닝, 데이터 엔지니어링, 데이터 분석 용어의 뜻과 개념을 한곳에서 찾아보세요.',
    alternates: {
      canonical: `${ dikiMetadata.url }/posts`,
    },
    openGraph: {
      title: '데이터 용어 목록',
      description: '머신러닝, 딥러닝, 데이터 엔지니어링, 데이터 분석 용어의 뜻과 개념을 한곳에서 찾아보세요.',
      url: `${ dikiMetadata.url }/posts`,
      siteName: dikiMetadata.title,
      locale: 'ko_KR',
      type: 'website',
      images: [
        {
          url: dikiMetadata.thumbnailURL,
          width: 1200,
          height: 630,
          alt: '데이터 용어 목록',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: '데이터 용어 목록',
      description: '머신러닝, 딥러닝, 데이터 엔지니어링, 데이터 분석 용어의 뜻과 개념을 한곳에서 찾아보세요.',
      images: [dikiMetadata.thumbnailURL],
    },
  };
}

export function generateStaticParams() {
  return [];
}

export default async function PostsPage() {
  const firstPage = sortByCreatedDesc(readPublishedTerms()).slice(0, 12);

  return (
    <div className="relative">
      <h1 className="sr-only">{'데이터 용어사전 전체 목록'}</h1>
      <JsonLdSchema
        id="collection-page-schema"
        schema={generateCollectionPageSchema(
          '데이터 용어 목록',
          '머신러닝, 딥러닝, 데이터 엔지니어링, 데이터 분석 용어의 뜻과 개념을 한곳에서 찾아보세요.',
          `${ dikiMetadata.url }/posts`
        )}
      />
      {/* 목록은 브라우저에서 그려지므로, 그 전까지 첫 페이지를 서버 HTML로 보여준다 */}
      <Suspense fallback={(
        <ul className="mt-20 grid gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {firstPage.map((term) => (
            <li key={term.id} className="sm:min-h-[186px]">
              <PostCard sortType="created" term={term} />
            </li>
          ))}
        </ul>
      )}
      >
        <div className='animate-intro relative z-20'>
          <SearchDetailInput />
        </div>
        <div className='animate-introSecond mt-5 z-10'>
          <PostList itemsPerPage={12} />
        </div>
      </Suspense>
      <div className='block sm:hidden'>
        <Footer />
      </div>
    </div>
  );
}