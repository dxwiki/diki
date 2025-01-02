import { getTermDataByID } from '@/utils/termsData';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  id: number;
}

const PrevNextSection = async ({ id }: Props) => {
  let prevTerm = await getTermDataByID(id - 1);
  let nextTerm = await getTermDataByID(id + 1);
  if(prevTerm?.id) {
    prevTerm = await getTermDataByID(id - 1);
  }
  if(nextTerm?.id) {
    nextTerm = await getTermDataByID(id + 1);
  }

  return (
    <div className="grid grid-cols-2">
      {prevTerm && (
        <Link href={`${ prevTerm.url }`} className='group col-start-1 bg-gray-500 dark:bg-gray-700 p-2 hover:no-underline'>
          <div className='flex items-center gap-1'>
            <ChevronLeft className='size-5 text-gray-50' />
            <span className='text-sm text-gray-50'>{'이전 포스트'}</span>
          </div>
          <div className='flex items-center gap-1 ml-6 group-hover:underline text-gray-50'>
            <span className='font-semibold text-gray-50'>
              {prevTerm.title?.ko}
              <span className='break-all font-normal text-gray-50'>{'('}{prevTerm.title?.en}{')'}</span>
            </span>
          </div>
        </Link>
      )}
      {nextTerm && (
        <Link href={`${ nextTerm.url }`} className='group col-start-2 flex flex-col items-end border border-gray-500 dark:border-gray-700 p-2 hover:no-underline'>
          <div className='flex items-center gap-1'>
            <span className='text-sm text-accent'>{'다음 포스트'}</span>
            <ChevronRight className='size-5' />
          </div>
          <div className='flex justify-end items-center gap-1 mr-6 group-hover:underline'>
            <span className='font-bold text-accent'>
              {nextTerm.title?.ko}
              <span className='break-all font-normal text-accent'>{'('}{nextTerm.title?.en}{')'}</span>
            </span>
          </div>
        </Link>
      )}
    </div>
  );
};

export default PrevNextSection;