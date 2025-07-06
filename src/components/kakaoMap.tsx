'use client';

import React, { useState, useEffect } from 'react';
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

  useKakaoLoader();

  useEffect(() => {
    // 카카오맵 SDK 로딩 확인
    const checkKakaoMapLoaded = () => {
      if (window.kakao && window.kakao.maps) {
        setIsLoaded(true);
        console.log('KakaoMap SDK 로딩 성공');
      } else {
        setTimeout(checkKakaoMapLoaded, 100);
      }
    };

    checkKakaoMapLoaded();

    // 10초 후에도 로딩되지 않으면 에러 처리
    const timeout = setTimeout(() => {
      if (!window.kakao || !window.kakao.maps) {
        setError(
          '카카오맵을 로딩할 수 없습니다. API 키와 도메인 설정을 확인해주세요.'
        );
        console.error('KakaoMap SDK 로딩 실패');
      }
    }, 10000);

    return () => clearTimeout(timeout);
  }, []);

  // 디버깅용 로그
  console.log('🔍 KakaoMap markers:', markers);
  console.log('🔍 KakaoMap selectedIds:', selectedIds);

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
          <p className="text-red-600 mb-2">{error}</p>
          <p className="text-sm text-gray-600">
            개발자 도구의 콘솔을 확인하여 자세한 오류 정보를 확인하세요.
          </p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-80 flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center">
          <p className="text-gray-600">카카오맵을 로딩 중입니다...</p>
        </div>
      </div>
    );
  }

  return (
    <Map center={mapCenter} style={{ width: '100%', height: '100%' }} level={3}>
      {markers.map((marker) => {
        return (
          <MapMarker
            key={marker.id}
            position={{ lat: marker.lat, lng: marker.lng }}
          >
            <div
              style={{
                padding: '8px 12px',
                backgroundColor: selectedIds.includes(marker.id)
                  ? '#238CFA'
                  : '#666',
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
            </div>
          </MapMarker>
        );
      })}
    </Map>
  );
};

export default KakaoMap;
