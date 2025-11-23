import MarkdownContent from '../MarkdownContent';

interface DescriptionSectionProps {
  description: string;
  isMobilePreview?: boolean;
}

const DescriptionSection = ({ description, isMobilePreview = false }: DescriptionSectionProps) => {
  return (
    <section className='group'>
      <h2 className='flex items-center'>
        <span className={`text-primary mr-2.5 transition-opacity ${ isMobilePreview ? '' : 'sm:ml-[-20px] sm:opacity-0 group-hover:opacity-100' }`}>{'#'}</span>
        {'개념'}
      </h2>
      {description ? (
        <MarkdownContent content={description} />
      ) : (
        <p className="text-sub">{'본문을 작성하세요.'}</p>
      )}
    </section>
  );
};

export default DescriptionSection;