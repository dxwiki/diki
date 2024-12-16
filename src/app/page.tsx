import LogoAnimation from '@/components/common/LogoAnimation';
import SearchInput from '@/components/common/SearchInput';
import RecommendTerms from '@/components/posts/RecommendTerms';
import { fetchTermsData } from '@/utils/termsData';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export default async function Home() {
  const terms = await fetchTermsData();

  return (
    <>
      <div className="relative min-h-[calc(100vh_-600px)] flex flex-col justify-end items-end sm:mx-10 md:mx-40 overflow-hidden">
        <LogoAnimation fontSize='10vw' />
        <div className='flex gap-1.5'>
          <div className='flex items-center gap-1 whitespace-nowrap text-sm sm:text-base md:text-lg'>
            <span className='text-primary font-bold'>{terms.length}</span>
            {' 개의 데이터 용어사전 '}
          </div>
          <Link href='/posts' className='flex items-center border-0 no-underline text-sub text-sm font-normal hover:text-accent hover:font-semibold'>
            {'더보기'}
            <ChevronRight className='size-3.5' />
          </Link>
        </div>
      </div>
      <div className='max-w-3xl sm:mx-10 md:mx-40 mx-auto'>
        <div className='relative my-4 z-20'>
          <SearchInput />
        </div>
        <div className='relative z-10'>
          <RecommendTerms terms={terms} />
        </div>
      </div>
    </>
  );
}
