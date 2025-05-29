import MarkdownContent from '../MarkdownContent';
import { MathJaxProvider } from '../MathJaxProvider';

interface DescriptionSectionProps {
  description: string;
}

const DescriptionSection = ({ description }: DescriptionSectionProps) => {
  return (
    <section className='group'>
      <h2 className='flex items-center'>
        <span className="text-primary sm:ml-[-20px] mr-2.5 sm:opacity-0 group-hover:opacity-100 transition-opacity">{'#'}</span>
        {'개념'}
      </h2>
      {description ? (
        <MathJaxProvider>
          <MarkdownContent content={description} />
        </MathJaxProvider>
      ) : (
        <p className="text-sub italic">{'내용이 없습니다.'}</p>
      )}
    </section>
  );
};

export default DescriptionSection;