'use client';

import React from 'react';
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
  useKakaoLoader();

  const center = markers.length
    ? { lat: markers[0].lat, lng: markers[0].lng }
    : { lat: 37.5665, lng: 126.978 };

  return (
    <Map center={center} style={{ width: '100%', height: '100%' }} level={3}>
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
