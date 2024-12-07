import Link from 'next/link';
import { MoveUpRight, ChevronRight } from 'lucide-react';
import { TermData } from '@/types/database';

export default async function RecommendTerms({ terms }: { terms: TermData[] }) {
  const recentTerms = [...terms]
    .sort((a, b) => new Date(b.metadata.updated_at).getTime() - new Date(a.metadata.updated_at).getTime())
    .slice(0, 10);

  return (
    <div className='sm:mx-10 md:mx-40 space-y-1.5 mt-10'>
      <div className='w-full inline-flex justify-between items-center gap-2'>
        <h3 className='font-semibold text-sub'>{'최근 등록된 용어'}</h3>
        <Link href='/posts' className='flex items-center border-0 no-underline text-sub text-sm hover:text-accent hover:font-semibold'>
          {'전체 보기'}
          <ChevronRight className='size-3.5' />
        </Link>
      </div>
      <div className='flex sm:flex-wrap gap-1 sm:gap-2.5 overflow-x-auto sm:overflow-x-visible pb-2 sm:pb-0'>
        {recentTerms.map((term) => (
          <Link
            key={term.url}
            href={`${ term.url }`}
            className='inline-flex items-center text-sub gap-1 px-3 py-2 rounded-lg border border-secondary hover:bg-secondary hover:text-primary transition-colors text-xs sm:text-sm shrink-0 shadow-md'
          >
            {term.title.ko}
            <MoveUpRight className='size-3.5' />
          </Link>
        ))}
      </div>
    </div>
  );
}