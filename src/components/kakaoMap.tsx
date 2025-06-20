'use client';

import React, { useState, useEffect } from 'react';
import { Map, MapMarker } from 'react-kakao-maps-sdk';
import useKakaoLoader from './hooks/use-kakao-loader';

export interface MarkerType {
  id: number;
  title: string;
  lat: number;
  lng: number;
  type: string;
  isSelected?: boolean;
}

interface KakaoMapProps {
  markers: MarkerType[];
  selectedIds: number[];
  onSelect: (id: number) => void;
}

const KakaoMap: React.FC<KakaoMapProps> = ({
  markers,
  selectedIds,
  onSelect,
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

  const center = markers.length
    ? { lat: markers[0].lat, lng: markers[0].lng }
    : { lat: 37.5665, lng: 126.978 };

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
    <Map center={center} style={{ width: '100%', height: '90%' }} level={3}>
      {markers.map((marker) => (
        <MapMarker
          key={marker.id}
          position={{ lat: marker.lat, lng: marker.lng }}
          image={{
            src: selectedIds.includes(marker.id)
              ? '/images/pos_sel.png'
              : '/images/pos.png',
            size: {
              width: selectedIds.includes(marker.id) ? 38 : 27,
              height: selectedIds.includes(marker.id) ? 37 : 34,
            },
          }}
          onClick={() => onSelect(marker.id)}
        >
          {selectedIds.includes(marker.id) && (
            <div style={{ padding: 5, fontWeight: 'bold', color: 'blue' }}>
              {marker.title}
            </div>
          )}
        </MapMarker>
      ))}
    </Map>
  );
};

export default KakaoMap;
