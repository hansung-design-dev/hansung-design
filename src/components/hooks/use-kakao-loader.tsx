import { useEffect, useState, useRef } from 'react';
// 카카오맵 공식 가이드: https://apis.map.kakao.com/web/guide/#start
// 공식 가이드에 명시된 방법으로만 사용 (2025년 10월 20일 이후 구 리소스 차단)

export default function useKakaoLoader() {
  const appkey = process.env.NEXT_PUBLIC_KAKAO_KEY || '';
  const [isLoaded, setIsLoaded] = useState(false);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    // SSR 환경에서는 스킵
    if (typeof window === 'undefined') {
      return;
    }

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

    // API 키 확인
    if (!appkey) {
      console.error('❌ NEXT_PUBLIC_KAKAO_KEY가 설정되지 않았습니다.');
      console.error(
        '💡 .env.local 파일에 NEXT_PUBLIC_KAKAO_KEY를 추가해주세요.'
      );
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
          const maxRetries = 30;
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

      // API 키가 다른 경우 재로드
      if (currentAppkey !== appkey) {
        existingScript.remove();
        if (window.kakao) {
          try {
            delete (window as unknown as { kakao?: unknown }).kakao;
          } catch {
            // 삭제 실패해도 무시
          }
        }
        scriptLoadedRef.current = false;
        // 아래 로직으로 새로 로드
      } else {
        // 동일한 스크립트이면 잠시 후 재확인
        setTimeout(() => {
          if (!checkExisting()) {
            // 재확인 실패해도 그냥 진행 (이미 스크립트는 로드됨)
            // load()가 호출되면 나중에 콜백으로 처리됨
          }
        }, 1000);
        return;
      }
    }

    // 공식 가이드 방식으로 스크립트 로드
    // 참고: https://apis.map.kakao.com/web/guide/#start
    scriptLoadedRef.current = true;

    const script = document.createElement('script');
    script.type = 'text/javascript';
    // 공식 가이드: //dapi.kakao.com/v2/maps/sdk.js?appkey=...&libraries=...
    // 프로토콜 없는 형식 사용 (현재 페이지의 프로토콜 자동 사용)
    const scriptUrl = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${appkey}&libraries=clusterer,drawing,services,roadview`;
    script.src = scriptUrl;

    // 디버깅 정보 출력 (개발 환경)
    if (process.env.NODE_ENV === 'development') {
      console.log(
        '🔍 카카오맵 SDK 로드 시도:',
        scriptUrl.replace(appkey, 'APPKEY_HIDDEN')
      );
    }

    script.onload = () => {
      // 공식 가이드: https://apis.map.kakao.com/web/guide/#start
      // 스크립트 로드 후 바로 kakao.maps 객체를 사용할 수 있어야 합니다
      // 추가적인 load() 호출은 필요 없습니다

      // 스크립트 로드 후 약간의 시간을 두고 확인 (SDK 초기화 완료 대기)
      setTimeout(() => {
        if (window.kakao && window.kakao.maps) {
          const hasLatLng =
            window.kakao.maps.LatLng &&
            typeof window.kakao.maps.LatLng === 'function';
          const hasMap =
            window.kakao.maps.Map &&
            typeof window.kakao.maps.Map === 'function';

          if (hasLatLng && hasMap) {
            setIsLoaded(true);
            return;
          }
        }

        // SDK가 준비되지 않았으면 재시도 (최대 3초)
        let retryCount = 0;
        const maxRetries = 30;

        const checkKakao = () => {
          retryCount++;

          if (
            window.kakao?.maps?.LatLng &&
            typeof window.kakao.maps.LatLng === 'function' &&
            window.kakao?.maps?.Map &&
            typeof window.kakao.maps.Map === 'function'
          ) {
            setIsLoaded(true);
            return;
          }

          if (retryCount >= maxRetries) {
            console.error('❌ 카카오맵 SDK 생성자 로드 시간 초과');
            console.error(
              '💡 카카오 개발자 콘솔(https://developers.kakao.com)에서 확인:'
            );
            console.error('   1. JavaScript 키가 올바른지 확인');
            console.error('   2. 현재 도메인이 플랫폼에 등록되어 있는지 확인');
            console.error(
              `   3. 등록해야 할 도메인: ${window.location.protocol}//${
                window.location.hostname
              }${window.location.port ? ':' + window.location.port : ''}`
            );
            console.error(
              '   4. 플랫폼 설정 → Web 플랫폼 → 사이트 도메인 등록'
            );
            console.error(
              '   5. 브라우저 개발자 도구 → Network 탭에서 스크립트 요청 상태 확인'
            );
            console.error(
              '📖 공식 가이드: https://apis.map.kakao.com/web/guide/#start'
            );
            return;
          }

          setTimeout(checkKakao, 100);
        };

        checkKakao();
      }, 100);
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
      console.error('   4. 해당 요청 클릭 → Response 탭에서 에러 메시지 확인');
      console.error('   5. Status Code 확인 (403 Forbidden이면 도메인 미등록)');
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

    // 클린업
    return () => {
      // 스크립트는 제거하지 않음 (공식 가이드 방식)
    };
  }, [appkey]);

  return { isLoaded, isLoading: !isLoaded && !!appkey };
}
