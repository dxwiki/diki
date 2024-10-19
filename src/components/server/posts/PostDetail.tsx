import { getTermData } from '@/utils/termsData';
import { notFound } from 'next/navigation';

interface Props {
  slug: string
}

const PostDetail = async ({ slug }: Props) => {
  const term = await getTermData(slug);

  if (!term) {
    notFound();
  }

  return (
    <>
      <h1 className="text-3xl font-bold mb-5">{term.title.ko}</h1>

      <section className="mb-5">
        <h2 className="text-2xl font-semibold mb-3">{'Title'}</h2>
        <p><strong>{'English:'}</strong> {term.title.en}</p>
        <p><strong>{'Korean:'}</strong> {term.title.ko}</p>
        <p><strong>{'Other:'}</strong> {term.title.etc.join(', ')}</p>
      </section>

      <section className="mb-5">
        <h2 className="text-2xl font-semibold mb-3">{'Description'}</h2>
        <p><strong>{'Short:'}</strong> {term.description.short}</p>
        <p><strong>{'Full:'}</strong> {term.description.full}</p>
      </section>

      <section className="mb-5">
        <h2 className="text-2xl font-semibold mb-3">{'Usecase'}</h2>
        <p><strong>{'Description:'}</strong> {term.usecase.description}</p>
        <p><strong>{'Example:'}</strong> {term.usecase.example}</p>
        <p><strong>{'Industries:'}</strong> {term.usecase.industries.join(', ')}</p>
      </section>

      <section className="mb-5">
        <h2 className="text-2xl font-semibold mb-3">{'Relevance'}</h2>
        <div>
          <h3 className="text-xl font-semibold">{'Analyst'}</h3>
          <p><strong>{'Score:'}</strong> {term.relevance.analyst.score}</p>
          <p><strong>{'Description:'}</strong> {term.relevance.analyst.description}</p>
        </div>
        <div>
          <h3 className="text-xl font-semibold">{'Engineer'}</h3>
          <p><strong>{'Score:'}</strong> {term.relevance.engineer.score}</p>
          <p><strong>{'Description:'}</strong> {term.relevance.engineer.description}</p>
        </div>
        <div>
          <h3 className="text-xl font-semibold">{'Scientist'}</h3>
          <p><strong>{'Score:'}</strong> {term.relevance.scientist.score}</p>
          <p><strong>{'Description:'}</strong> {term.relevance.scientist.description}</p>
        </div>
      </section>

      <section className="mb-5">
        <h2 className="text-2xl font-semibold mb-3">{'Difficulty'}</h2>
        <p><strong>{'Level:'}</strong> {term.difficulty.level}</p>
        <p><strong>{'Description:'}</strong> {term.difficulty.description}</p>
      </section>

      <section className="mb-5">
        <h2 className="text-2xl font-semibold mb-3">{'Tags'}</h2>
        <p>{term.tags.join(', ')}</p>
      </section>

      <section className="mb-5">
        <h2 className="text-2xl font-semibold mb-3">{'Terms'}</h2>
        <ul>
          {term.terms.map((item, index) => (
            <li key={index}>
              <strong>{item.term}{':'}</strong> {item.description}
              {'('}<a href={item.link} target="_blank" rel="noopener noreferrer">{'Link'}</a>{')'}
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-5">
        <h2 className="text-2xl font-semibold mb-3">{'Publish Status'}</h2>
        <p>{term.publish ? 'Published' : 'Not Published'}</p>
      </section>

      <section className="mb-5">
        <h2 className="text-2xl font-semibold mb-3">{'Metadata'}</h2>
        <p><strong>{'Contributors:'}</strong> {term.metadata.contributors}</p>
        <p><strong>{'Authors:'}</strong> {term.metadata.authors}</p>
        <p><strong>{'Created at:'}</strong> {term.metadata.created_at}</p>
        <p><strong>{'Updated at:'}</strong> {term.metadata.updated_at}</p>
        <p><strong>{'Last reviewed:'}</strong> {term.metadata.last_reviewed}</p>
      </section>

      <section className="mb-5">
        <h2 className="text-2xl font-semibold mb-3">{'References'}</h2>
        <div>
          <h3 className="text-xl font-semibold">{'Tutorials'}</h3>
          <ul>
            {term.references.tutorials.map((tutorial, index) => (
              <li key={index}>
                <a href={tutorial.link} target="_blank" rel="noopener noreferrer">{tutorial.title}</a>
                {'- '}{tutorial.platform}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-xl font-semibold">{'Books'}</h3>
          <ul>
            {term.references.books.map((book, index) => (
              <li key={index}>
                <strong>{book.title}</strong>{' by '}{book.authors.join(', ')}
                {'('}{book.year}{', '}{book.publisher}{') ISBN: '}{book.isbn}
                <a href={book.link} target="_blank" rel="noopener noreferrer">{'Link'}</a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-xl font-semibold">{'Academic'}</h3>
          <ul>
            {term.references.academic.map((paper, index) => (
              <li key={index}>
                {paper.authors.join(', ')}{' ('}{paper.year}{'). '}{paper.title}{'. DOI: '}{paper.doi}
                <a href={paper.link} target="_blank" rel="noopener noreferrer">{'Link'}</a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-xl font-semibold">{'Open Source'}</h3>
          <ul>
            {term.references.opensource.map((project, index) => (
              <li key={index}>
                <strong>{project.name}</strong>{' - '}{project.description}
                {'(License: '}{project.license}{')'}
                <a href={project.link} target="_blank" rel="noopener noreferrer">{'Link'}</a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
};

export default PostDetail;