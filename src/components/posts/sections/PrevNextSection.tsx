import { getTermDataByID } from '@/utils/fetchData';
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
    <div className="grid grid-cols-2 my-[-16px]">
      {prevTerm && (
        <Link href={`${ prevTerm.url }`} className='group min-h-20 flex flex-col justify-center col-start-1 border border-light border-r-0 p-2 hover:no-underline rounded-l-md hover:bg-gray5 hover:border-primary hover:border-r -mr-px z-10'>
          <div className='flex items-center gap-1 font-normal'>
            <ChevronLeft className='size-4 sm:size-5 text-light group-hover:text-sub' />
            <span className='text-[13px] sm:text-sm text-primary'>{'이전 포스트'}</span>
          </div>
          <div className='flex items-center gap-1 mt-1 ml-2 text-sm sm:text-base text-sub pb-1'>
            <span className='font-medium text-sub group-hover:text-primary group-hover:underline underline-offset-4 group-hover:decoration-primary'>
              {prevTerm.title?.ko}
              <span className='font-medium break-all text-sub group-hover:text-primary'>{'('}{prevTerm.title?.en}{')'}</span>
            </span>
          </div>
        </Link>
      )}
      {nextTerm && (
        <Link href={`${ nextTerm.url }`} className='group min-h-20 col-start-2 flex flex-col justify-center items-end border border-light p-2 hover:no-underline rounded-r-md hover:bg-gray5 hover:border-primary hover:z-20'>
          <div className='flex items-center gap-1 font-normal'>
            <span className='text-[13px] sm:text-sm text-primary'>{'다음 포스트'}</span>
            <ChevronRight className='size-4 sm:size-5 text-light group-hover:text-sub' />
          </div>
          <div className='flex justify-end items-center gap-1 mt-1 mr-1.5 text-primary text-sm sm:text-base pb-1'>
            <span className='font-medium text-sub group-hover:text-primary group-hover:underline underline-offset-4 group-hover:decoration-primary'>
              {nextTerm.title?.ko}
              <span className='font-medium break-all text-sub group-hover:text-primary'>{'('}{nextTerm.title?.en}{')'}</span>
            </span>
          </div>
        </Link>
      )}
    </div>
  );
};

export default PrevNextSection;