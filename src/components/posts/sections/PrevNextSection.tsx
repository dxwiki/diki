import { getTermDataByID } from '@/utils/termsData';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  id: number;
  lastTermId: number;
}

const PrevNextSection = async ({ id, lastTermId }: Props) => {
  let prevTerm = await getTermDataByID(id - 1);
  let nextTerm = await getTermDataByID(id + 1);
  if(prevTerm?.id) {
    prevTerm = await getTermDataByID(id - 1);
  } else {
    // last term
    prevTerm = await getTermDataByID(lastTermId);
  }
  if(nextTerm?.id) {
    nextTerm = await getTermDataByID(id + 1);
  } else {
    nextTerm = await getTermDataByID(1);
  }

  return (
    <div className="grid grid-cols-2 mt-[-32px]">
      {prevTerm && (
        <Link href={`${ prevTerm.url }`} className='group min-h-20 flex flex-col justify-center col-start-1 bg-secondary p-2 hover:no-underline'>
          <div className='flex items-center gap-1'>
            <ChevronLeft className='size-4 sm:size-5 text-sub' />
            <span className='text-xs sm:text-sm text-sub'>{'이전 포스트'}</span>
          </div>
          <div className='flex items-center gap-1 mt-1 ml-2 group-hover:underline text-sm sm:text-lg text-sub'>
            <span className='font-semibold text-sub '>
              {prevTerm.title?.ko}
              <span className='break-all font-normal text-sub'>{'('}{prevTerm.title?.en}{')'}</span>
            </span>
          </div>
        </Link>
      )}
      {nextTerm && (
        <Link href={`${ nextTerm.url }`} className='group min-h-20 col-start-2 flex flex-col justify-center items-end border border-secondary p-2 hover:no-underline'>
          <div className='flex items-center gap-1'>
            <span className='text-xs sm:text-sm text-primary'>{'다음 포스트'}</span>
            <ChevronRight className='size-4 sm:size-5' />
          </div>
          <div className='flex justify-end items-center gap-1 mt-1 mr-1.5 text-primary text-sm sm:text-lg group-hover:underline'>
            <span className='font-bold text-primary'>
              {nextTerm.title?.ko}
              <span className='break-all font-normal text-primary'>{'('}{nextTerm.title?.en}{')'}</span>
            </span>
          </div>
        </Link>
      )}
    </div>
  );
};

export default PrevNextSection;