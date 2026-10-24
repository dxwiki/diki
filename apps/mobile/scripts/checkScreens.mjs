import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];

const read = (rel) => {
  const file = path.join(appRoot, rel);
  if (!fs.existsSync(file)) {
    failures.push(`${ rel } 없음`);
    return '';
  }
  return fs.readFileSync(file, 'utf8');
};

const TABS = [
  { name: 'index', title: '홈' },
  { name: 'learn', title: '학습' },
  { name: 'interview', title: '면접' },
  { name: 'terms', title: '용어사전' },
  { name: 'me', title: '내 정보' },
];

const tabLayout = read('app/(tabs)/_layout.tsx');
const screens = [...tabLayout.matchAll(/<Tabs\.Screen\s+name=\{?'([^']+)'\}?\s+options=\{\{\s*title:\s*'([^']+)'/g)]
  .map((m) => ({ name: m[1], title: m[2] }));
const got = screens.map((s) => `${ s.name }:${ s.title }`).join(', ');
const want = TABS.map((s) => `${ s.name }:${ s.title }`).join(', ');
if (got !== want) failures.push(`탭 구성·순서 다름 (기대 ${ want } / 실제 ${ got })`);

for (const tab of TABS) read(`app/(tabs)/${ tab.name }.tsx`);

const comingSoon = read('components/ui/ComingSoon.tsx');
if (!comingSoon.includes('준비 중')) failures.push('ComingSoon 에 준비 중 안내가 없다');
if (!/openWeb\(\s*webPath\s*\)/.test(comingSoon)) failures.push('ComingSoon 버튼이 openWeb 으로 웹을 열지 않는다');

for (const [file, webPath] of [['app/(tabs)/learn.tsx', '/learn'], ['app/(tabs)/interview.tsx', '/interview']]) {
  const src = read(file);
  if (!/<ComingSoon\b/.test(src)) failures.push(`${ file } 가 준비 중 화면을 쓰지 않는다`);
  if (!src.includes(`webPath={'${ webPath }'}`)) failures.push(`${ file } 에 ${ webPath } 링크가 없다`);
}

const links = read('lib/links.ts');
if (!/Linking\.openURL\(/.test(links)) failures.push('lib/links.ts 가 Linking.openURL(시스템 브라우저)을 쓰지 않는다');
const config = read('lib/config.ts');
if (!config.includes('https://www.diki.kr')) failures.push('lib/config.ts WEB_BASE_URL 이 https://www.diki.kr 이 아니다');

const me = read('app/(tabs)/me.tsx');
if (!me.includes('준비 중')) failures.push('내 정보 탭에 로그인 준비 중 안내가 없다');
for (const webPath of ['/login', '/posts/create']) {
  if (!new RegExp(`openWeb\\(\\s*'${ webPath.replace(/\//g, '\\/') }'\\s*\\)`).test(me)) failures.push(`내 정보 탭에 openWeb('${ webPath }') 버튼이 없다`);
}
if (!/<Button\b/.test(me)) failures.push('내 정보 탭이 Button 으로 웹 링크를 보여주지 않는다');
if (!/from\s+'expo-constants'/.test(me) || !/expoConfig\?\.version/.test(me)) failures.push('내 정보 탭이 expo-constants 의 expoConfig.version 으로 앱 버전을 보여주지 않는다');
if (!/useContent\(\)/.test(me)) failures.push('내 정보 탭이 useContent 로 현재 콘텐츠를 읽지 않는다');
for (const field of ['version.contentVersion', 'version.generatedAt', 'SOURCE_LABELS[source]']) {
  if (!me.includes(field)) failures.push(`내 정보 탭에 ${ field } 표시가 없다`);
}

const rootLayout = read('app/_layout.tsx');
if (!/<ContentProvider>[\s\S]*<Stack\b[\s\S]*<\/ContentProvider>/.test(rootLayout)) failures.push('app/_layout.tsx 가 Stack 을 ContentProvider 로 감싸지 않는다');

if (!/<ContentProvider>[\s\S]*<RecentTermsProvider>[\s\S]*<Stack\b[\s\S]*<\/RecentTermsProvider>[\s\S]*<\/ContentProvider>/.test(rootLayout)) {
  failures.push('app/_layout.tsx 가 ContentProvider → RecentTermsProvider → Stack 순서로 감싸지 않는다');
}

const pkg = JSON.parse(read('package.json') || '{}');
if (!pkg.dependencies?.['@react-native-async-storage/async-storage']) failures.push('package.json 에 @react-native-async-storage/async-storage 의존성이 없다');

const expectIn = (label, src, checks) => {
  for (const [what, test] of checks) {
    const ok = test instanceof RegExp ? test.test(src) : src.includes(test);
    if (!ok) failures.push(`${ label }: ${ what }`);
  }
};

const recent = read('lib/recent/RecentTermsProvider.tsx');
expectIn('lib/recent/RecentTermsProvider.tsx', recent, [
  ['AsyncStorage 키 diki.recentTerms.v1 이 없다', "'diki.recentTerms.v1'"],
  ['AsyncStorage 를 쓰지 않는다', /from\s+'@react-native-async-storage\/async-storage'/],
  ['저장값을 parseRecentIds 로 읽지 않는다', /parseRecentIds\(\s*await\s+AsyncStorage\.getItem\(/],
  ['addRecentTermId 로 추가하지 않는다', 'addRecentTermId('],
  ['resolveRecentTerms 로 현재 콘텐츠에 있는 것만 고르지 않는다', /resolveRecentTerms\(\s*ids\s*,\s*terms\s*\)/],
  ['useContent 로 현재 콘텐츠를 읽지 않는다', 'useContent()'],
  ['AsyncStorage.setItem 으로 저장하지 않는다', 'AsyncStorage.setItem('],
  ['addRecentTerm 을 내보내지 않는다', /addRecentTerm:\s*\(id:\s*number\)\s*=>\s*void/],
]);
const recentIndex = read('lib/recent/index.ts');
expectIn('lib/recent/index.ts', recentIndex, [
  ['RecentTermsProvider·useRecentTerms 를 내보내지 않는다', /RecentTermsProvider[\s\S]*useRecentTerms/],
]);

const home = read('app/(tabs)/index.tsx');
expectIn('홈 탭', home, [
  ['앱 소개 문구가 없다', '용어사전이에요'],
  ['검색 진입이 용어사전 탭으로 가지 않는다', /router\.push\(\{\s*pathname:\s*'\/\(tabs\)\/terms',\s*params:\s*\{\s*focus:/],
  ['최근 본 용어를 쓰지 않는다', /useRecentTerms\(\)[\s\S]*<RecentTerms\b/],
]);

const termsTab = read('app/(tabs)/terms.tsx');
expectIn('용어사전 탭', termsTab, [
  ['useTermListing 결과를 목록으로 보여주지 않는다', /<FlatList[\s\S]*data=\{listing\.results\}/],
  ['항목을 누르면 상세로 이동하지 않는다', /useOpenTerm\(\)[\s\S]*<TermListItem[\s\S]*onPress=\{openTerm\}/],
  ['결과 없음 안내가 초기화와 연결되지 않는다', /ListEmptyComponent=\{<EmptyResult onReset=\{listing\.reset\} \/>\}/],
  ['검색어가 없을 때만 최근 본 용어를 보여주지 않는다', /!listing\.hasQuery\s*\?\s*\(\s*<RecentTerms\b/],
  ['정렬 선택이 없다', /<SortSelector\b[\s\S]*hasQuery=\{listing\.hasQuery\}/],
  ['필터 시트가 없다', '<FilterSheet'],
  ['홈 검색 진입의 focus 파라미터로 검색창에 포커스하지 않는다', /useLocalSearchParams[\s\S]*inputRef\.current\?\.focus\(\)/],
]);

const listingHook = read('components/terms/useTermListing.ts');
expectIn('components/terms/useTermListing.ts', listingHook, [
  ['검색 디바운스가 300ms 가 아니다', /SEARCH_DEBOUNCE_MS\s*=\s*300\b/],
  ['디바운스 타이머가 없다', /setTimeout\([\s\S]*SEARCH_DEBOUNCE_MS\)/],
  ['콘텐츠가 바뀔 때 인덱스를 만들지 않는다', /buildSearchIndex\(terms\);[\s\S]*\},\s*\[terms\]\)/],
  ['listTerms 를 쓰지 않는다', /listTerms\(terms,\s*options\)/],
  ['검색어가 생길 때 관련도가 기본값이 되지 않는다', "setSortType('relevance')"],
  ['난이도 범위를 ranges.LEVEL 로 넘기지 않는다', /ranges\s*=\s*\{\s*LEVEL:/],
  ['수정일 기간을 updatedPeriodRange 로 넘기지 않는다', /updated\s*=\s*updatedPeriodRange\(/],
  ['초기화가 DEFAULT_LISTING 으로 돌아가지 않는다', /reset\s*=\s*useCallback\([\s\S]*DEFAULT_LISTING\.sortType[\s\S]*DEFAULT_LISTING\.sortDirection/],
]);

const sortSelector = read('components/terms/SortSelector.tsx');
expectIn('components/terms/SortSelector.tsx', sortSelector, [
  ...['관련도', '수정일', '난이도', '등록일', '내림차순', '오름차순'].map((label) => [`${ label } 선택지가 없다`, `'${ label }'`]),
  ['관련도를 검색어가 있을 때만 보여주지 않는다', /hasQuery\s*\?\s*SORT_ORDER\s*:\s*SORT_ORDER\.filter\(\(type\)\s*=>\s*type\s*!==\s*'relevance'\)/],
]);

const filterSheet = read('components/terms/FilterSheet.tsx');
expectIn('components/terms/FilterSheet.tsx', filterSheet, [
  ['난이도 1~5 선택지가 없다', /LEVELS\s*=\s*\[1,\s*2,\s*3,\s*4,\s*5\]/],
  ['수정일 기간을 UPDATED_PERIODS 로 그리지 않는다', 'UPDATED_PERIODS.map('],
  ...['전체', '최근 7일', '최근 30일', '최근 90일', '최근 1년'].map((label) => [`${ label } 기간이 없다`, `'${ label }'`]),
]);

const emptyResult = read('components/terms/EmptyResult.tsx');
expectIn('components/terms/EmptyResult.tsx', emptyResult, [
  ['결과 없음 안내가 없다', "'결과 없음'"],
  ['필터 초기화 버튼이 없다', /label=\{'필터 초기화'\}[\s\S]*onPress=\{onReset\}/],
]);

const termPath = read('components/terms/termPath.ts');
expectIn('components/terms/termPath.ts', termPath, [['상세 경로가 /posts/<slug> 가 아니다', '`/posts/${ ']]);
const openTerm = read('components/terms/useOpenTerm.ts');
expectIn('components/terms/useOpenTerm.ts', openTerm, [['router.push(termPath(term)) 로 이동하지 않는다', /router\.push\(termPath\(term\)/]]);

const detailScreen = read('app/posts/[slug].tsx');
expectIn('상세 화면 app/posts/[slug].tsx', detailScreen, [
  ['findTermBySlug 로 용어를 찾지 않는다', /findTermBySlug\(terms,\s*slugValue\)/],
  ['찾을 수 없음 화면이 없다', /if \(!term\)[\s\S]*<NotFound\b/],
  ["용어사전으로 돌아가는 router.replace('/(tabs)/terms') 가 없다", "router.replace('/(tabs)/terms')"],
  ['찾은 용어를 최근 본 용어에 기록하지 않는다', /useRecentTerms\(\)[\s\S]*addRecentTerm\(termId\)/],
  ['TermDetail 로 상세를 그리지 않는다', '<TermDetail'],
]);
expectIn('app/_layout.tsx', rootLayout, [["Stack 에 posts/[slug] 화면이 없다", "name={'posts/[slug]'}"]]);

const notFound = read('components/detail/NotFound.tsx');
expectIn('components/detail/NotFound.tsx', notFound, [
  ['용어를 찾을 수 없음 문구가 없다', "'용어를 찾을 수 없음'"],
  ['용어사전으로 버튼이 없다', /label=\{'용어사전으로'\}[\s\S]*onPress=\{onBack\}/],
]);

const termDetail = read('components/detail/TermDetail.tsx');
const SECTION_COMPONENTS = [
  ['header', '<DetailHeader'],
  ['difficulty', '<DifficultySection'],
  ['description', '<ArticleWebView content={section.content}'],
  ['relatedTerms', '<RelatedTermsSection'],
  ['relevance', '<RelevanceSection'],
  ['usecase', '<UsecaseSection'],
  ['references', '<ReferencesSection'],
  ['prevNext', '<PrevNextSection'],
  ['recommendations', '<RecommendationsSection'],
];
expectIn('components/detail/TermDetail.tsx', termDetail, [
  ['getDetailSections 순서대로 그리지 않는다', /getDetailSections\(term,\s*terms\)[\s\S]*sections\.map\(/],
  ...SECTION_COMPONENTS.map(([type, tag]) => [`${ type } 섹션을 ${ tag } 로 그리지 않는다`, new RegExp(`case '${ type }':[\\s\\S]*?${ tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') }`)]),
  ['관련 용어·태그가 slug 로 앱 상세를 열지 않는다', /onPressTag=\{links\.openSlug\}[\s\S]*onPressTerm=\{links\.openSlug\}/],
  ['참고 자료가 openHref 로 열리지 않는다', 'onOpenLink={links.openHref}'],
  ['이전·다음·추천이 앱 상세를 열지 않는다', /<PrevNextSection[\s\S]*onPressTerm=\{links\.openTerm\}[\s\S]*<RecommendationsSection[\s\S]*onPressTerm=\{links\.openTerm\}/],
]);
const coreDetail = fs.readFileSync(path.join(appRoot, '..', '..', 'packages/core/src/detail.ts'), 'utf8');
const orderMatch = coreDetail.match(/DETAIL_SECTION_ORDER[^=]*=\s*\[([^\]]*)\]/);
const coreOrder = orderMatch ? [...orderMatch[1].matchAll(/'([^']+)'/g)].map((m) => m[1]) : [];
const expectedOrder = SECTION_COMPONENTS.map(([type]) => type);
if (coreOrder.join(',') !== expectedOrder.join(',')) failures.push(`core 상세 섹션 순서가 웹 순서와 다르다 (${ coreOrder.join(',') })`);

const allDetailSrc = ['components/detail', 'app/posts'].flatMap((dir) => {
  const abs = path.join(appRoot, dir);
  return fs.existsSync(abs) ? fs.readdirSync(abs).filter((f) => /\.tsx?$/.test(f)).map((f) => fs.readFileSync(path.join(abs, f), 'utf8')) : [];
}).join('\n');
if (/AdContainer|adsbygoogle|AdMob|BannerAd/i.test(allDetailSrc)) failures.push('상세 화면에 광고가 있다');

const detailLinks = read('components/detail/useDetailLinks.ts');
expectIn('components/detail/useDetailLinks.ts', detailLinks, [
  ['내부 링크가 /posts/<slug> 로 router.push 하지 않는다', /`\/posts\/\$\{ encodeURIComponent\(slug\) \}`[\s\S]*router\.push\(detailPath\(slug\)/],
  ['classifyLink 로 링크를 나누지 않는다', /classifyLink\(href,\s*\{\s*webOrigins:/],
  ['외부 링크를 openExternal(Linking.openURL)로 열지 않는다', /target\.type === 'external'\) void openExternal\(target\.url\)/],
]);

const article = read('components/detail/ArticleWebView.tsx');
expectIn('components/detail/ArticleWebView.tsx', article, [
  ['react-native-webview 를 쓰지 않는다', /from 'react-native-webview'/],
  ['buildArticleHtml 로 HTML 을 만들지 않는다', 'buildArticleHtml({ content, colors, mathJaxScript })'],
  ['parseArticleMessage 로 메시지를 읽지 않는다', 'parseArticleMessage(event.nativeEvent.data)'],
  ['WebView 안 링크를 openHref 로 넘기지 않는다', 'openHref(message.href)'],
  ['onShouldStartLoadWithRequest 로 이동을 막지 않는다', 'onShouldStartLoadWithRequest={isInitialLoad}'],
]);

const richText = read('components/detail/RichText.tsx');
expectIn('components/detail/RichText.tsx', richText, [
  ['needsWebRender 일 때만 WebView 로 그리지 않는다', /needsWebRender\(text\)\)\s*return <ArticleWebView/],
]);
for (const file of ['DifficultySection.tsx', 'RelatedTermsSection.tsx', 'RelevanceSection.tsx', 'UsecaseSection.tsx']) {
  if (!read(`components/detail/${ file }`).includes('<RichText')) failures.push(`components/detail/${ file } 가 마크다운 필드를 RichText 로 그리지 않는다`);
}
const refs = read('components/detail/ReferencesSection.tsx');
for (const label of ['튜토리얼', '참고서적', '연구논문', '오픈소스']) {
  if (!refs.includes(`'${ label }'`)) failures.push(`참고 자료에 ${ label } 묶음이 없다`);
}
if (!/if \(groups\.length === 0\) return null/.test(refs)) failures.push('참고 자료가 비었을 때 숨기지 않는다');

if (!pkg.dependencies?.['react-native-webview']) failures.push('package.json 에 react-native-webview 의존성이 없다');

// 이번 화면의 색은 theme 값만 쓴다
const colorFiles = [
  'app/(tabs)/index.tsx',
  'app/(tabs)/terms.tsx',
  'lib/recent/RecentTermsProvider.tsx',
  'app/posts/[slug].tsx',
  ...['components/terms', 'components/ui', 'components/detail'].flatMap((dir) => {
    const abs = path.join(appRoot, dir);
    return fs.existsSync(abs) ? fs.readdirSync(abs).filter((f) => /\.tsx?$/.test(f)).map((f) => `${ dir }/${ f }`) : [];
  }),
];
for (const rel of colorFiles) {
  const src = read(rel);
  if (/#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/.test(src)) failures.push(`${ rel } 에 theme 밖 색 값이 있다`);
  const named = [...src.matchAll(/\b(?:color|backgroundColor|borderColor|borderTopColor|borderBottomColor|tintColor|placeholderTextColor|selectionColor)\s*[:=]\s*\{?\s*'([^']+)'/g)]
    .map((m) => m[1]).filter((v) => v !== 'transparent');
  if (named.length) failures.push(`${ rel } 에 theme 밖 색 이름이 있다: ${ named.join(', ') }`);
}

const leftovers =['app/(tabs)/two.tsx', 'app/modal.tsx', 'components/EditScreenInfo.tsx', 'components/Themed.tsx', 'constants/Colors.ts'];
for (const rel of leftovers) {
  if (fs.existsSync(path.join(appRoot, rel))) failures.push(`템플릿 예제 파일이 남아 있다: ${ rel }`);
}

if (failures.length) {
  console.error('check:screens 실패');
  for (const f of failures) console.error(`- ${ f }`);
  process.exit(1);
}
console.log(`check:screens 통과 (탭 ${ screens.length }개: ${ got }, 내 정보 탭·ContentProvider·RecentTermsProvider·홈·용어사전 목록·검색·정렬·필터·결과 없음·상세 섹션·링크·찾을 수 없음·색 ${ colorFiles.length }개 파일 확인)`);
