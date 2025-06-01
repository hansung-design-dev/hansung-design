// src/components/KakaoMap.tsx

'use client';

import { Map, MapMarker } from 'react-kakao-maps-sdk';
import useKakaoLoader from './hooks/use-kakao-loader';

export interface MarkerData {
  id: number;
  title: string;
  lat: number;
  lng: number;
  type?: string; // led/banner 등 구분용 (옵션)
}

interface KakaoMapProps {
  markers: MarkerData[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}

export default function KakaoMap({
  markers,
  selectedId,
  onSelect,
}: KakaoMapProps) {
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
            src:
              selectedId === marker.id
                ? '/images/pos_sel.png'
                : '/images/pos.png',
            size: {
              width: selectedId === marker.id ? 38 : 27,
              height: selectedId === marker.id ? 37 : 34,
            },
          }}
          onClick={() => onSelect(marker.id)}
        >
          {selectedId === marker.id && (
            <div style={{ padding: 5, fontWeight: 'bold', color: 'blue' }}>
              {marker.title}
            </div>
          )}
        </MapMarker>
      ))}
    </Map>
  );
}
