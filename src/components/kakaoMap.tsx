'use client';

import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from 'react';
import useKakaoLoader from './hooks/use-kakao-loader';
// 카카오맵 공식 가이드: https://apis.map.kakao.com/web/guide/#start
// 공식 가이드에 명시된 방법으로만 사용 (순수 JavaScript API)

export interface MarkerType {
  id: string;
  title: string;
  lat: number;
  lng: number;
  type: string;
  isSelected?: boolean;
}

interface KakaoMapProps {
  markers: MarkerType[];
  selectedIds: string[];
  center?: { lat: number; lng: number };
  onMarkerClick?: (markerId: string) => void;
}

const KakaoMap: React.FC<KakaoMapProps> = ({
  markers,
  selectedIds,
  center,
  onMarkerClick,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<Map<string, any>>(new Map());

  // 로드뷰 오버레이 상태
  const [roadviewVisible, setRoadviewVisible] = useState(false);
  const [roadviewPosition, setRoadviewPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [roadviewError, setRoadviewError] = useState<string | null>(null);

  const { isLoaded: kakaoLoaded } = useKakaoLoader();

  // 카카오맵 SDK가 완전히 준비되었는지 확인하는 함수
  const isKakaoSDKReady = useCallback(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    if (!window.kakao || !window.kakao.maps) {
      return false;
    }

    const kakaoMaps = window.kakao.maps;

    // 지도 초기화에 필요한 최소한의 생성자만 확인
    // LatLng와 Map만 확인 (나머지는 사용할 때 체크)
    const hasLatLng =
      kakaoMaps.LatLng && typeof kakaoMaps.LatLng === 'function';
    const hasMap = kakaoMaps.Map && typeof kakaoMaps.Map === 'function';

    const ready = hasLatLng && hasMap;
    return ready;
  }, [kakaoLoaded]);

  // 중심점 계산 (메모이제이션)
  const mapCenter = useMemo(() => {
    return (
      center ||
      (markers.length
        ? {
            lat:
              markers.reduce((sum, marker) => sum + marker.lat, 0) /
              markers.length,
            lng:
              markers.reduce((sum, marker) => sum + marker.lng, 0) /
              markers.length,
          }
        : { lat: 37.5665, lng: 126.978 })
    );
  }, [center, markers]);

  // mapRef callback에서 지도 초기화 시도 (useCallback으로 메모이제이션) - hooks 규칙을 위해 여기에 정의
  const handleMapRef = useCallback(
    (el: HTMLDivElement | null) => {
      mapRef.current = el;

      // mapRef 설정 시 디버그 로그 제거 (너무 많은 로그 방지)

      // mapRef가 설정되고, 카카오 SDK가 완전히 준비되었는데 지도 인스턴스가 없으면 초기화 시도
      if (el && !mapInstanceRef.current && kakaoLoaded && isKakaoSDKReady()) {
        try {
          const container = el;

          // 컨테이너 크기 확인 (경고만, 지도는 생성 가능)

          if (!window.kakao?.maps?.LatLng || !window.kakao?.maps?.Map) {
            throw new Error('카카오맵 SDK가 완전히 로드되지 않았습니다.');
          }

          const options = {
            center: new window.kakao.maps.LatLng(mapCenter.lat, mapCenter.lng),
            level: 3,
          };

          const map = new window.kakao.maps.Map(container, options);

          // 지도가 생성되면 크기를 조정
          if (map && (!container.offsetWidth || !container.offsetHeight)) {
            setTimeout(() => {
              if (map && map.relayout) {
                map.relayout();
              }
            }, 100);
          }
          mapInstanceRef.current = map;
          setIsLoading(false);
          setError(null);
        } catch (err) {
          console.error('❌ mapRef callback에서 카카오맵 생성 실패:', err);
          setError('카카오맵을 생성할 수 없습니다.');
          setIsLoading(false);
        }
      }
    },
    [kakaoLoaded, mapCenter, isKakaoSDKReady]
  );

  // 카카오맵 초기화 (공식 가이드 방식) - useEffect로 백업 시도
  useEffect(() => {
    // 이미 지도 인스턴스가 있으면 스킵
    if (mapInstanceRef.current) {
      return;
    }

    if (typeof window === 'undefined' || !mapRef.current) {
      return;
    }

    // SDK가 준비될 때까지 polling
    if (!kakaoLoaded || !isKakaoSDKReady()) {
      // SDK가 로드되었다고 표시되었지만 실제로는 아직 준비되지 않은 경우
      // polling으로 준비 상태 확인
      const checkInterval = setInterval(() => {
        if (
          kakaoLoaded &&
          isKakaoSDKReady() &&
          mapRef.current &&
          !mapInstanceRef.current
        ) {
          clearInterval(checkInterval);
          // SDK가 준비되면 지도 초기화 시도
          // 이 useEffect가 다시 실행되도록 하기 위해 의존성 배열에 의해 자동 재실행됨
        }
      }, 100);

      // 최대 5초 대기
      const timeout = setTimeout(() => {
        clearInterval(checkInterval);
      }, 5000);

      return () => {
        clearInterval(checkInterval);
        clearTimeout(timeout);
      };
    }

    try {
      // 공식 가이드: 지도 생성
      // 참고: https://apis.map.kakao.com/web/guide/#start
      const container = mapRef.current;

      // 컨테이너 크기 확인 (경고만, 지도는 생성 가능)

      if (!window.kakao?.maps?.LatLng || !window.kakao?.maps?.Map) {
        throw new Error('카카오맵 SDK가 완전히 로드되지 않았습니다.');
      }

      const options = {
        center: new window.kakao.maps.LatLng(mapCenter.lat, mapCenter.lng),
        level: 3,
      };

      const map = new window.kakao.maps.Map(container, options);

      // 지도가 생성되면 크기를 조정
      if (map && (!container.offsetWidth || !container.offsetHeight)) {
        setTimeout(() => {
          if (map && map.relayout) {
            map.relayout();
          }
        }, 100);
      }
      mapInstanceRef.current = map;
      setIsLoading(false);
      setError(null);
    } catch (err) {
      console.error('❌ useEffect에서 카카오맵 생성 실패:', err);
      setError('카카오맵을 생성할 수 없습니다.');
      setIsLoading(false);
    }
  }, [kakaoLoaded, mapCenter, isKakaoSDKReady]);

  // 로드뷰 오버레이 열기
  const openRoadview = useCallback(
    (lat: number, lng: number) => {
      if (!isKakaoSDKReady()) {
        console.error('❌ 카카오맵 SDK가 준비되지 않았습니다.');
        setRoadviewError('카카오맵 SDK가 준비되지 않았습니다.');
        return;
      }

      if (!window.kakao?.maps?.Roadview) {
        console.error('❌ 로드뷰 라이브러리가 로드되지 않았습니다.');
        setRoadviewError('로드뷰 라이브러리가 로드되지 않았습니다.');
        return;
      }

      setRoadviewError(null);
      setRoadviewPosition({ lat, lng });
      setRoadviewVisible(true);
    },
    [isKakaoSDKReady]
  );

  // 마커 업데이트
  useEffect(() => {
    if (!mapInstanceRef.current) {
      return;
    }

    if (!isKakaoSDKReady()) {
      return;
    }

    const map = mapInstanceRef.current;

    // 기존 마커 제거
    markersRef.current.forEach((marker) => {
      marker.setMap(null);
    });
    markersRef.current.clear();

    // 새 마커 생성
    if (!window.kakao?.maps) {
      console.error('❌ 카카오맵 SDK가 없습니다.');
      return;
    }

    const { LatLng, Marker, CustomOverlay, event } = window.kakao.maps;

    // 타입 가드: 필수 속성 확인
    if (!LatLng || !Marker || !CustomOverlay || !event) {
      console.error('❌ 카카오맵 SDK의 필수 생성자가 없습니다.');
      return;
    }

    markers.forEach((marker) => {
      const isSelected = selectedIds.includes(marker.id);
      const position = new LatLng(marker.lat, marker.lng);

      // 마커 생성
      const kakaoMarker = new Marker({
        position: position,
      });

      // 커스텀 오버레이 생성 (마커 위 텍스트 표시)
      const overlay = new CustomOverlay({
        position: position,
        content: createMarkerContent(
          marker,
          isSelected,
          () => {
            if (onMarkerClick) {
              onMarkerClick(marker.id);
            }
          },
          () => {
            openRoadview(marker.lat, marker.lng);
          }
        ),
        yAnchor: 2.2,
      });

      // 마커 클릭 이벤트
      event.addListener(kakaoMarker, 'click', () => {
        if (onMarkerClick) {
          onMarkerClick(marker.id);
        }
      });

      // 지도에 마커와 오버레이 추가
      kakaoMarker.setMap(map);
      overlay.setMap(map);

      markersRef.current.set(marker.id, kakaoMarker);
    });

    // 선택된 마커가 있으면 중심점 이동
    if (selectedIds.length > 0) {
      const selectedMarker = markers.find((m) => selectedIds.includes(m.id));
      if (selectedMarker && window.kakao?.maps?.LatLng) {
        const moveLatLon = new window.kakao.maps.LatLng(
          selectedMarker.lat,
          selectedMarker.lng
        );
        map.setCenter(moveLatLon);
        map.setLevel(3);
      }
    }
  }, [markers, selectedIds, onMarkerClick, isKakaoSDKReady, openRoadview]);

  // 마커 컨텐츠 생성 함수
  const createMarkerContent = (
    marker: MarkerType,
    isSelected: boolean,
    onMarkerClick: () => void,
    onRoadviewClick: () => void
  ) => {
    const div = document.createElement('div');
    div.style.cssText = `
      padding: 8px 12px;
      background-color: ${isSelected ? '#238CFA' : '#666'};
      color: white;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
      white-space: nowrap;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      min-width: 60px;
      text-align: center;
      cursor: pointer;
    `;
    div.textContent =
      marker.title.length > 10
        ? marker.title.substring(0, 10) + '...'
        : marker.title;

    div.addEventListener('click', (e) => {
      e.stopPropagation();
      onMarkerClick();
    });

    if (isSelected) {
      const button = document.createElement('button');
      button.style.cssText = `
        display: block;
        margin-top: 6px;
        padding: 4px 8px;
        background-color: rgba(255, 255, 255, 0.9);
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 4px;
        color: #238CFA;
        font-size: 11px;
        font-weight: bold;
        cursor: pointer;
        width: 100%;
        min-width: 100%;
        box-sizing: border-box;
        transition: all 0.2s ease;
      `;
      button.textContent = '🚗 로드뷰 보기';
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        onRoadviewClick();
      });
      button.addEventListener('mouseenter', () => {
        button.style.backgroundColor = 'white';
        button.style.transform = 'scale(1.05)';
      });
      button.addEventListener('mouseleave', () => {
        button.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
        button.style.transform = 'scale(1)';
      });
      div.appendChild(button);
    }

    return div;
  };

  // 로드뷰 오버레이 닫기
  const closeRoadview = () => {
    setRoadviewVisible(false);
    setRoadviewPosition(null);
    setRoadviewError(null);
  };

  if (error) {
    return (
      <div className="w-full h-80 flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center">
          <p className="text-red-600 mb-2 font-medium">{error}</p>
          <p className="text-sm text-gray-600 mb-4">
            개발자 도구의 콘솔을 확인하여 자세한 오류 정보를 확인하세요.
          </p>
          <p className="text-xs text-orange-600 mb-4">
            💡 카카오 개발자 콘솔에서 도메인 등록 확인
            <br />
            📖 공식 가이드: https://apis.map.kakao.com/web/guide/#start
          </p>
        </div>
      </div>
    );
  }

  // 렌더링 시 디버그 로그 제거 (너무 많은 로그 방지)

  return (
    <div className="relative w-full h-full">
      {/* 지도 컨테이너 (공식 가이드 방식) - 항상 렌더링 */}
      <div ref={handleMapRef} style={{ width: '100%', height: '100%' }} />

      {/* 로딩 오버레이 */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">카카오맵 로딩 중...</p>
          </div>
        </div>
      )}

      {/* 로드뷰 오버레이 */}
      {roadviewVisible && roadviewPosition && (
        <RoadviewOverlay
          position={roadviewPosition}
          onClose={closeRoadview}
          onError={setRoadviewError}
        />
      )}

      {/* 로드뷰 에러 메시지 */}
      {roadviewError && (
        <div className="absolute top-4 left-4 right-4 z-40 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <div className="flex justify-between items-center">
            <span>{roadviewError}</span>
            <button
              onClick={() => setRoadviewError(null)}
              className="text-red-700 hover:text-red-900"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// 로드뷰 오버레이 컴포넌트
interface RoadviewOverlayProps {
  position: { lat: number; lng: number };
  onClose: () => void;
  onError: (error: string | null) => void;
}

const RoadviewOverlay: React.FC<RoadviewOverlayProps> = ({
  position,
  onClose,
  onError,
}) => {
  const roadviewRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const roadviewInstanceRef = useRef<any>(null);

  useEffect(() => {
    const initRoadview = () => {
      if (!roadviewRef.current || !window.kakao || !window.kakao.maps) {
        onError('로드뷰를 초기화할 수 없습니다.');
        return;
      }

      try {
        if (roadviewInstanceRef.current) {
          roadviewInstanceRef.current = null;
        }

        if (roadviewRef.current) {
          roadviewRef.current.innerHTML = '';
        }

        // 타입 가드: 필수 속성 확인
        const Roadview = window.kakao.maps.Roadview;
        const LatLng = window.kakao.maps.LatLng;
        const event = window.kakao.maps.event;

        if (!Roadview || !LatLng || !event) {
          onError('로드뷰를 초기화할 수 없습니다. SDK가 완전히 로드되지 않았습니다.');
          return;
        }

        // 공식 가이드 방식으로 로드뷰 생성
        const roadview = new Roadview(roadviewRef.current, {
          position: new LatLng(position.lat, position.lng),
          pov: { pan: 0, tilt: 0, zoom: 1 },
        });

        roadviewInstanceRef.current = roadview;
        onError(null);

        event.addListener(roadview, 'init', () => {
          onError(null);
        });

        event.addListener(roadview, 'error', () => {
          onError(
            '로드뷰를 불러올 수 없습니다. 해당 위치에서 로드뷰가 제공되지 않을 수 있습니다.'
          );
        });
      } catch (error) {
        console.error('❌ 로드뷰 생성 실패:', error);
        onError('로드뷰를 생성할 수 없습니다.');
      }
    };

    const timer = setTimeout(initRoadview, 100);

    return () => {
      clearTimeout(timer);
      if (roadviewInstanceRef.current) {
        roadviewInstanceRef.current = null;
      }
    };
  }, [position, onError]);

  return (
    <div
      className="fixed inset-0 z-[9999] bg-white shadow-xl flex flex-col"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
      }}
    >
      <div className="flex items-center justify-between p-3 border-b bg-gray-50">
        <button
          onClick={onClose}
          className="bg-white rounded-full p-1.5 shadow-lg hover:bg-gray-100 transition-colors"
          style={{ width: '32px', height: '32px' }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div
        ref={roadviewRef}
        style={{
          width: '100%',
          height: 'calc(100% - 60px)',
          flex: 1,
        }}
      />
    </div>
  );
};

export default KakaoMap;
