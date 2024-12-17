declare global {
  interface Window {
    kakao: any;
  }
}

export const calculateDistance = async (fromAddress: string, toAddress: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    // Kakao Maps API 로드 확인
    if (!window.kakao?.maps?.services) {
      reject(new Error('Kakao Maps API가 로드되지 않았습니다.'));
      return;
    }

    const geocoder = new window.kakao.maps.services.Geocoder();

    // 주소를 좌표로 변환하는 함수
    const getCoordinates = (address: string): Promise<{ lat: number; lng: number }> => {
      return new Promise((resolveGeo, rejectGeo) => {
        geocoder.addressSearch(address, (result: any[], status: string) => {
          if (status === window.kakao.maps.services.Status.OK) {
            resolveGeo({
              lat: Number(result[0].y),
              lng: Number(result[0].x)
            });
          } else {
            rejectGeo(new Error(`주소를 찾을 수 없습니다: ${address}`));
          }
        });
      });
    };

    // 직선 거리 계산 함수
    const calculateLinearDistance = (point1: { lat: number; lng: number }, point2: { lat: number; lng: number }): number => {
      const R = 6371; // 지구의 반경 (km)
      const dLat = toRad(point2.lat - point1.lat);
      const dLon = toRad(point2.lng - point1.lng);
      const lat1 = toRad(point1.lat);
      const lat2 = toRad(point2.lat);

      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    };

    // 라디안 변환 함수
    const toRad = (value: number): number => {
      return value * Math.PI / 180;
    };

    // 실행
    Promise.all([
      getCoordinates(fromAddress),
      getCoordinates(toAddress)
    ])
      .then(([from, to]) => {
        const distance = calculateLinearDistance(from, to);
        // 거리를 소수점 첫째 자리까지 반올림
        resolve(Number(distance.toFixed(1)));
      })
      .catch(error => {
        console.error('거리 계산 중 오류:', error);
        reject(error);
      });
  });
};

// 카카오 주소 검색 API 응답 타입
export interface KakaoAddressResult {
  address_name: string;
  road_address: {
    address_name: string;
    building_name?: string;
    zone_no: string;
  } | null;
  address: {
    address_name: string;
  };
  x: string;
  y: string;
}

// 주소 검색 함수
export const searchAddress = async (keyword: string): Promise<KakaoAddressResult[]> => {
  return new Promise((resolve, reject) => {
    if (!window.kakao?.maps?.services) {
      reject(new Error('Kakao Maps API가 로드되지 않았습니다.'));
      return;
    }

    const geocoder = new window.kakao.maps.services.Geocoder();
    
    geocoder.addressSearch(keyword, (result: any[], status: string) => {
      if (status === window.kakao.maps.services.Status.OK) {
        resolve(result);
      } else {
        reject(new Error('주소 검색 결과가 없습니다.'));
      }
    });
  });
};

// 아래 함수만 추가
export const initializeKakaoMap = () => {
  return new Promise<void>((resolve, reject) => {
    try {
      const checkKakao = setInterval(() => {
        if (window.kakao?.maps) {
          clearInterval(checkKakao);
          window.kakao.maps.load(() => {
            resolve();
          });
        }
      }, 100);

      // 30초 후에도 로드되지 않으면 에러
      setTimeout(() => {
        clearInterval(checkKakao);
        reject(new Error('카카오맵 API 로드 타임아웃'));
      }, 30000);
    } catch (error) {
      reject(error);
    }
  });
}; 