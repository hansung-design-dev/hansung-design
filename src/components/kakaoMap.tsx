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
  number?: number; // 게시대 번호 (선택적)
  district?: string;
  subtitle?: string;
}

export interface MapPolygon {
  id: string;
  path: { lat: number; lng: number }[];
  strokeColor?: string;
  strokeOpacity?: number;
  strokeWeight?: number;
  strokeStyle?: 'solid' | 'shortdash' | 'shortdot' | 'dash' | 'dot' | 'longdash';
  fillColor?: string;
  fillOpacity?: number;
}

interface KakaoMapProps {
  markers: MarkerType[];
  selectedIds: string[];
  center?: { lat: number; lng: number };
  onMarkerClick?: (markerId: string) => void;
  displayMode?: 'default' | 'allMinimal';
  polygons?: MapPolygon[];
}

const KakaoMap: React.FC<KakaoMapProps> = ({
  markers,
  selectedIds,
  center,
  onMarkerClick,
  displayMode = 'default',
  polygons = [],
}) => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<Map<string, any>>(new Map());
  const overlaysRef = useRef<Map<string, any>>(new Map());
  const polygonsRef = useRef<Map<string, any>>(new Map());
  const mapCenterRef = useRef<{ lat: number; lng: number } | null>(null);
  const loadingStateRef = useRef(false); // 로딩 상태 추적용 ref

  // 로드뷰 오버레이 상태
  const { isLoaded: kakaoLoaded } = useKakaoLoader();
  const [roadviewVisible, setRoadviewVisible] = useState(false);
  const [roadviewPosition, setRoadviewPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [roadviewError, setRoadviewError] = useState<string | null>(null);

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
  }, []); // kakaoLoaded는 내부에서 확인하지 않으므로 의존성 제거

  // 중심점 계산 (메모이제이션) - ref에 저장하여 최신 값 참조
  useMemo(() => {
    const centerPoint =
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
        : { lat: 37.5665, lng: 126.978 });
    // ref에 최신 값 저장
    mapCenterRef.current = centerPoint;
    return centerPoint;
  }, [center, markers]);

  // mapRef callback에서 지도 초기화 시도 (useCallback으로 메모이제이션) - hooks 규칙을 위해 여기에 정의
  const handleMapRef = useCallback(
    (el: HTMLDivElement | null) => {
      mapRef.current = el;

      // mapRef가 설정되고, 카카오 SDK가 완전히 준비되었는데 지도 인스턴스가 없으면 초기화 시도
      if (el && !mapInstanceRef.current) {
        // SDK가 준비되었는지 확인
        if (
          typeof window !== 'undefined' &&
          window.kakao?.maps?.LatLng &&
          window.kakao?.maps?.Map &&
          mapCenterRef.current
        ) {
          try {
            const container = el;
            const currentCenter = mapCenterRef.current; // ref에서 최신 값 참조

            const options = {
              center: new window.kakao.maps.LatLng(
                currentCenter.lat,
                currentCenter.lng
              ),
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
      }
    },
    [] // 의존성 배열 비움 - ref를 통해 최신 값 참조
  );

  // 카카오맵 초기화 (공식 가이드 방식) - useEffect로 백업 시도
  useEffect(() => {
    // 이미 지도 인스턴스가 있으면 로딩 상태만 확인하고 스킵
    if (mapInstanceRef.current) {
      if (!loadingStateRef.current && isLoading) {
        loadingStateRef.current = true;
        setIsLoading(false);
      }
      return;
    }

    if (typeof window === 'undefined' || !mapRef.current) {
      return;
    }

    // SDK가 준비될 때까지 대기
    if (!kakaoLoaded || !isKakaoSDKReady()) {
      return;
    }

    // 지도 초기화는 handleMapRef에서 처리하므로 여기서는 스킵
    // handleMapRef가 실행되지 않은 경우를 대비한 백업 로직
    if (!mapInstanceRef.current && mapRef.current) {
      try {
        const container = mapRef.current;

        if (!window.kakao?.maps?.LatLng || !window.kakao?.maps?.Map) {
          return; // SDK가 아직 준비되지 않음
        }

        const currentCenter = mapCenterRef.current || {
          lat: 37.5665,
          lng: 126.978,
        };

        const options = {
          center: new window.kakao.maps.LatLng(
            currentCenter.lat,
            currentCenter.lng
          ),
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
        if (!loadingStateRef.current) {
          loadingStateRef.current = true;
          setIsLoading(false);
        }
        setError(null);
      } catch (err) {
        console.error('❌ useEffect에서 카카오맵 생성 실패:', err);
        setError('카카오맵을 생성할 수 없습니다.');
        setIsLoading(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kakaoLoaded]); // isKakaoSDKReady는 함수이므로 의존성에서 제외

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
    overlaysRef.current.forEach((overlay) => {
      overlay.setMap(null);
    });
    overlaysRef.current.clear();

    // 기존 폴리곤 제거
    polygonsRef.current.forEach((polygon) => {
      polygon.setMap(null);
    });
    polygonsRef.current.clear();

    // 새 마커 및 폴리곤 생성
    if (!window.kakao?.maps) {
      console.error('❌ 카카오맵 SDK가 없습니다.');
      return;
    }

    const {
      LatLng,
      Marker,
      CustomOverlay,
      event,
      Polygon: KakaoPolygon,
    } = window.kakao.maps;

    // 타입 가드: 필수 속성 확인
    if (!LatLng || !Marker || !CustomOverlay || !event || !KakaoPolygon) {
      console.error('❌ 카카오맵 SDK의 필수 생성자가 없습니다.');
      return;
    }

    const overlayVariant: 'minimal' | 'default' =
      displayMode === 'allMinimal' ? 'minimal' : 'default';

    markers.forEach((marker) => {
      const isSelected = selectedIds.includes(marker.id);
      const position = new LatLng(marker.lat, marker.lng);

      // 마커 생성
      const kakaoMarker = new Marker({
        position: position,
      });

      // 커스텀 오버레이 생성 (선택된 마커만 텍스트 표시)
      const shouldShowOverlay =
        overlayVariant === 'minimal' ? true : isSelected;

    const markerContent = shouldShowOverlay
      ? createMarkerContent(
          marker,
          overlayVariant,
          () => {
            if (onMarkerClick) {
              onMarkerClick(marker.id);
            }
          },
          overlayVariant === 'default'
            ? () => openRoadview(marker.lat, marker.lng)
            : undefined
        )
        : null;

      // 마커 클릭 이벤트
      event.addListener(kakaoMarker, 'click', () => {
        if (onMarkerClick) {
          onMarkerClick(marker.id);
        }
      });

      // 지도에 마커 추가
      kakaoMarker.setMap(map);

      // 선택된 마커만 오버레이 추가
      if (markerContent) {
        const overlay = new CustomOverlay({
          position: position,
          content: markerContent,
          yAnchor: 1.7, // 핀과 박스 사이 거리 조정 (값이 작을수록 가까움)
        });
        overlay.setMap(map);
        overlaysRef.current.set(marker.id, overlay);
      }

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

    // 폴리곤 추가
    polygons.forEach((polygonConfig) => {
      if (!polygonConfig.path || polygonConfig.path.length < 3) {
        return;
      }
      const path = polygonConfig.path.map(
        (point) => new LatLng(point.lat, point.lng)
      );
      const polygon = new KakaoPolygon({
        path,
        strokeWeight: polygonConfig.strokeWeight ?? 2,
        strokeColor: polygonConfig.strokeColor ?? '#1F2933',
        strokeOpacity: polygonConfig.strokeOpacity ?? 0.6,
        strokeStyle: polygonConfig.strokeStyle ?? 'solid',
        fillColor: polygonConfig.fillColor ?? '#238CFA',
        fillOpacity: polygonConfig.fillOpacity ?? 0.12,
      });
      polygon.setMap(map);
      polygonsRef.current.set(polygonConfig.id, polygon);
    });

    // 마커 업데이트 후 로딩 상태 확실히 해제
    if (mapInstanceRef.current) {
      setIsLoading(false);
    }
  }, [
    markers,
    selectedIds,
    onMarkerClick,
    isKakaoSDKReady,
    displayMode,
    openRoadview,
    polygons,
  ]);

  // 마커 컨텐츠 생성 함수
  const createMarkerContent = (
    marker: MarkerType,
    variant: 'default' | 'minimal',
    onMarkerClick: () => void,
    onRoadviewClick?: () => void
  ) => {
    const displayTitle =
      marker.number !== undefined
        ? `${marker.number}. ${marker.title}`
        : marker.title;

    const baseWrapper = document.createElement('div');
    baseWrapper.style.cssText = `
      padding: 8px 12px;
      background-color: #238CFA;
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

    const titleLine = document.createElement('div');
    titleLine.style.cssText = `
      font-weight: 700;
      font-size: 12px;
      white-space: nowrap;
    `;
    titleLine.textContent =
      displayTitle.length > 18
        ? displayTitle.substring(0, 18) + '...'
        : displayTitle;
    baseWrapper.appendChild(titleLine);

    if (marker.subtitle) {
      const subtitleLine = document.createElement('div');
      subtitleLine.style.cssText = `
        margin-top: 4px;
        font-size: 11px;
        font-weight: 500;
        white-space: nowrap;
        color: rgba(255,255,255,0.9);
      `;
      subtitleLine.textContent =
        marker.subtitle.length > 18
          ? marker.subtitle.substring(0, 18) + '...'
          : marker.subtitle;
      baseWrapper.appendChild(subtitleLine);
    }

    baseWrapper.addEventListener('click', (e) => {
      e.stopPropagation();
      onMarkerClick();
    });

    if (variant === 'minimal' || !onRoadviewClick) {
      return baseWrapper;
    }

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
    baseWrapper.appendChild(button);

    return baseWrapper;
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
          onClose={() => setRoadviewVisible(false)}
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

        const Roadview = window.kakao.maps.Roadview;
        const RoadviewClient = window.kakao.maps.RoadviewClient;
        const LatLng = window.kakao.maps.LatLng;
        const event = window.kakao.maps.event;

        if (!Roadview || !RoadviewClient || !LatLng || !event) {
          onError(
            '로드뷰를 초기화할 수 없습니다. SDK가 완전히 로드되지 않았습니다.'
          );
          return;
        }

        const roadview = new Roadview(roadviewRef.current);
        const roadviewClient = new RoadviewClient();
        const roadviewPosition = new LatLng(position.lat, position.lng);

        roadviewInstanceRef.current = roadview;

        roadviewClient.getNearestPanoId(
          roadviewPosition,
          50,
          (panoId: number) => {
            if (panoId === null) {
              onError(
                '로드뷰를 불러올 수 없습니다. 해당 위치에서 로드뷰가 제공되지 않을 수 있습니다.'
              );
              return;
            }
            roadview.setPanoId(panoId, roadviewPosition);
            onError(null);
          }
        );

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
      className="absolute inset-0 z-[9999] bg-white shadow-xl flex flex-col"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
      }}
    >
      <div className="flex items-center justify-end p-2 border-b bg-gray-50">
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
          height: 'calc(100% - 50px)',
          flex: 1,
        }}
      />
    </div>
  );
};

export default KakaoMap;
