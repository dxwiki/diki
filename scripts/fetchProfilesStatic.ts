import { firestore } from '../src/libs/firebaseAdmin';
import { Profile } from '../src/types';
import fs from 'fs';
import path from 'path';

async function fetchAndSaveProfiles() {
  try {
    console.log('Fetching profiles from Firestore...');
    const profilesCollection = await firestore.collection('profiles').get();

    const profilesData = profilesCollection.docs.map((doc) => {
      const data = doc.data();
      return {
        id: data.id,
        email: data.email,
        name: data.name,
        username: data.username,
        role: data.role,
        thumbnail: data.thumbnail,
        social: {
          github: data.social?.github,
          linkedin: data.social?.linkedin,
        },
      } as Profile;
    });

    // 데이터 디렉토리가 없으면 생성
    const dataDir = path.join(process.cwd(), 'src', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // JSON 파일로 저장
    fs.writeFileSync(
      path.join(dataDir, 'profiles.json'),
      JSON.stringify(profilesData, null, 2)
    );

    console.log(`Successfully saved ${ profilesData.length } profiles to src/data/profiles.json`);
  } catch (error) {
    console.error('Error fetching profiles:', error);
    process.exit(1);
  }
}

fetchAndSaveProfiles();