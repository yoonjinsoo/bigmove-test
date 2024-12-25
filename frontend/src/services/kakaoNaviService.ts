import axios from 'axios';

interface NaviResponse {
  distance: number;      // 총 거리 (미터)
  duration: number;      // 소요 시간 (초)
  sections: {
    distance: number;    // 구간 거리
    duration: number;    // 구간 소요 시간
    roads: Array<{      // 도로 정보
      name: string;     // 도로명
      distance: number; // 도로 구간 거리
      traffic_speed: number; // 평균 속도
    }>;
  }[];
}

export const calculateRoadDistance = async (
  originLat: number, 
  originLng: number, 
  destLat: number, 
  destLng: number
): Promise<{distance: number; duration: number}> => {
  try {
    const origin = `${originLng},${originLat}`;
    const destination = `${destLng},${destLat}`;
    
    const response = await axios.get<NaviResponse>(
      `${process.env.REACT_APP_API_URL}/api/directions`, {
        params: {
          origin,
          destination
        }
      }
    );

    return {
      distance: response.data.distance / 1000, // m를 km로 변환
      duration: Math.round(response.data.duration / 60) // 초를 분으로 변환
    };

  } catch (error) {
    console.error('도로 거리 계산 실패:', error);
    throw new Error('자동차 이동거리 측정에 실패하여 직선거리로 안내합니다!');
  }
}; 