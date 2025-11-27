declare global {
  interface Window {
    kakao?: {
      maps: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        LatLng?: new (lat: number, lng: number) => any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Map?: new (container: HTMLElement, options?: any) => any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Marker?: new (options?: any) => any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        CustomOverlay?: new (options?: any) => any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Roadview?: new (container: HTMLElement, options?: any) => any;
        event?: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          addListener: (target: any, type: string, handler: () => void) => void;
        };
        load?: (callback: () => void) => void;
        onloadcallbacks?: Array<() => void>;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [key: string]: any; // 기타 속성 허용
      };
    };
  }
}

export {};
