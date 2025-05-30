import { ko } from 'date-fns/locale';
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import BaseDatePicker from '@/components/ui/BaseDatePicker';

interface ModifiedDateFilterProps {
  activeModal: string | null | undefined;
  handleFilterClick: (modalName: string | null)=> void;
  modifiedDateRange: [string | null, string | null];
  hasInteractedModified: boolean;
  handleDateChange: (dates: [Date | null, Date | null], type: 'published' | 'modified')=> void;
  formatDateRange: (range: [string | null, string | null])=> string;
}

const ModifiedDateFilter = ({
  activeModal,
  handleFilterClick,
  modifiedDateRange,
  hasInteractedModified,
  handleDateChange,
  formatDateRange,
}: ModifiedDateFilterProps) => {
  const [isMonthYearPickerVisible, setIsMonthYearPickerVisible] = useState(false);

  const getDateFromString = (dateString: string | null): Date | null => {
    return dateString ? new Date(dateString) : null;
  };

  const startDate = getDateFromString(modifiedDateRange[0]);
  const endDate = getDateFromString(modifiedDateRange[1]);

  const handleMonthYearChange = (dates: [Date | null, Date | null]) => {
    if (!dates[0]) return;

    if (!dates[1]) {
      const startDate = new Date(dates[0].getFullYear(), dates[0].getMonth(), 1);
      handleDateChange([startDate, null], 'modified');
      return;
    }
    const startDate = new Date(dates[0].getFullYear(), dates[0].getMonth(), 1);
    const endDate = new Date(dates[1].getFullYear(), dates[1].getMonth() + 1, 0);

    handleDateChange([startDate, endDate], 'modified');
    setIsMonthYearPickerVisible(false);
    handleFilterClick(null);
  };

  const handleMonthYearPickerToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isMonthYearPickerVisible) {
      handleDateChange([null, null], 'modified');
    }
    setIsMonthYearPickerVisible(!isMonthYearPickerVisible);
  };

  const handleDatePickerChange = (dates: [Date | null, Date | null]) => {
    event?.stopPropagation();

    if (isMonthYearPickerVisible) {
      handleMonthYearChange(dates);
    } else {
      handleDateChange([
        dates[0] || null,
        dates[1] || null,
      ], 'modified');

      if (dates[0] && dates[1]) {
        handleFilterClick(null);
      }
    }
  };

  return (
    <div
      onClick={() => handleFilterClick('modifiedDate')}
      className={`group hidden lg:flex justify-between items-center py-3 pl-6 pr-3 rounded-full cursor-pointer relative
        before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-8 before:w-px before:bg-gray2
        ${ activeModal === 'modifiedDate' ? 'before:bg-primary' : '' }
        ${ activeModal === 'publishedDate' ? 'before:bg-primary' : '' }
        `}
    >
      <div className='flex flex-col group-hover:cursor-pointer'>
        <label htmlFor="modifiedDate" className={`text-[13px] text-main group-hover:cursor-pointer group-hover:text-primary ${ activeModal === 'modifiedDate' ? 'text-primary' : '' }`}>
          {'수정일'}
        </label>
        <span className={`${
          hasInteractedModified ? 'text-main' : 'text-gray1'
        } group-hover:cursor-pointer text-sm truncate`}
        >
          {formatDateRange(modifiedDateRange)}
        </span>
      </div>
      {activeModal === 'modifiedDate' && (
        <div className="filter-modal absolute top-full right-0 mt-2 w-64 border border-primary bg-background shadow-lg dark:shadow-gray5 rounded-lg p-3.5 z-10">
          <div className="flex justify-center">
            <BaseDatePicker
              selected={startDate}
              onChange={handleDatePickerChange}
              startDate={startDate}
              endDate={endDate}
              selectsRange={true}
              calendarClassName="dark:bg-background"
              locale={ko}
              inline
              showMonthYearPicker={isMonthYearPickerVisible}
              dateFormat="MM/yyyy"
              renderCustomHeader={({
                date,
                decreaseMonth,
                increaseMonth,
                prevMonthButtonDisabled,
                nextMonthButtonDisabled,
                decreaseYear,
                increaseYear,
                prevYearButtonDisabled,
                nextYearButtonDisabled,
              }) => (
                <div className="flex justify-between items-center px-2">
                  {!isMonthYearPickerVisible ? (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          decreaseMonth();
                        }}
                        disabled={prevMonthButtonDisabled}
                        type="button"
                        className="p-1 text-primary"
                      >
                        <ChevronLeft />
                      </button>

                      <div
                        onClick={(e) => {
                          handleMonthYearPickerToggle(e);
                        }}
                        className="cursor-pointer font-semibold text-main text-sm"
                      >
                        {new Intl.DateTimeFormat('ko', {
                          year: 'numeric',
                          month: 'long',
                        }).format(date)}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          increaseMonth();
                        }}
                        disabled={nextMonthButtonDisabled}
                        type="button"
                        className="p-1 text-primary"
                      >
                        <ChevronRight />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          decreaseYear();
                        }}
                        disabled={prevYearButtonDisabled}
                        type="button"
                        className="p-1 text-primary"
                      >
                        <ChevronLeft />
                      </button>

                      <div className="font-semibold text-main text-sm">
                        {date.getFullYear()}{'년'}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          increaseYear();
                        }}
                        disabled={nextYearButtonDisabled}
                        type="button"
                        className="p-1 text-primary"
                      >
                        <ChevronRight />
                      </button>
                    </>
                  )}
                </div>
              )}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ModifiedDateFilter;