import { useEffect, useState, useRef } from 'react';
// 카카오맵 공식 가이드: https://apis.map.kakao.com/web/guide/#start
// 공식 가이드에 명시된 방법으로만 사용 (2025년 10월 20일 이후 구 리소스 차단)

export default function useKakaoLoader() {
  const [resolvedAppKey, setResolvedAppKey] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    // SSR 환경에서는 스킵
    if (typeof window === 'undefined') {
      return;
    }

    // 먼저 앱키를 서버 API에서 받아와 통일된 경로로 사용 (서버 비공개 키도 지원)
    // 테스트 페이지와 동일한 소스: /api/kakao-test-config
    // 클라이언트 번들에 노출되는 NEXT_PUBLIC_* 의존성을 제거해 환경차로 인한 타임아웃 방지
    const resolveAppKey = async (): Promise<string> => {
      try {
        const res = await fetch('/api/kakao-test-config', {
          cache: 'no-store',
        });
        if (!res.ok) return '';
        const json = (await res.json()) as { appKey?: string };
        return json?.appKey || '';
      } catch {
        return '';
      }
    };

    // 이미 로드되어 있으면 확인 후 스킵
    if (window.kakao && window.kakao.maps) {
      const hasLatLng =
        window.kakao.maps.LatLng &&
        typeof window.kakao.maps.LatLng === 'function';
      const hasMap =
        window.kakao.maps.Map && typeof window.kakao.maps.Map === 'function';

      if (hasLatLng && hasMap) {
        setIsLoaded(true);
        return;
      }
      // SDK 객체는 있지만 생성자가 준비되지 않은 경우 계속 진행
    }

    // 이미 스크립트 로드가 진행 중이면 스킵
    if (scriptLoadedRef.current) {
      // 스크립트 로드 중이지만 아직 준비되지 않았을 수 있으므로 재확인
      const checkLoaded = () => {
        if (window.kakao && window.kakao.maps) {
          const hasLatLng =
            window.kakao.maps.LatLng &&
            typeof window.kakao.maps.LatLng === 'function';
          const hasMap =
            window.kakao.maps.Map &&
            typeof window.kakao.maps.Map === 'function';
          if (hasLatLng && hasMap) {
            setIsLoaded(true);
          }
        }
      };
      // 이미 로드된 경우 즉시 확인, 아니면 잠시 후 확인
      checkLoaded();
      setTimeout(checkLoaded, 500);
      return;
    }

    // 기존 스크립트가 있는지 확인
    const existingScript = document.querySelector(
      'script[src*="dapi.kakao.com"]'
    ) as HTMLScriptElement | null;

    if (existingScript) {
      // 기존 스크립트가 있으면 즉시 확인
      const checkExisting = () => {
        if (
          window.kakao?.maps?.LatLng &&
          typeof window.kakao.maps.LatLng === 'function' &&
          window.kakao?.maps?.Map &&
          typeof window.kakao.maps.Map === 'function'
        ) {
          setIsLoaded(true);
          return true;
        }
        return false;
      };

      // 즉시 확인
      if (checkExisting()) {
        return;
      }

      // SDK가 준비되지 않았으면 잠시 대기 후 재확인
      // 공식 가이드에 따르면 스크립트 로드 후 바로 사용 가능해야 함
      setTimeout(() => {
        if (checkExisting()) {
          setIsLoaded(true);
        } else {
          // 재확인 실패 시 재시도
          let retryCount = 0;
          const maxRetries = 300; // 100ms x 300 = 30s
          const retryCheck = () => {
            retryCount++;
            if (checkExisting()) {
              setIsLoaded(true);
              return;
            }
            if (retryCount < maxRetries) {
              setTimeout(retryCheck, 100);
            }
          };
          retryCheck();
        }
      }, 200);

      // load() 함수가 없거나 작동하지 않으면 재로드 시도
      const scriptSrc = existingScript.getAttribute('src') || '';
      const currentAppkey = scriptSrc.match(/appkey=([^&]+)/)?.[1];

      // 동일한 스크립트이면 잠시 후 재확인
      if (currentAppkey) {
        setTimeout(() => {
          if (!checkExisting()) {
            // 재확인 실패해도 그냥 진행 (이미 스크립트는 로드됨)
          }
        }, 1000);
        setResolvedAppKey(currentAppkey);
        return;
      }
    }

    // 공식 가이드 방식으로 스크립트 로드
    // 참고: https://apis.map.kakao.com/web/guide/#start
    scriptLoadedRef.current = true;
    (async () => {
      const appkey = await resolveAppKey();
      setResolvedAppKey(appkey);

      if (!appkey) {
        console.error(
          '❌ Kakao appKey를 가져오지 못했습니다. (/api/kakao-test-config)'
        );
        return;
      }

      const script = document.createElement('script');
      script.type = 'text/javascript';
      // autoload=false + kakao.maps.load 방식 (문서쓰기 이슈 회피, 테스트 페이지와 동일)
      const scriptUrl = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appkey}&autoload=false&libraries=clusterer,drawing,services,roadview`;
      script.src = scriptUrl;
      script.async = true;
      script.defer = true;
      (script as HTMLScriptElement).dataset.kakaoSdk = 'shared-v2-maps';

      // 디버깅 정보 출력 (개발 환경)
      if (process.env.NODE_ENV === 'development') {
        console.log(
          '🔍 카카오맵 SDK 로드 시도:',
          scriptUrl.replace(appkey, 'APPKEY_HIDDEN')
        );
      }

      script.onload = () => {
        try {
          if (
            !window.kakao ||
            !window.kakao.maps ||
            typeof window.kakao.maps.load !== 'function'
          ) {
            console.error('❌ kakao.maps.load not available after script load');
            return;
          }
          let done = false;
          const timeout = window.setTimeout(() => {
            if (!done) {
              console.error('❌ kakao.maps.load timeout (8s)');
            }
          }, 8000);
          window.kakao.maps.load(() => {
            done = true;
            window.clearTimeout(timeout);
            type KakaoWindow = {
              kakao?: {
                maps?: {
                  LatLng?: unknown;
                  Map?: unknown;
                };
              };
            };
            const w = window as unknown as KakaoWindow;
            const hasLatLng = !!(
              w.kakao?.maps?.LatLng &&
              typeof w.kakao.maps.LatLng === 'function'
            );
            const hasMap = !!(
              w.kakao?.maps?.Map &&
              typeof w.kakao.maps.Map === 'function'
            );
            if (hasLatLng && hasMap) {
              setIsLoaded(true);
            } else {
              console.error('❌ Kakao constructors not ready after load');
            }
          });
        } catch (e) {
          console.error('❌ error in kakao.maps.load', e);
        }
      };

      script.onerror = (error) => {
        const currentUrl =
          typeof window !== 'undefined' ? window.location.href : 'SSR';
        const currentHost =
          typeof window !== 'undefined' ? window.location.hostname : 'SSR';
        const currentPort =
          typeof window !== 'undefined' ? window.location.port : '';
        const currentProtocol =
          typeof window !== 'undefined' ? window.location.protocol : 'SSR';

        const fullDomain = currentPort
          ? `${currentProtocol}//${currentHost}:${currentPort}`
          : `${currentProtocol}//${currentHost}`;

        console.error('❌ 카카오맵 SDK 스크립트 로드 실패 (onerror 이벤트)');
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('📍 현재 접속 주소:', currentUrl);
        console.error('📍 현재 도메인:', fullDomain);
        console.error(
          '🔍 시도한 스크립트 URL:',
          scriptUrl.replace(appkey, 'APPKEY_HIDDEN')
        );
        console.error(
          '🔍 API 키 상태:',
          appkey ? `설정됨 (길이: ${appkey.length})` : '설정되지 않음'
        );
        console.error(
          '🔍 API 키 앞 4자리 (확인용):',
          appkey ? `${appkey.substring(0, 4)}...` : '없음'
        );

        // Network 탭에서 확인할 수 있도록 추가 안내
        console.error('');
        console.error('🔍 Network 탭에서 확인해야 할 사항:');
        console.error('   1. 브라우저 개발자 도구 → Network 탭 열기');
        console.error('   2. 필터에 "dapi.kakao.com" 입력');
        console.error('   3. 페이지 새로고침 (F5)');
        console.error('   4. "dapi.kakao.com" 요청 클릭');
        console.error('   5. Status Code 확인:');
        console.error('      - 200 OK: 스크립트 로드는 성공, 실행 중 에러');
        console.error(
          '      - 403 Forbidden: 도메인 미등록 또는 API 키 오류 (가장 흔함)'
        );
        console.error('      - 404 Not Found: 잘못된 API 키 또는 URL');
        console.error('   6. Response 탭에서 실제 에러 메시지 확인');
        console.error('');

        if (error) {
          console.error('🔍 에러 객체:', error);
          if (
            error instanceof Event &&
            error.target &&
            error.target instanceof HTMLScriptElement
          ) {
            console.error('🔍 실패한 스크립트 URL:', error.target.src);
          }
        }
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error(
          '💡 카카오 개발자 콘솔(https://developers.kakao.com)에서 확인:'
        );
        console.error('');
        console.error('📌 필수 확인 사항:');
        console.error('   1. 애플리케이션 선택 → 앱 키에서 JavaScript 키 확인');
        console.error(
          '      → .env.local의 NEXT_PUBLIC_KAKAO_KEY와 일치하는지 확인'
        );
        console.error('   2. 플랫폼 설정 → Web 플랫폼 추가 확인');
        console.error('   3. 사이트 도메인 등록 확인:');
        console.error(`      → 반드시 등록해야 할 도메인: ${fullDomain}`);
        console.error('      → 또는: http://localhost:3000 (포트 번호 포함)');
        console.error('');
        console.error('🔧 문제 해결 단계:');
        console.error('   1. 브라우저 개발자 도구 → Network 탭 열기');
        console.error('   2. 페이지 새로고침 (F5)');
        console.error('   3. "dapi.kakao.com"로 시작하는 요청 찾기');
        console.error(
          '   4. 해당 요청 클릭 → Response 탭에서 에러 메시지 확인'
        );
        console.error(
          '   5. Status Code 확인 (403 Forbidden이면 도메인 미등록)'
        );
        console.error('');
        console.error('⚠️  새 앱을 만들었다면:');
        console.error('   - Web 플랫폼을 반드시 추가해야 합니다');
        console.error(
          '   - 사이트 도메인에 정확히 등록해야 합니다 (대소문자 구분)'
        );
        console.error('   - 설정 후 몇 분 정도 기다려야 적용될 수 있습니다');
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error(
          '📖 공식 가이드: https://apis.map.kakao.com/web/guide/#start'
        );
        scriptLoadedRef.current = false;
      };

      // 공식 가이드: 스크립트는 실행 코드보다 먼저 선언되어야 함
      document.head.appendChild(script);
    })();

    // 클린업 없음 (공식 가이드 방식)
    return () => {};
  }, []);

  return { isLoaded, isLoading: !isLoaded && !resolvedAppKey };
}
