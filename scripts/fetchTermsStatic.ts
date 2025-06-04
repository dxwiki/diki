import { firestore } from '../src/libs/firebaseAdmin';
import { TermData } from '../src/types';
import { transformToSlug } from '../src/utils/filters';
import fs from 'fs';
import path from 'path';

async function fetchAndSaveTerms() {
  try {
    console.log('Fetching terms from Firestore...');
    const termsCollection = await firestore.collection('terms').get();

    const termsData = termsCollection.docs.map((doc) => {
      const data = doc.data();
      const urlPath = transformToSlug(data.title.en);
      return {
        url: `/posts/${ urlPath }`,
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
    })
      .filter((term) => term.publish !== false);

    // 데이터 디렉토리가 없으면 생성
    const dataDir = path.join(process.cwd(), 'src', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // JSON 파일로 저장
    fs.writeFileSync(
      path.join(dataDir, 'terms.json'),
      JSON.stringify(termsData, null, 2)
    );

    console.log(`Successfully saved ${ termsData.length } terms to src/data/terms.json`);
  } catch (error) {
    console.error('Error fetching terms:', error);
    process.exit(1);
  }
}

fetchAndSaveTerms();