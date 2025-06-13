import LogoAnimation from '@/components/common/LogoAnimation';
import SearchInput from '@/components/search/SearchInput';
import RecentTerms from '@/components/posts/RecentTerms';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Metadata } from 'next';
import { dikiMetadata } from '@/constants';
import JsonLdSchema, { generateWebSiteSchema, generateOrganizationSchema } from '@/components/meta/JsonLdSchema';
// import AdContainer from '@/components/common/AdContainer';

export function generateMetadata(): Metadata {
  return {
    title: dikiMetadata.title,
    description: dikiMetadata.description,
    alternates: {
      canonical: dikiMetadata.url,
    },
    keywords: ['디키', 'Diki', '데이터사전', '데이터용어', '데이터위키', '용어사전'],
    openGraph: {
      title: dikiMetadata.title,
      description: dikiMetadata.description,
      url: dikiMetadata.url,
      siteName: dikiMetadata.title,
      locale: 'ko_KR',
      type: 'website',
      images: [
        {
          url: dikiMetadata.thumbnailURL,
          width: 1200,
          height: 630,
          alt: dikiMetadata.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: dikiMetadata.title,
      description: dikiMetadata.description,
      images: [dikiMetadata.thumbnailURL],
    },
  };
}

export default async function Home() {
  return (
    <>
      <JsonLdSchema
        id="website-schema"
        schema={generateWebSiteSchema()}
      />
      <JsonLdSchema
        id="organization-schema"
        schema={generateOrganizationSchema()}
      />
      <div className="relative min-h-[calc(100vh_-600px)] flex flex-col justify-end items-end sm:mx-10 md:mx-40 overflow-hidden">
        <LogoAnimation fontSize='10vw' />
        <div className='flex gap-1.5'>
          <Link href='/posts' className='flex items-center border-0 no-underline text-gray1 font-normal hover:text-primary hover:font-semibold'>
            {'더보기'}
            <ChevronRight className='size-3.5' />
          </Link>
        </div>
      </div>
      <div className='max-w-3xl sm:mx-10 md:mx-40 mx-auto'>
        <div className='relative w-full'>
          <div className='w-full absolute my-4 z-10'>
            <SearchInput />
          </div>
          <div className='w-full absolute top-20'>
            <RecentTerms />
          </div>
          {/* <div className='w-full absolute top-48'>
            <AdContainer
              slot="7776882810"
              format="auto"
              className="w-full min-h-[160px]"
            />
          </div> */}
        </div>
      </div>
    </>
  );
}
