import Link from 'next/link';

interface ReferencesSectionProps {
  references: {
    tutorials: Array<{
      external_link: string | null;
      platform: string;
      title: string;
    }>;
    books: Array<{
      external_link: string | null;
      isbn: string;
      authors: string[];
      publisher: string;
      year: string;
      title: string;
    }>;
    academic: Array<{
      external_link: string | null;
      authors: string[];
      year: string;
      title: string;
      doi: string;
    }>;
    opensource: Array<{
      external_link: string | null;
      name: string;
      license: string;
      description: string;
    }>;
  };
}

const ReferencesSection = ({ references }: ReferencesSectionProps) => {
  return (
    <section className="group">
      <h2>
        <span className="text-primary sm:ml-[-20px] mr-2.5 sm:opacity-0 group-hover:opacity-100 transition-opacity">{'#'}</span>
        {'레퍼런스'}
      </h2>
      <div>
        <h3>{'1. Tutorials'}</h3>
        <ul>
          {references.tutorials.map((tutorial, index) => (
            <li key={index}>
              <Link href={tutorial.external_link ?? '#'} target="_blank" rel="noopener noreferrer">{tutorial.title}</Link>
              <div className=''>{tutorial.platform}</div>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3>{'2. Books'}</h3>
        <ul>
          {references.books.map((book, index) => (
            <li key={index}>
              <div>
                <Link href={book.external_link ?? '#'} target="_blank" rel="noopener noreferrer">{book.title}</Link>
              </div>
              <div className=''>{' by '}{book.authors.join(', ')}{'('}{book.year}{', '}{book.publisher}{')'}</div>
              <div className=''>{'ISBN: '}{book.isbn}</div>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3>{'3. Academic'}</h3>
        <ul>
          {references.academic.map((paper, index) => (
            <li key={index}>
              <Link href={paper.external_link ?? '#'} target="_blank" rel="noopener noreferrer">{paper.title}</Link>
              <div className=''>{paper.authors.join(', ')}{' ('}{paper.year}{') '}</div>
              <div className=''>{'DOI: '}{paper.doi}</div>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3>{'4. Open Source'}</h3>
        <ul>
          {references.opensource.map((project, index) => (
            <li key={index}>
              <Link href={project.external_link ?? '#'} target="_blank" rel="noopener noreferrer">{project.name}</Link>
              <div className=''>{project.description}</div>
              <div className=''>{'(License: '}{project.license}{')'}</div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default ReferencesSection;