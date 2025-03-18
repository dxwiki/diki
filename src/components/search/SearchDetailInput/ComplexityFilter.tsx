import Slider from '@/components/ui/Slider';

const levels = ['기초', '초급', '중급', '고급', '전문'];
const relevanceLevels = ['희박', '낮음', '보통', '높음', '밀접'];

interface ComplexRange {
  level: [number, number];
  DS: [number, number];
  DE: [number, number];
  DA: [number, number];
}

interface ComplexityFilterProps {
  activeModal: string | null;
  handleFilterClick: (modalName: string)=> void;
  complexRange: ComplexRange;
  hasInteractedComplex: boolean;
  handleComplexRangeChange: (type: keyof ComplexRange, newRange: [number, number])=> void;
  formatComplexRange: ()=> string;
}

const ComplexityFilter = ({
  activeModal,
  handleFilterClick,
  complexRange,
  hasInteractedComplex,
  handleComplexRangeChange,
  formatComplexRange,
}: ComplexityFilterProps) => {
  return (
    <div
      onClick={() => handleFilterClick('complex')}
      className={`peer/complex group hidden lg:flex flex-col py-3 px-6 rounded-full relative cursor-pointer
        before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-8 before:w-px before:bg-gray2
        ${ activeModal === 'complex' ? 'before:bg-primary' : '' }
        ${ activeModal === 'searchQuery' ? 'before:bg-primary' : '' }
        `}
    >
      <label htmlFor="complex" className={`text-[13px] text-main group-hover:cursor-pointer group-hover:text-primary ${ activeModal === 'complex' ? 'text-primary' : '' }`}>
        {'난이도 / 직무 연관도'}
      </label>
      <span className={`${ hasInteractedComplex ? 'text-main' : 'text-gray1' } group-hover:cursor-pointer text-sm`}>
        {formatComplexRange()}
      </span>
      {activeModal === 'complex' && (
        <div className="filter-modal absolute top-full left-0 mt-2 min-w-72 border border-primary bg-background shadow-lg dark:shadow-gray5 rounded-lg p-4 z-10">
          <div className="flex flex-col pr-4">
            <span className="text-sm font-medium">{'난이도'}</span>
            <div className='flex justify-end mt-[-6px]'>
              <div className='w-[178px]'>
                <Slider
                  displayLevels={levels}
                  range={complexRange.level}
                  onRangeChange={(newRange: [number, number]) => handleComplexRangeChange('level', newRange)}
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-[60px_1fr] items-center pr-4">
            <span className="col-span-2 text-sm font-medium">{'직무 연관도'}</span>
            <span className="text-sm flex justify-center mt-1 ml-[-6px]">{'DA'}</span>
            <Slider
              displayLevels={relevanceLevels}
              range={complexRange.DA}
              onRangeChange={(newRange: [number, number]) => handleComplexRangeChange('DA', newRange)}
            />
            <span className="text-sm flex justify-center mt-1 ml-[-6px]">{'DS'}</span>
            <Slider
              displayLevels={relevanceLevels}
              range={complexRange.DS}
              onRangeChange={(newRange: [number, number]) => handleComplexRangeChange('DS', newRange)}
            />
            <span className="text-sm flex justify-center mt-1 ml-[-6px]">{'DE'}</span>
            <Slider
              displayLevels={relevanceLevels}
              range={complexRange.DE}
              onRangeChange={(newRange: [number, number]) => handleComplexRangeChange('DE', newRange)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplexityFilter;