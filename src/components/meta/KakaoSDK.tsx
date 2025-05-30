import Script from 'next/script';

const KakaoSDK = () => {
  return (
    <Script
      src="https://t1.kakaocdn.net/kakao_js_sdk/2.6.0/kakao.min.js"
      strategy="afterInteractive"
    />
  );
};

export default KakaoSDK;