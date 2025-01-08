import LogoAnimation from '@/components/common/LogoAnimation';
import SearchInput from '@/components/search/SearchInput';
import RecommendTerms from '@/components/posts/RecommendTerms';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import AdContainer from '@/components/common/AdContainer';

export default async function Home() {
  return (
    <>
      <div className="relative min-h-[calc(100vh_-600px)] flex flex-col justify-end items-end sm:mx-10 md:mx-40 overflow-hidden">
        <LogoAnimation fontSize='10vw' />
        <div className='flex gap-1.5'>
          <Link href='/posts' className='flex items-center border-0 no-underline text-gray1 font-normal hover:text-accent hover:font-semibold'>
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
          <RecommendTerms />
        </div>
        <AdContainer
          slot="6880591392"
          format="rspv"
          className="w-full mt-10 h-[100px]"
        />
      </div>
    </>
  );
}
