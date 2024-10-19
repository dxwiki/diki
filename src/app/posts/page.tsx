import Link from 'next/link';
import { fetchTermsData } from '@/utils/termsData';
import { TermData } from '@/types';

export default async function PostsPage() {
  const termsData: TermData[] = await fetchTermsData();

  return (
    <>
      <h1 className='mb-12'>{'검색결과'}</h1>
      {termsData.length > 0 ? (
        <ul>
          {termsData.map((term) => (
            <li key={term.id}>
              <Link href={term.url}>
                <strong>{term.title.ko}</strong>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>{'No terms found.'}</p>
      )}
    </>
  );
}