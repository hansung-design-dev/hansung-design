'use client';

import { useEffect, useRef, useState } from 'react';

type KakaoTestConfig = {
  appKey: string;
  center: { lat: number; lng: number };
};

export default function KakaoMapTestPage() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState<string>('Initializing...');

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setStatus('Fetching config...');
        const res = await fetch('/api/kakao-test-config', {
          cache: 'no-store',
        });
        if (!res.ok) throw new Error('Failed to fetch kakao-test-config');
        const { appKey, center } = (await res.json()) as KakaoTestConfig;
        const maskedKey = appKey
          ? `${appKey.slice(0, 4)}****${appKey.slice(-4)}`
          : '(empty)';
        console.debug('[kakao-test] config', {
          appKeyPresent: !!appKey,
          maskedKey,
          center,
        });

        if (!appKey) {
          setStatus('KAKAO_MAP_JS_KEY is missing');
          console.error('[kakao-test] Missing appKey');
          return;
        }

        setStatus('Loading Kakao Maps SDK...');
        // Avoid duplicate script insertion
        const existing = document.querySelector(
          'script[data-kakao-sdk="v2-maps"]'
        ) as HTMLScriptElement | null;
        if (!existing) {
          const script = document.createElement('script');
          script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(
            appKey
          )}&autoload=false`;
          script.async = true;
          script.defer = true;
          script.dataset.kakaoSdk = 'v2-maps';
          document.head.appendChild(script);
          console.debug('[kakao-test] script appended', { src: script.src });
          // Watchdog timeout in case onload never fires (adblock/CSP/network)
          await new Promise<void>((resolve, reject) => {
            const timeout = window.setTimeout(() => {
              console.error('[kakao-test] SDK load timeout (8s)');
              setStatus('SDK load timeout (check adblock/CSP/network)');
              reject(new Error('SDK load timeout'));
            }, 8000);
            script.onload = () => {
              console.debug('[kakao-test] script onload');
              window.clearTimeout(timeout);
              resolve();
            };
            script.onerror = () => {
              console.error('[kakao-test] script onerror');
              window.clearTimeout(timeout);
              reject(new Error('Failed to load Kakao SDK'));
            };
          });
        } else {
          console.debug('[kakao-test] reusing existing script');
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const w = window as any;
        console.debug('[kakao-test] window.kakao presence', {
          hasKakao: !!w.kakao,
          hasMaps: !!(w.kakao && w.kakao.maps),
        });

        // Always initialize inside kakao.maps.load when autoload=false
        let loadedViaLoad = false;
        try {
          await new Promise<void>((resolve, reject) => {
            let loadCalled = false;
            const timeout = window.setTimeout(() => {
              if (!loadCalled) {
                console.error('[kakao-test] kakao.maps.load timeout (8s)');
                setStatus('kakao.maps.load timeout');
                reject(new Error('kakao.maps.load timeout'));
              }
            }, 8000);
            try {
              w.kakao.maps.load(() => {
                loadCalled = true;
                window.clearTimeout(timeout);
                console.debug('[kakao-test] kakao.maps.load callback');
                resolve();
              });
            } catch (e) {
              window.clearTimeout(timeout);
              console.error('[kakao-test] kakao.maps.load threw', e);
              reject(e as Error);
            }
          });
          loadedViaLoad = true;
        } catch (e) {
          console.warn('[kakao-test] falling back to autoload=true path');
          // Fallback: try loading SDK again with autoload=true
          const fallbackExisting = document.querySelector(
            'script[data-kakao-sdk="v2-maps-fallback"]'
          ) as HTMLScriptElement | null;
          if (!fallbackExisting) {
            const script2 = document.createElement('script');
            script2.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(
              appKey
            )}`; // default autoload=true
            script2.async = true;
            script2.defer = true;
            script2.dataset.kakaoSdk = 'v2-maps-fallback';
            document.head.appendChild(script2);
            await new Promise<void>((resolve, reject) => {
              const timeout2 = window.setTimeout(() => {
                console.error('[kakao-test] fallback SDK load timeout (8s)');
                setStatus('SDK fallback load timeout');
                reject(new Error('SDK fallback load timeout'));
              }, 8000);
              script2.onload = () => {
                window.clearTimeout(timeout2);
                console.debug('[kakao-test] fallback script onload');
                resolve();
              };
              script2.onerror = () => {
                window.clearTimeout(timeout2);
                console.error('[kakao-test] fallback script onerror');
                reject(new Error('fallback SDK load error'));
              };
            });
          } else {
            console.debug('[kakao-test] reusing fallback script');
          }
        }

        if (!mounted) return;

        if (!w.kakao || !w.kakao.maps) {
          setStatus('kakao.maps not available after load');
          console.error('[kakao-test] kakao.maps not available after load');
          return;
        }

        const LatLngCtor = w.kakao.maps.LatLng;
        console.debug(
          '[kakao-test] typeof kakao.maps.LatLng',
          typeof LatLngCtor
        );
        if (typeof LatLngCtor !== 'function') {
          setStatus('kakao.maps.LatLng not available');
          console.error('[kakao-test] LatLng not a function', LatLngCtor);
          return;
        }

        if (containerRef.current) {
          setStatus('Rendering map...');
          const centerLatLng = new w.kakao.maps.LatLng(center.lat, center.lng);
          const map = new w.kakao.maps.Map(containerRef.current, {
            center: centerLatLng,
            level: 4,
          });

          new w.kakao.maps.Marker({ position: centerLatLng, map });

          setStatus('Kakao Map loaded');
          console.debug('[kakao-test] map rendered');
        } else {
          setStatus('Container not ready');
          console.error('[kakao-test] containerRef is null');
        }
      } catch (err) {
        console.error('[kakao-test] error', err);
        setStatus((err as Error).message || 'Unexpected error');
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="p-4" style={{ marginTop: '5rem' }}>
      <h1 style={{ fontSize: 20, fontWeight: 700 }}>Kakao Map SDK Test</h1>
      <p style={{ margin: '8px 0 16px', color: 'red' }}>Status: {status}</p>
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '480px',
          border: '1px solid #eee',
          borderRadius: 8,
        }}
      />
    </div>
  );
}
