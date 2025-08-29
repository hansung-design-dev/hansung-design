'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Map, MapMarker } from 'react-kakao-maps-sdk';
import useKakaoLoader from './hooks/use-kakao-loader';

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
  onMarkerClick?: (markerId: string) => void; // 마커 클릭 이벤트 추가
}

const KakaoMap: React.FC<KakaoMapProps> = ({
  markers,
  selectedIds,
  center,
  onMarkerClick,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 로드뷰 오버레이 상태
  const [roadviewVisible, setRoadviewVisible] = useState(false);
  const [roadviewPosition, setRoadviewPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [roadviewError, setRoadviewError] = useState<string | null>(null);

  useKakaoLoader();

  // 카카오맵 로딩 체크 개선
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkKakaoMapLoading = () => {
      if (window.kakao && window.kakao.maps) {
        console.log('✅ 카카오맵 SDK 로딩 완료');
        setIsLoading(false);
        setError(null);
      } else {
        console.log('⏳ 카카오맵 SDK 로딩 중...');
        // 3초 후에도 로딩되지 않으면 에러 표시
        setTimeout(() => {
          if (!window.kakao || !window.kakao.maps) {
            console.error('❌ 카카오맵 SDK 로딩 실패');
            setError('카카오맵을 불러올 수 없습니다. API 키를 확인해주세요.');
            setIsLoading(false);
          }
        }, 3000);
      }
    };

    // 초기 체크
    checkKakaoMapLoading();

    // 주기적으로 체크 (최대 10초)
    const interval = setInterval(() => {
      if (window.kakao && window.kakao.maps) {
        clearInterval(interval);
        setIsLoading(false);
        setError(null);
      }
    }, 1000);

    // 10초 후 타임아웃
    const timeout = setTimeout(() => {
      clearInterval(interval);
      if (!window.kakao || !window.kakao.maps) {
        setError('카카오맵 로딩 시간이 초과되었습니다.');
        setIsLoading(false);
      }
    }, 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  // 로드뷰 오버레이 열기
  const openRoadview = (lat: number, lng: number) => {
    console.log('🔍 로드뷰 열기 시도:', { lat, lng });
    console.log(
      '🔍 카카오맵 API 키 확인:',
      process.env.NEXT_PUBLIC_KAKAO_KEY ? '설정됨' : '설정되지 않음'
    );
    setRoadviewError(null);
    setRoadviewPosition({ lat, lng });
    setRoadviewVisible(true);
  };

  // 로드뷰 오버레이 닫기
  const closeRoadview = () => {
    console.log('🔍 로드뷰 닫기');
    setRoadviewVisible(false);
    setRoadviewPosition(null);
    setRoadviewError(null);
  };

  // 마커 클릭 핸들러
  const handleMarkerClick = (markerId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('🔍 마커 클릭:', markerId);
    if (onMarkerClick) {
      onMarkerClick(markerId);
    }
  };

  // 로드뷰 버튼 클릭 핸들러
  const handleRoadviewClick = (
    lat: number,
    lng: number,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    e.preventDefault();
    console.log('🔍 로드뷰 버튼 클릭:', { lat, lng });
    openRoadview(lat, lng);
  };

  // 중심점 계산
  const mapCenter =
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

  if (error) {
    return (
      <div className="w-full h-80 flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center">
          <p className="text-red-600 mb-2 font-medium">{error}</p>
          <p className="text-sm text-gray-600 mb-4">
            개발자 도구의 콘솔을 확인하여 자세한 오류 정보를 확인하세요.
          </p>
          <div className="text-xs text-gray-600 mb-4 text-left">
            <p>🔍 디버그 정보:</p>
            <p>
              • API 키:{' '}
              {process.env.NEXT_PUBLIC_KAKAO_KEY ? '설정됨' : '설정되지 않음'}
            </p>
            <p>
              • 도메인:{' '}
              {typeof window !== 'undefined' ? window.location.hostname : 'SSR'}
            </p>
            <p>• 환경: {process.env.NODE_ENV}</p>
            <p>
              • kakao 객체:{' '}
              {typeof window !== 'undefined'
                ? window.kakao
                  ? '존재'
                  : '없음'
                : 'SSR'}
            </p>
            <p>
              • kakao.maps:{' '}
              {typeof window !== 'undefined'
                ? window.kakao?.maps
                  ? '존재'
                  : '없음'
                : 'SSR'}
            </p>
          </div>
          <p className="text-xs text-orange-600 mb-4">
            💡 카카오맵 API 키가 설정되지 않았을 수 있습니다.
            <br />
            .env.local 파일에 NEXT_PUBLIC_KAKAO_KEY를 추가해주세요.
          </p>
          <div className="space-y-2">
            <button
              onClick={() => {
                setError(null);
                window.location.reload();
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors mr-2"
            >
              다시 시도
            </button>
            <button
              onClick={() => {
                const mapCenter = center || { lat: 37.5665, lng: 126.978 };
                const googleMapsUrl = `https://www.google.com/maps?q=${mapCenter.lat},${mapCenter.lng}`;
                window.open(googleMapsUrl, '_blank');
              }}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              Google Maps로 보기
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            카카오맵 로딩에 문제가 있는 경우 Google Maps를 사용할 수 있습니다.
          </p>
        </div>
      </div>
    );
  }

  // 로딩 중일 때 스켈레톤 표시
  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">카카오맵 로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <Map
        center={mapCenter}
        style={{ width: '100%', height: '100%' }}
        level={3}
      >
        {markers.map((marker) => {
          const isSelected = selectedIds.includes(marker.id);
          return (
            <MapMarker
              key={marker.id}
              position={{ lat: marker.lat, lng: marker.lng }}
            >
              <div
                onClick={(e) => handleMarkerClick(marker.id, e)}
                style={{
                  padding: '8px 12px',
                  backgroundColor: isSelected ? '#238CFA' : '#666',
                  color: 'white',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  minWidth: '60px',
                  textAlign: 'center',
                  cursor: 'pointer',
                }}
              >
                {marker.title.length > 10
                  ? marker.title.substring(0, 10) + '...'
                  : marker.title}
                {isSelected && (
                  <button
                    onClick={(e) =>
                      handleRoadviewClick(marker.lat, marker.lng, e)
                    }
                    style={{
                      display: 'block',
                      marginTop: '6px',
                      padding: '4px 8px',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '4px',
                      color: '#238CFA',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      width: '100%',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'white';
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor =
                        'rgba(255, 255, 255, 0.9)';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    🚗 로드뷰 보기
                  </button>
                )}
              </div>
            </MapMarker>
          );
        })}
      </Map>
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
  const roadviewInstanceRef = useRef<kakao.maps.Roadview | null>(null);
  const retryCountRef = useRef(0);

  useEffect(() => {
    // DOM이 준비될 때까지 대기
    const initRoadview = () => {
      if (!roadviewRef.current || !window.kakao || !window.kakao.maps) {
        console.error('❌ 로드뷰 초기화 실패: 필수 조건 불충족');
        onError('로드뷰를 초기화할 수 없습니다.');
        return;
      }

      // 재시도 카운터 리셋
      retryCountRef.current = 0;

      console.log('🔍 로드뷰 인스턴스 생성 시작:', position);

      try {
        // 기존 인스턴스 제거
        if (roadviewInstanceRef.current) {
          console.log('🔍 기존 로드뷰 인스턴스 제거');
          roadviewInstanceRef.current = null;
        }

        // 로드뷰 컨테이너 초기화
        if (roadviewRef.current) {
          roadviewRef.current.innerHTML = '';
        }

        // 새 인스턴스 생성
        const roadview = new window.kakao.maps.Roadview(roadviewRef.current, {
          position: new window.kakao.maps.LatLng(position.lat, position.lng),
          pov: { pan: 0, tilt: 0, zoom: 1 },
        } as kakao.maps.RoadviewOptions);

        roadviewInstanceRef.current = roadview;
        onError(null);
        console.log('✅ 로드뷰 인스턴스 생성 성공');

        // 로드뷰 로드 상태 확인 (단순화된 버전)
        setTimeout(() => {
          if (roadviewInstanceRef.current) {
            const roadviewElement =
              roadviewRef.current?.querySelector('iframe');
            if (!roadviewElement) {
              console.warn('⚠️ 로드뷰 iframe이 생성되지 않았습니다.');
              // 에러 메시지를 더 구체적으로 표시
              onError(
                '로드뷰를 불러올 수 없습니다. 해당 위치에서 로드뷰가 제공되지 않거나 카카오맵 API 키에 문제가 있을 수 있습니다.'
              );
            } else {
              console.log('✅ 로드뷰 iframe 생성 확인됨');
            }
          }
        }, 8000); // 8초로 조정

        // 로드뷰 로드 완료 이벤트
        window.kakao.maps.event.addListener(roadview, 'init', () => {
          console.log('✅ 로드뷰 초기화 완료');
          onError(null); // 에러 상태 초기화
        });

        // 로드뷰 에러 이벤트
        window.kakao.maps.event.addListener(
          roadview,
          'error',
          (error: unknown) => {
            console.error('❌ 로드뷰 에러:', error);
            onError(
              '로드뷰를 불러올 수 없습니다. 해당 위치에서 로드뷰가 제공되지 않거나 네트워크 문제가 있을 수 있습니다.'
            );
          }
        );

        // 로드뷰 위치 변경 이벤트
        window.kakao.maps.event.addListener(
          roadview,
          'position_changed',
          () => {
            console.log('🔍 로드뷰 위치 변경됨');
          }
        );

        // 로드뷰 로드 타임아웃 설정
        setTimeout(() => {
          if (roadviewInstanceRef.current) {
            const roadviewElement =
              roadviewRef.current?.querySelector('iframe');
            if (!roadviewElement) {
              console.warn('⚠️ 로드뷰 로드 타임아웃');
              onError(
                '로드뷰 로딩이 시간 초과되었습니다. 잠시 후 다시 시도해주세요.'
              );
            } else {
              console.log('✅ 로드뷰 iframe 확인됨');
            }
          }
        }, 10000); // 타임아웃을 10초로 설정
      } catch (error) {
        console.error('❌ 로드뷰 인스턴스 생성 실패:', error);
        console.error('❌ 에러 상세 정보:', {
          error: error,
          kakaoExists: !!window.kakao,
          kakaoMapsExists: !!(window.kakao && window.kakao.maps),
          roadviewRefExists: !!roadviewRef.current,
          position: position,
        });
        onError(
          '로드뷰를 생성할 수 없습니다. 카카오맵 API 키를 확인하거나 잠시 후 다시 시도해주세요.'
        );
      }
    };

    // DOM이 준비될 때까지 대기
    const timer = setTimeout(() => {
      initRoadview();
    }, 100);

    return () => {
      clearTimeout(timer);
      if (roadviewInstanceRef.current) {
        console.log('🔍 로드뷰 인스턴스 정리');
        roadviewInstanceRef.current = null;
      }
    };
  }, [position, onError]);

  return (
    <div
      className="absolute inset-0 z-50 bg-white shadow-xl flex flex-col"
      style={{
        minWidth: 0,
        minHeight: 0,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
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
