import MarkdownContent from '@/components/posts/MarkdownContent';
import { Usecase } from '@/types';

interface UsecaseSectionProps {
  usecase: Usecase
}

const UsecaseSection = ({ usecase }: UsecaseSectionProps) => {
  return (
    <section className="group-section">
      <h2>
        <span className="text-primary sm:ml-[-20px] mr-2.5 sm:opacity-0 group-section-title transition-opacity">{'#'}</span>
        {'사용 사례'}
      </h2>
      <div className="flex flex-wrap gap-1 mb-3">
        {usecase.industries?.map((tag, index) => (
          <span
            key={index}
            className="tag-button-no-link text-sub text-sm mb-1"
          >
            {tag}
          </span>
        ))}
      </div>
      <div className='grid grid-cols-[auto_1fr] items-start gap-2'>
        <span className='tag-button-no-link flex justify-center rounded-lg text-sm text-sub mt-px pl-2.5 pr-[9px] bg-gray5'>
          {'개요'}
        </span>
        <MarkdownContent content={usecase.description ?? ''} />
        <span className='tag-button-no-link flex justify-center rounded-lg text-sm text-sub mt-px pl-2.5 pr-[9px] bg-gray5'>
          {'사례'}
        </span>
        <MarkdownContent content={usecase.example ?? ''} />
      </div>
    </section>
  );
};

export default UsecaseSection;