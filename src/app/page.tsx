import { firestore } from '../lib/firebaseAdmin';
import { TermData } from '../types';

export default async function HomePage() {
  let termsData: TermData[] = [];

  try {
    // 'terms' 컬렉션에서 모든 문서 가져오기
    const termsCollection = await firestore.collection('terms').get();
    termsData = termsCollection.docs.map((doc) => {
      const data = doc.data();
      return {
        id: data.id,
        usecase: data.usecase,
        relevance: data.relevance,
        difficulty: data.difficulty,
        title: data.title,
        tags: data.tags,
        terms: data.terms,
        publish: data.publish,
        metadata: data.metadata,
        references: data.references,
        description: data.description,
      } as TermData;
    });
  } catch (error) {
    console.error('Error fetching terms:', error);
  }

  return (
    <div>
      <h1>{'Terms Collection Data'}</h1>
      {termsData.length > 0 ? (
        <ul>
          {termsData.map((term) => (
            <li key={term.id}>
              <strong>{term.id}{':'}</strong> {JSON.stringify(term)}
            </li>
          ))}
        </ul>
      ) : (
        <p>{'No data found in terms collection.'}</p>
      )}
    </div>
  );
}
