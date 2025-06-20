import { useKakaoLoader as useKakaoLoaderOrigin } from 'react-kakao-maps-sdk';
// 참고 https://apis.map.kakao.com/web/guide/
export default function useKakaoLoader() {
  const appkey = process.env.NEXT_PUBLIC_KAKAO_KEY || '';

  // 디버깅을 위한 로그
  console.log('KakaoMap AppKey:', appkey ? '설정됨' : '설정되지 않음');
  console.log('Current domain:', window.location.hostname);

  useKakaoLoaderOrigin({
    appkey: appkey,
    libraries: ['clusterer', 'drawing', 'services'],
  });
}
