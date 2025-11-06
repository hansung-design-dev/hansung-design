import { useEffect, useState, useRef } from 'react';
// 카카오맵 공식 가이드: https://apis.map.kakao.com/web/guide/#start
// 공식 가이드에 명시된 방법으로만 사용 (2025년 10월 20일 이후 구 리소스 차단)
// 테스트 페이지(/kakao-map-test)와 동일한 로딩 방식 사용

export default function useKakaoLoader() {
  const appkey = process.env.NEXT_PUBLIC_KAKAO_KEY || '';
  const [isLoaded, setIsLoaded] = useState(false);
  const loadingRef = useRef(false);

  useEffect(() => {
    // SSR 환경에서는 스킵
    if (typeof window === 'undefined') {
      return;
    }

    // 이미 완전히 준비되었으면 스킵
    const checkReady = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const w = window as any;
      return (
        w.kakao?.maps?.LatLng &&
        typeof w.kakao.maps.LatLng === 'function' &&
        w.kakao.maps.Map &&
        typeof w.kakao.maps.Map === 'function'
      );
    };

    if (checkReady()) {
      setIsLoaded(true);
      return;
    }

    // 이미 로딩 중이면 스킵
    if (loadingRef.current) {
      // 로딩 중이면 주기적으로 확인
      const checkInterval = setInterval(() => {
        if (checkReady()) {
          setIsLoaded(true);
          clearInterval(checkInterval);
        }
      }, 100);
      return () => clearInterval(checkInterval);
    }

    // API 키 확인
    if (!appkey) {
      console.error('❌ NEXT_PUBLIC_KAKAO_KEY가 설정되지 않았습니다.');
      return;
    }

    loadingRef.current = true;

    // 테스트 페이지와 동일한 방식으로 로드
    async function loadKakaoSDK() {
      try {
        // 기존 스크립트 확인
        const existing = document.querySelector(
          'script[data-kakao-sdk="v2-maps"]'
        ) as HTMLScriptElement | null;

        if (!existing) {
          // 새 스크립트 로드
          const script = document.createElement('script');
          script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(
            appkey
          )}&libraries=clusterer,drawing,services,roadview&autoload=false`;
          script.async = true;
          script.defer = true;
          script.dataset.kakaoSdk = 'v2-maps';

          if (process.env.NODE_ENV === 'development') {
            console.log(
              '🔍 [useKakaoLoader] 카카오맵 SDK 로드 시도:',
              script.src.replace(appkey, 'APPKEY_HIDDEN')
            );
          }

          // 스크립트 로드 대기
          await new Promise<void>((resolve, reject) => {
            const timeout = window.setTimeout(() => {
              console.error('[useKakaoLoader] SDK 스크립트 로드 타임아웃');
              reject(new Error('SDK load timeout'));
            }, 8000);

            script.onload = () => {
              window.clearTimeout(timeout);
              if (process.env.NODE_ENV === 'development') {
                console.log('[useKakaoLoader] 스크립트 로드 완료');
              }
              resolve();
            };

            script.onerror = () => {
              window.clearTimeout(timeout);
              console.error('[useKakaoLoader] 스크립트 로드 실패');
              reject(new Error('Failed to load Kakao SDK'));
            };

            document.head.appendChild(script);
          });
        } else {
          if (process.env.NODE_ENV === 'development') {
            console.log('[useKakaoLoader] 기존 스크립트 재사용');
          }
        }

        // 스크립트 로드 후 kakao.maps.load() 호출
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const w = window as any;

        if (process.env.NODE_ENV === 'development') {
          console.log('[useKakaoLoader] window.kakao 상태:', {
            hasKakao: !!w.kakao,
            hasMaps: !!(w.kakao && w.kakao.maps),
            hasLoad: !!w.kakao?.maps?.load,
          });
        }

        // kakao.maps.load() 호출
        if (w.kakao?.maps?.load) {
          await new Promise<void>((resolve, reject) => {
            let loadCalled = false;
            const timeout = window.setTimeout(() => {
              if (!loadCalled) {
                console.error('[useKakaoLoader] kakao.maps.load 타임아웃');
                reject(new Error('kakao.maps.load timeout'));
              }
            }, 8000);

            try {
              w.kakao.maps.load(() => {
                loadCalled = true;
                window.clearTimeout(timeout);
                if (process.env.NODE_ENV === 'development') {
                  console.log('[useKakaoLoader] kakao.maps.load 콜백 실행');
                }
                resolve();
              });
            } catch (e) {
              window.clearTimeout(timeout);
              console.error('[useKakaoLoader] kakao.maps.load 에러:', e);
              reject(e as Error);
            }
          });
        } else {
          // load() 함수가 없으면 잠시 대기 후 재확인
          await new Promise((resolve) => setTimeout(resolve, 500));
          if (w.kakao?.maps?.load) {
            w.kakao.maps.load(() => {
              if (process.env.NODE_ENV === 'development') {
                console.log(
                  '[useKakaoLoader] kakao.maps.load 콜백 실행 (지연)'
                );
              }
            });
          }
        }

        // 최종 확인
        if (checkReady()) {
          setIsLoaded(true);
          if (process.env.NODE_ENV === 'development') {
            console.log('[useKakaoLoader] ✅ 카카오맵 SDK 준비 완료');
          }
        } else {
          // 재시도
          let retryCount = 0;
          const maxRetries = 100;
          const retryCheck = () => {
            retryCount++;
            if (checkReady()) {
              setIsLoaded(true);
              if (process.env.NODE_ENV === 'development') {
                console.log(
                  `[useKakaoLoader] ✅ 카카오맵 SDK 준비 완료 (재시도 ${retryCount}회)`
                );
              }
              return;
            }
            if (retryCount < maxRetries) {
              setTimeout(retryCheck, 100);
            } else {
              console.error(
                '[useKakaoLoader] ❌ 카카오맵 SDK 생성자 로드 시간 초과'
              );
            }
          };
          setTimeout(retryCheck, 100);
        }
      } catch (error) {
        console.error('[useKakaoLoader] 로드 에러:', error);
        // Fallback: autoload=true로 재시도
        try {
          const fallbackExisting = document.querySelector(
            'script[data-kakao-sdk="v2-maps-fallback"]'
          ) as HTMLScriptElement | null;

          if (!fallbackExisting) {
            const fallbackScript = document.createElement('script');
            fallbackScript.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(
              appkey
            )}&libraries=clusterer,drawing,services,roadview`;
            fallbackScript.async = true;
            fallbackScript.defer = true;
            fallbackScript.dataset.kakaoSdk = 'v2-maps-fallback';

            if (process.env.NODE_ENV === 'development') {
              console.log('[useKakaoLoader] Fallback 스크립트 로드 시도');
            }

            await new Promise<void>((resolve, reject) => {
              const timeout = window.setTimeout(() => {
                reject(new Error('Fallback SDK load timeout'));
              }, 8000);

              fallbackScript.onload = () => {
                window.clearTimeout(timeout);
                if (process.env.NODE_ENV === 'development') {
                  console.log('[useKakaoLoader] Fallback 스크립트 로드 완료');
                }
                resolve();
              };

              fallbackScript.onerror = () => {
                window.clearTimeout(timeout);
                reject(new Error('Fallback SDK load error'));
              };

              document.head.appendChild(fallbackScript);
            });

            // Fallback 후 확인
            setTimeout(() => {
              if (checkReady()) {
                setIsLoaded(true);
              }
            }, 500);
          }
        } catch (fallbackError) {
          console.error('[useKakaoLoader] Fallback도 실패:', fallbackError);
        }
      } finally {
        loadingRef.current = false;
      }
    }

    loadKakaoSDK();
  }, [appkey]);

  return { isLoaded, isLoading: !isLoaded && !!appkey };
}
