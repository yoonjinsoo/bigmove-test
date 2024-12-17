export interface KakaoAddressResult {
  address_name: string;
  road_address_name?: string;
  x: string;
  y: string;
}

declare global {
  interface Window {
    kakao: {
      maps: {
        services: {
          Places: new () => {
            keywordSearch: (
              query: string,
              callback: (
                result: KakaoAddressResult[],
                status: 'OK' | 'ZERO_RESULT' | 'ERROR',
                pagination: any
              ) => void
            ) => void;
          };
          Geocoder: new () => {
            addressSearch: (
              address: string,
              callback: (result: any[], status: string) => void
            ) => void;
          };
          Status: {
            OK: string;
            ZERO_RESULT: string;
            ERROR: string;
          };
        };
        load: (callback: () => void) => void;
      };
    };
  }
}

export {}; 