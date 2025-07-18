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
}

const KakaoMap: React.FC<KakaoMapProps> = ({
  markers,
  selectedIds,
  center,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 100; // 최대 재시도 횟수를 100회로 늘림 (20초)
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useKakaoLoader();

  useEffect(() => {
    // SSR 환경에서는 클라이언트 사이드에서만 실행
    if (typeof window === 'undefined') {
      console.log('🔍 SSR 환경에서 카카오맵 컴포넌트 스킵');
      return;
    }

    console.log('🔍 카카오맵 컴포넌트 마운트됨');
    console.log('🔍 현재 retryCount:', retryCount);

    // 카카오맵 SDK 로딩 확인
    const checkKakaoMapLoaded = () => {
      console.log('🔍 SDK 로딩 체크 시도:', retryCount + 1);
      console.log('🔍 window.kakao 존재:', !!window.kakao);
      console.log(
        '🔍 window.kakao.maps 존재:',
        !!(window.kakao && window.kakao.maps)
      );

      if (window.kakao && window.kakao.maps) {
        setIsLoaded(true);
        setError(null);
        console.log('✅ KakaoMap SDK 로딩 성공');
        return;
      }

      // 재시도 횟수 제한
      if (retryCount < maxRetries) {
        console.log(
          `⏳ SDK 로딩 재시도 중... (${retryCount + 1}/${maxRetries})`
        );
        retryTimeoutRef.current = setTimeout(() => {
          setRetryCount((prev) => prev + 1);
        }, 200); // 재시도 간격을 200ms로 유지
      } else {
        // 최대 재시도 횟수 초과 시에도 에러를 바로 표시하지 않고 더 기다림
        console.log('⚠️ 최대 재시도 횟수 도달, 추가 대기 중...');
        // 30초 더 기다린 후 에러 표시
        setTimeout(() => {
          if (!window.kakao || !window.kakao.maps) {
            const errorMsg =
              '카카오맵을 로딩할 수 없습니다. API 키와 도메인 설정을 확인해주세요.';
            setError(errorMsg);
            console.error('❌ KakaoMap SDK 로딩 실패 - 최종 타임아웃');
            console.error('❌ 최종 상태 - window.kakao:', !!window.kakao);
            console.error(
              '❌ 최종 상태 - window.kakao.maps:',
              !!(window.kakao && window.kakao.maps)
            );
          }
        }, 30000);
      }
    };

    // 초기 체크 시작
    checkKakaoMapLoaded();

    // 30초 후에도 로딩되지 않으면 에러 처리 (기존 10초에서 30초로 늘림)
    const timeout = setTimeout(() => {
      if (!window.kakao || !window.kakao.maps) {
        console.log('⚠️ 30초 타임아웃 도달, 추가 대기 중...');
        // 30초 더 기다린 후 에러 표시
        setTimeout(() => {
          if (!window.kakao || !window.kakao.maps) {
            const errorMsg =
              '카카오맵을 로딩할 수 없습니다. API 키와 도메인 설정을 확인해주세요.';
            setError(errorMsg);
            console.error('❌ KakaoMap SDK 로딩 실패 - 최종 타임아웃');
            console.error('❌ 타임아웃 시점 - window.kakao:', !!window.kakao);
            console.error(
              '❌ 타임아웃 시점 - window.kakao.maps:',
              !!(window.kakao && window.kakao.maps)
            );
          }
        }, 30000);
      }
    }, 30000);

    return () => {
      console.log('🔍 카카오맵 컴포넌트 언마운트됨');
      clearTimeout(timeout);
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [retryCount, maxRetries]);

  // 외부 카카오맵 로드뷰 열기 함수
  const openRoadview = (lat: number, lng: number) => {
    const roadviewUrl = `https://map.kakao.com/link/roadview/${lat},${lng}`;
    window.open(roadviewUrl, '_blank');
  };

  // 디버깅용 로그
  console.log('🔍 KakaoMap markers:', markers);
  console.log('🔍 KakaoMap selectedIds:', selectedIds);
  console.log('🔍 KakaoMap isLoaded:', isLoaded);
  console.log('🔍 KakaoMap error:', error);

  // 중심점 계산: props로 받은 center가 있으면 사용, 없으면 마커들의 중심점 계산
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

  console.log('🔍 KakaoMap mapCenter:', mapCenter);

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
                // 대안 지도 표시 (Google Maps 링크)
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
                }}
              >
                {marker.title.length > 10
                  ? marker.title.substring(0, 10) + '...'
                  : marker.title}

                {/* 선택된 마커에만 로드뷰 버튼 표시 */}
                {isSelected && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openRoadview(marker.lat, marker.lng);
                    }}
                    style={{
                      display: 'block',
                      marginTop: '4px',
                      padding: '2px 6px',
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '3px',
                      color: 'white',
                      fontSize: '10px',
                      cursor: 'pointer',
                      width: '100%',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        'rgba(255, 255, 255, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor =
                        'rgba(255, 255, 255, 0.2)';
                    }}
                  >
                    로드뷰 보기
                  </button>
                )}
              </div>
            </MapMarker>
          );
        })}
      </Map>
    </div>
  );
};

export default KakaoMap;
