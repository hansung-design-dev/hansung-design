/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    kakao?: {
      maps: {
        LatLng?: new (lat: number, lng: number) => any;
        Map?: new (container: HTMLElement, options?: any) => any;
        Marker?: new (options?: any) => any;
        CustomOverlay?: new (options?: any) => any;
        Roadview?: new (container: HTMLElement, options?: any) => any;
        event?: {
          addListener: (target: any, type: string, handler: () => void) => void;
        };
        load?: (callback: () => void) => void;
        onloadcallbacks?: Array<() => void>;
        [key: string]: any; // 기타 속성 허용
      };
    };
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export {};
