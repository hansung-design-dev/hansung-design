import { useKakaoLoader as useKakaoLoaderOrigin } from 'react-kakao-maps-sdk';
import { useEffect, useState, useRef } from 'react';
// 참고 https://apis.map.kakao.com/web/guide/
export default function useKakaoLoader() {
  const appkey = process.env.NEXT_PUBLIC_KAKAO_KEY || '';
  const [isManualLoading, setIsManualLoading] = useState(false);
  const manualLoadAttempted = useRef(false);

  // 디버깅을 위한 로그
  console.log('🔍 KakaoMap AppKey:', appkey ? '설정됨' : '설정되지 않음');
  console.log(
    '🔍 Current domain:',
    typeof window !== 'undefined' ? window.location.hostname : 'SSR'
  );
  console.log('🔍 Environment:', process.env.NODE_ENV);
  console.log('🔍 AppKey length:', appkey.length);
  console.log(
    '🔍 Full URL:',
    typeof window !== 'undefined' ? window.location.href : 'SSR'
  );
  console.log(
    '🔍 User Agent:',
    typeof window !== 'undefined' ? window.navigator.userAgent : 'SSR'
  );

  // 수동으로 카카오맵 SDK 로드하는 함수
  const loadKakaoMapSDK = () => {
    if (
      typeof window === 'undefined' ||
      isManualLoading ||
      manualLoadAttempted.current
    )
      return;

    manualLoadAttempted.current = true;
    setIsManualLoading(true);
    console.log('🔍 수동으로 카카오맵 SDK 로드 시도...');

    // 이미 로드되어 있는지 확인
    if (window.kakao && window.kakao.maps) {
      console.log('✅ 카카오맵 SDK 이미 로드됨');
      setIsManualLoading(false);
      return;
    }

    // 기존 스크립트 태그가 있는지 확인하고 제거
    const existingScript = document.querySelector(
      'script[src*="dapi.kakao.com"]'
    );
    if (existingScript) {
      existingScript.remove();
      console.log('🔍 기존 카카오맵 스크립트 제거됨');
    }

    // 스크립트 태그 생성
    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${appkey}&autoload=false&libraries=clusterer,drawing,services`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      console.log('✅ 카카오맵 SDK 스크립트 로드 성공');
      // SDK 초기화
      if (window.kakao) {
        window.kakao.maps.load(() => {
          console.log('✅ 카카오맵 SDK 초기화 완료');
          setIsManualLoading(false);
        });
      }
    };

    script.onerror = (error) => {
      console.error('❌ 카카오맵 SDK 스크립트 로드 실패:', error);
      console.error('❌ 스크립트 URL:', script.src);
      setIsManualLoading(false);
    };

    document.head.appendChild(script);
  };

  // 기본 Hook 사용 (react-kakao-maps-sdk) - 하지만 실패할 경우를 대비
  try {
    useKakaoLoaderOrigin({
      appkey: appkey,
      libraries: ['clusterer', 'drawing', 'services'],
    });
  } catch (error) {
    console.error('❌ react-kakao-maps-sdk 로더 실패:', error);
  }

  useEffect(() => {
    // SSR 환경에서는 추가 로직 스킵
    if (typeof window === 'undefined') {
      console.log('🔍 SSR 환경에서 카카오맵 로더 스킵');
      return;
    }

    // API 키가 없으면 에러 로그만 출력
    if (!appkey) {
      console.error('❌ NEXT_PUBLIC_KAKAO_KEY가 설정되지 않았습니다.');
      console.error('❌ 환경변수 설정을 확인해주세요.');
      console.error(
        '❌ 배포 환경에서 환경변수가 제대로 설정되었는지 확인하세요.'
      );
      return;
    }

    // 카카오맵 SDK 로딩 상태 확인
    const checkSDKLoading = () => {
      console.log('🔍 카카오맵 SDK 로딩 상태 확인 중...');
      console.log('🔍 window.kakao 존재:', !!window.kakao);
      console.log(
        '🔍 window.kakao.maps 존재:',
        !!(window.kakao && window.kakao.maps)
      );

      if (window.kakao && window.kakao.maps) {
        console.log('✅ 카카오맵 SDK 로딩 완료');
        console.log('🔍 SDK 로딩 성공 - 지도 기능 사용 가능');
      } else {
        console.log('⏳ 카카오맵 SDK 아직 로딩 중...');
        // 10초 후에도 로딩되지 않으면 수동 로드 시도 (기존 3초에서 10초로 늘림)
        setTimeout(() => {
          if (!window.kakao || !window.kakao.maps) {
            console.log('🔍 자동 로딩 실패, 수동 로딩 시도...');
            loadKakaoMapSDK();
          }
        }, 10000);
      }
    };

    // 1초 후 SDK 로딩 상태 확인
    setTimeout(checkSDKLoading, 1000);

    console.log('✅ 카카오맵 로더 초기화 완료');
  }, [appkey, isManualLoading, loadKakaoMapSDK]);
}
