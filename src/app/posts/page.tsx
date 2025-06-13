import { SearchDetailInput } from '@/components/search/SearchDetailInput';
import { Suspense } from 'react';
import PostList from '@/components/posts/PostList';
import Footer from '@/components/common/Footer';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { dikiMetadata } from '@/constants';
import { Metadata } from 'next';
import JsonLdSchema, { generateCollectionPageSchema } from '@/components/meta/JsonLdSchema';

export function generateMetadata(): Metadata {
  return {
    title: '포스트 목록',
    description: '모든 용어와 포스트를 확인할 수 있는 페이지입니다.',
    alternates: {
      canonical: `${ dikiMetadata.url }/posts`,
    },
    openGraph: {
      title: '포스트 목록',
      description: '모든 용어와 포스트를 확인할 수 있는 페이지입니다.',
      url: `${ dikiMetadata.url }/posts`,
      siteName: dikiMetadata.title,
      locale: 'ko_KR',
      type: 'website',
      images: [
        {
          url: dikiMetadata.thumbnailURL,
          width: 1200,
          height: 630,
          alt: '포스트 목록',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: '포스트 목록',
      description: '모든 용어와 포스트를 확인할 수 있는 페이지입니다.',
      images: [dikiMetadata.thumbnailURL],
    },
  };
}

export function generateStaticParams() {
  return [];
}

export default async function PostsPage() {
  return (
    <div className="relative">
      <JsonLdSchema
        id="collection-page-schema"
        schema={generateCollectionPageSchema(
          '포스트 목록',
          '모든 용어와 포스트를 확인할 수 있는 페이지입니다.',
          `${ dikiMetadata.url }/posts`
        )}
      />
      <Suspense fallback={<LoadingSpinner />}>
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