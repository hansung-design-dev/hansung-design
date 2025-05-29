'use client';
import { useEffect, useRef } from 'react';

export default function KakaoMap() {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 이미 스크립트가 있으면 중복 추가 방지
    if (window.kakao && window.kakao.maps) {
      loadMap();
      return;
    }
    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.KAKAO_KEY}&autoload=false`;
    script.async = true;
    script.onload = () => {
      window.kakao.maps.load(loadMap);
    };
    document.head.appendChild(script);

    function loadMap() {
      if (!mapRef.current) return;
      const map = new window.kakao.maps.Map(mapRef.current, {
        center: new window.kakao.maps.LatLng(37.5665, 126.978),
        level: 3,
      });
      new window.kakao.maps.Marker({
        position: new window.kakao.maps.LatLng(37.5665, 126.978),
        map,
      });
    }
  }, []);

  return <div ref={mapRef} style={{ width: '100%', height: 400 }} />;
}
