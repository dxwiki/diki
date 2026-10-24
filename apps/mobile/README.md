# Diki 모바일 앱 (@diki/mobile)

Expo Router 기반 iOS·Android 앱. 저장소 루트의 npm workspaces 로 설치한다.
이번 범위는 용어사전(목록·검색·정렬·필터·최근 본 용어·상세)이다. 학습·면접·로그인은 준비 중 화면만 있다.

## 설치

```bash
npm install                      # 저장소 루트에서. postinstall 이 MathJax 자산을 assets/mathjax 로 복사한다
```

## 실행

```bash
cd apps/mobile
npx expo start                   # Expo Go 로 QR 스캔
npx expo start --ios             # iOS 시뮬레이터 (Xcode 필요)
npx expo start --android         # Android 에뮬레이터 (Android Studio 필요)
```

기기의 Expo Go 가 SDK 58 을 지원해야 한다.

## 콘텐츠

- 앱은 설치본 스냅샷(`assets/content/terms.json`·`version.json`)으로 시작하고, 웹의 `/data/version.json` 이 바뀌면 `/data/terms.json` 을 받아 기기에 저장한다.
- 시작 시 1회, 앱으로 돌아왔을 때 마지막 확인 후 1시간이 지났으면 확인한다. 실패하면 알리지 않고 기존 콘텐츠를 쓴다.
- 콘텐츠 주소는 기본 `https://www.diki.kr` 이고 `EXPO_PUBLIC_CONTENT_BASE_URL` 로 바꾼다.

```bash
# 저장소 루트에서 npm run export-public-data 후 npm run dev 로 웹을 띄운 뒤
EXPO_PUBLIC_CONTENT_BASE_URL=http://localhost:3000 npx expo start --ios
EXPO_PUBLIC_CONTENT_BASE_URL=http://10.0.2.2:3000 npx expo start --android   # Android 에뮬레이터는 10.0.2.2
```

### 설치본 스냅샷 갱신

```bash
npm run export-public-data       # 저장소 루트: src/data/terms.json → public/data
npm run --workspace @diki/mobile sync-content    # public/data → apps/mobile/assets/content
npm run --workspace @diki/mobile check:snapshot
```

스냅샷은 저장소에 포함한다. `src/data` 는 git 에서 무시되므로 새로 받은 저장소에서는 `npm run fetch-terms` 가 먼저 필요하다.

## 확인 명령

```bash
npx tsc --noEmit
npm run check:theme              # theme/colors.json 과 src/app/globals.css 색 변수 비교
npm run check:screens            # 탭·화면 구성 정적 검사
npm run check:react              # react·react-native 가 앱 쪽 한 벌로만 해석되는지
npm run check:snapshot           # 설치본 스냅샷 형식·버전
npm run check:mathjax            # MathJax 설치본 자산
npx expo export --platform all --output-dir dist
```

공용 로직 테스트는 저장소 루트에서 `npm run --workspace @diki/core test:<parity|content|listing|recent|app-parity|detail|markdown>` 로 실행한다.

## React 버전

웹(루트)은 React 18, 앱은 Expo SDK 58 의 React 19.3 / React Native 0.88 을 쓴다.
npm 이 앱 쪽 react·react-native 를 `apps/mobile/node_modules` 에 두고, `metro.config.js` 가 두 패키지의 해석을 이 사본으로 고정한다.

## 오프라인 확인

Expo Go 개발 모드는 JS·자산을 개발 서버에서 받으므로 완전한 비행기 모드 확인은 릴리스 빌드(`npx expo run:ios --configuration Release` 등)가 필요하다. 개발 모드에서는 콘텐츠 주소를 닿지 않는 주소로 바꿔 같은 분기를 확인한다.
