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
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 100;
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 로드뷰 오버레이 상태
  const [roadviewVisible, setRoadviewVisible] = useState(false);
  const [roadviewPosition, setRoadviewPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [roadviewError, setRoadviewError] = useState<string | null>(null);

  useKakaoLoader();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const checkKakaoMapLoaded = () => {
      if (window.kakao && window.kakao.maps) {
        setIsLoaded(true);
        setError(null);
        return;
      }
      if (retryCount < maxRetries) {
        retryTimeoutRef.current = setTimeout(() => {
          setRetryCount((prev) => prev + 1);
        }, 200);
      } else {
        setTimeout(() => {
          if (!window.kakao || !window.kakao.maps) {
            setError(
              '카카오맵을 로딩할 수 없습니다. API 키와 도메인 설정을 확인해주세요.'
            );
          }
        }, 30000);
      }
    };
    checkKakaoMapLoaded();
    const timeout = setTimeout(() => {
      if (!window.kakao || !window.kakao.maps) {
        setTimeout(() => {
          if (!window.kakao || !window.kakao.maps) {
            setError(
              '카카오맵을 로딩할 수 없습니다. API 키와 도메인 설정을 확인해주세요.'
            );
          }
        }, 30000);
      }
    }, 30000);
    return () => {
      clearTimeout(timeout);
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
    };
  }, [retryCount, maxRetries]);

  // 로드뷰 오버레이 열기
  const openRoadview = (lat: number, lng: number) => {
    console.log('🔍 로드뷰 열기 시도:', { lat, lng });
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
          <div className="space-y-2">
            <button
              onClick={() => {
                setError(null);
                setIsLoaded(false);
                setRetryCount(0);
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

  if (!isLoaded) {
    return (
      <div className="w-full h-80 flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-gray-600 mb-1">카카오맵을 로딩 중입니다...</p>
          <p className="text-xs text-gray-500">
            재시도 횟수: {retryCount}/{maxRetries}
          </p>
          {retryCount > 50 && (
            <p className="text-xs text-orange-500 mt-2">
              로딩이 오래 걸리고 있습니다. 잠시만 기다려주세요...
            </p>
          )}
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

  useEffect(() => {
    if (!roadviewRef.current || !window.kakao || !window.kakao.maps) {
      console.error('❌ 로드뷰 초기화 실패: 필수 조건 불충족');
      onError('로드뷰를 초기화할 수 없습니다.');
      return;
    }

    console.log('🔍 로드뷰 인스턴스 생성 시작:', position);

    try {
      // 기존 인스턴스 제거
      if (roadviewInstanceRef.current) {
        console.log('🔍 기존 로드뷰 인스턴스 제거');
        roadviewInstanceRef.current = null;
      }

      // 새 인스턴스 생성
      const roadview = new window.kakao.maps.Roadview(roadviewRef.current, {
        position: new window.kakao.maps.LatLng(position.lat, position.lng),
        pov: { pan: 0, tilt: 0, zoom: 1 },
      } as kakao.maps.RoadviewOptions);

      roadviewInstanceRef.current = roadview;
      onError(null);
      console.log('✅ 로드뷰 인스턴스 생성 성공');

      // 로드뷰 로드 완료 이벤트
      window.kakao.maps.event.addListener(roadview, 'init', () => {
        console.log('✅ 로드뷰 초기화 완료');
      });

      // 로드뷰 에러 이벤트
      window.kakao.maps.event.addListener(
        roadview,
        'error',
        (error: unknown) => {
          console.error('❌ 로드뷰 에러:', error);
          onError(
            '로드뷰를 불러올 수 없습니다. 해당 위치에서 로드뷰가 제공되지 않을 수 있습니다.'
          );
        }
      );
    } catch (error) {
      console.error('❌ 로드뷰 인스턴스 생성 실패:', error);
      onError('로드뷰를 생성할 수 없습니다.');
    }

    return () => {
      if (roadviewInstanceRef.current) {
        console.log('🔍 로드뷰 인스턴스 정리');
        roadviewInstanceRef.current = null;
      }
    };
  }, [position, onError]);

  return (
    <div
      className="absolute inset-0 z-20 bg-white shadow-xl flex flex-col"
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
        <h3 className="text-sm font-semibold text-gray-800">
          로드뷰 - {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
        </h3>
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
