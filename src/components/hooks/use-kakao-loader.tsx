import { useKakaoLoader as useKakaoLoaderOrigin } from 'react-kakao-maps-sdk';
import { useEffect, useState, useRef, useCallback } from 'react';
// 참고 https://apis.map.kakao.com/web/guide/

export default function useKakaoLoader() {
  const appkey = process.env.NEXT_PUBLIC_KAKAO_KEY || '';
  const [isManualLoading, setIsManualLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const manualLoadAttempted = useRef(false);
  const loadTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 디버깅을 위한 로그 (개발 환경에서만)
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 KakaoMap AppKey:', appkey ? '설정됨' : '설정되지 않음');
    console.log(
      '🔍 Current domain:',
      typeof window !== 'undefined' ? window.location.hostname : 'SSR'
    );
    console.log('🔍 Environment:', process.env.NODE_ENV);
    console.log('🔍 AppKey length:', appkey.length);
  }

  // API 키 유효성 검사
  const validateApiKey = (key: string) => {
    if (!key) {
      console.error('❌ API 키가 설정되지 않았습니다.');
      return false;
    }

    if (key.length < 10) {
      console.warn(
        '⚠️ 카카오맵 API 키가 너무 짧습니다. 올바른 키인지 확인해주세요.'
      );
      return false;
    }

    // 카카오 API 키는 보통 32자리 영숫자
    if (key.length !== 32) {
      console.warn(
        '⚠️ 카카오맵 API 키 길이가 예상과 다릅니다. (예상: 32자리, 실제:',
        key.length,
        '자리)'
      );
    }

    // 영숫자만 포함되어 있는지 확인
    if (!/^[a-zA-Z0-9]+$/.test(key)) {
      console.warn('⚠️ API 키에 영숫자가 아닌 문자가 포함되어 있습니다.');
      return false;
    }

    return true;
  };

  if (appkey && !validateApiKey(appkey)) {
    console.error('❌ 카카오맵 API 키가 유효하지 않습니다.');
  }

  // 수동으로 카카오맵 SDK 로드하는 함수
  const loadKakaoMapSDK = useCallback(async () => {
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

    // API 키 유효성 재확인
    if (!validateApiKey(appkey)) {
      console.error('❌ API 키가 유효하지 않아 로딩을 중단합니다.');
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

    try {
      // 먼저 API 키 유효성을 네트워크로 확인
      const testUrl = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appkey}&autoload=false&libraries=clusterer,drawing,services`;

      console.log('🔍 API 키 유효성 확인 중...');
      const response = await fetch(testUrl, { method: 'HEAD' });

      if (!response.ok) {
        console.error(
          '❌ API 키가 유효하지 않습니다. HTTP 상태:',
          response.status
        );
        console.error(
          '❌ 응답 헤더:',
          Object.fromEntries(response.headers.entries())
        );
        setIsManualLoading(false);
        return;
      }

      console.log('✅ API 키 유효성 확인 완료');

      // 스크립트 태그 생성
      const script = document.createElement('script');
      script.src = testUrl;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        console.log('✅ 카카오맵 SDK 스크립트 로드 성공');
        // SDK 초기화
        if (window.kakao) {
          window.kakao.maps.load(() => {
            console.log('✅ 카카오맵 SDK 초기화 완료');
            setIsManualLoading(false);
            setIsLoaded(true);
          });
        }
      };

      script.onerror = (error) => {
        console.error('❌ 카카오맵 SDK 스크립트 로드 실패:', error);
        console.error('❌ 스크립트 URL:', script.src);
        console.error('❌ API 키 길이:', appkey.length);
        console.error('❌ API 키 앞 10자리:', appkey.substring(0, 10));
        console.error('❌ 현재 도메인:', window.location.hostname);
        console.error('❌ 현재 프로토콜:', window.location.protocol);

        // 네트워크 에러 상세 정보
        if (error && typeof error === 'object' && 'type' in error) {
          console.error('❌ 에러 타입:', (error as Event).type);
        }

        setIsManualLoading(false);
      };

      document.head.appendChild(script);
    } catch (fetchError) {
      console.error('❌ API 키 유효성 확인 실패:', fetchError);
      console.error(
        '❌ 네트워크 연결을 확인하거나 API 키를 다시 확인해주세요.'
      );
      setIsManualLoading(false);
    }
  }, [appkey, isManualLoading]);

  // 기본 Hook 사용 (react-kakao-maps-sdk) - 항상 호출하되, 에러 처리는 useEffect에서
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 react-kakao-maps-sdk 로더 사용 시도');
  }

  useKakaoLoaderOrigin({
    appkey: appkey,
    libraries: ['clusterer', 'drawing', 'services'],
  });

  if (process.env.NODE_ENV === 'development') {
    console.log('✅ react-kakao-maps-sdk 로더 설정 완료');
  }

  useEffect(() => {
    // SSR 환경에서는 추가 로직 스킵
    if (typeof window === 'undefined') {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 SSR 환경에서 카카오맵 로더 스킵');
      }
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

    // 기존 타임아웃 정리
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
    }

    // 카카오맵 SDK 로딩 상태 확인
    const checkSDKLoading = () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 카카오맵 SDK 로딩 상태 확인 중...');
        console.log('🔍 window.kakao 존재:', !!window.kakao);
        console.log(
          '🔍 window.kakao.maps 존재:',
          !!(window.kakao && window.kakao.maps)
        );
      }

      if (window.kakao && window.kakao.maps) {
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ 카카오맵 SDK 로딩 완료');
          console.log('🔍 SDK 로딩 성공 - 지도 기능 사용 가능');
        }
        setIsLoaded(true);
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.log('⏳ 카카오맵 SDK 아직 로딩 중...');
        }
        // 5초 후에도 로딩되지 않으면 수동 로드 시도
        loadTimeoutRef.current = setTimeout(() => {
          if (!window.kakao || !window.kakao.maps) {
            if (process.env.NODE_ENV === 'development') {
              console.log('🔍 자동 로딩 실패, 수동 로딩 시도...');
            }
            loadKakaoMapSDK();
          }
        }, 5000);
      }
    };

    // 1초 후 SDK 로딩 상태 확인
    setTimeout(checkSDKLoading, 1000);

    if (process.env.NODE_ENV === 'development') {
      console.log('✅ 카카오맵 로더 초기화 완료');
    }

    // 클린업 함수
    return () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
    };
  }, [appkey, isManualLoading, loadKakaoMapSDK]);

  return { isLoaded, isLoading: isManualLoading };
}
