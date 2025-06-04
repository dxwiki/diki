import { TermData, Profile } from '@/types';
import { transformToSlug } from '@/utils/filters';
import { store } from '@/store';
import { setTerms, setLoading as setTermsLoading, setError as setTermsError } from '@/store/termsSlice';
import { setProfiles, setLoading as setProfilesLoading, setError as setProfilesError } from '@/store/profilesSlice';
import fs from 'fs';
import path from 'path';

// 서버 사이드에서 실행되는 함수 (getStaticProps, getServerSideProps 등에서 사용)
let terms: TermData[] = [];
const fetchTermsData = async (): Promise<TermData[]> => {
  store.dispatch(setTermsLoading(true));
  try {
    const filePath = path.join(process.cwd(), 'src', 'data', 'terms.json');
    const fileExists = fs.existsSync(filePath);

    if (fileExists) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const parsedTerms = JSON.parse(fileContent);

      terms = parsedTerms.filter((term: TermData) => term.publish !== false);

      store.dispatch(setTerms(terms));
      store.dispatch(setTermsLoading(false));

      return terms;
    }

    // 파일이 존재하지 않는 경우 빈 배열 반환
    store.dispatch(setTermsLoading(false));
    return [];
  } catch (error) {
    console.error(error);
    store.dispatch(setTermsLoading(false));
    store.dispatch(setTermsError('데이터 로드 실패'));

    return [];
  }
};

const getTermData = async (slug: string): Promise<TermData | undefined> => {
  const termsDataList = await fetchTermsData();
  const term = termsDataList.find((term) =>
    transformToSlug(term.title?.en ?? '') === slug
  );

  return term;
};

const getTermDataByID = async (id: number): Promise<TermData | undefined> => {
  const termsDataList = await fetchTermsData();

  return termsDataList.find((term) => term.id === id);
};

let profiles: Profile[] = [];
const fetchProfilesData = async (): Promise<Profile[]> => {
  store.dispatch(setProfilesLoading(true));
  try {
    const filePath = path.join(process.cwd(), 'src', 'data', 'profiles.json');
    const fileExists = fs.existsSync(filePath);

    if (fileExists) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      profiles = JSON.parse(fileContent);
      // if(!profiles.length) console.log('프로필 데이터가 존재하지 않음');
      store.dispatch(setProfiles(profiles));
      store.dispatch(setProfilesLoading(false));

      return profiles;
    }

    // 파일이 존재하지 않는 경우 빈 배열 반환
    store.dispatch(setProfilesLoading(false));
    return [];
  } catch (error) {
    console.error('Error fetching profiles:', error);
    store.dispatch(setProfilesLoading(false));
    store.dispatch(setProfilesError('프로필 데이터 로드 실패'));
    return [];
  }
};

type FilterType = 'authors' | 'contributors';

// 사용자 관련 글 목록을 가져오는 공통 함수
async function fetchTermsByUser(username: string, filterType: FilterType): Promise<TermData[]> {
  const profilesList = await fetchProfilesData();
  const profile = profilesList.find((p) => p.username === username);

  if (!profile) return [];

  const allTerms = await fetchTermsData();

  if (filterType === 'authors') {
    return allTerms.filter((term) =>
      term.metadata?.authors
      && Array.isArray(term.metadata.authors)
      && term.metadata.authors.includes(profile.username)
    );
  } else {
    return allTerms.filter((term) =>
      term.metadata?.contributors
      && Array.isArray(term.metadata.contributors)
      && term.metadata.contributors.includes(username)
    );
  }
}

async function fetchTermsByAuthor(authorSlug: string): Promise<TermData[]> {
  return fetchTermsByUser(authorSlug, 'authors');
}

async function fetchTermsByContributor(contributorSlug: string): Promise<TermData[]> {
  return fetchTermsByUser(contributorSlug, 'contributors');
}

export { fetchTermsData, getTermData, getTermDataByID, fetchProfilesData, fetchTermsByAuthor, fetchTermsByContributor, fetchTermsByUser };