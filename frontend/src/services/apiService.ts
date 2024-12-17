import { TimeSlot, DeliveryDatesResponse, DeliveryTimeSlots } from '../types/delivery';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

interface KakaoAddress {
  address_name: string;
  x: string;  // 경도
  y: string;  // 위도
}

interface AvailableDate {
  date: string;
  timeSlots: TimeSlot[];
  available: boolean;
  isHoliday: boolean;
}

const apiService = {
  categories: {
    getItems: async (categoryId: string) => {
      const response = await api.get(`/api/categories/${categoryId}/items`);
      return response.data;
    },
    getAll: async () => {
      const response = await api.get('/api/categories');
      return response.data;
    },
    getItemDetails: async (categoryId: string, itemId: string) => {
      const response = await api.get(`/api/categories/${categoryId}/items/${itemId}`);
      return response.data;
    },
  },

  items: {
    getItemDetails: async (categoryId: string, itemId: string) => {
      const response = await api.get(`/api/categories/${categoryId}/items/${itemId}/details`);
      return response.data;
    },
  },

  orders: {
    create: async (orderData: any) => {
      const response = await api.post('/api/orders', orderData);
      return response.data;
    },
    getById: async (orderId: number) => {
      const response = await api.get(`/api/orders/${orderId}`);
      return response.data;
    },
  },

  delivery: {
    getOptions: async () => {
      const response = await api.get('/api/delivery');
      return response.data;
    },
    getAvailableDates: async (deliveryType: string, area_code: string = '00000'): Promise<DeliveryDatesResponse> => {
      try {
        const response = await api.get(`/api/delivery/available-dates`, {
          params: { delivery_type: deliveryType, area_code }
        });
        
        // 백엔드에서 받은 문자열 배열을 AvailableDate 객체 배열로 변환
        const dates = (response.data.dates || []).map((dateStr: string) => ({
          date: dateStr,
          timeSlots: [],  // 시간대는 날짜 선택 시 별도로 로드
          available: true,
          isHoliday: false
        }));

        return {
          success: true,
          dates,
          availableTimes: [],  // 시간대는 날짜 선택 시 별도로 로드
          message: response.data.message || ''
        };
      } catch (error) {
        console.error('Available dates API 호출 실패:', error);
        return {
          success: false,
          dates: [],
          availableTimes: [],
          message: '데이터 로딩 실패'
        };
      }
    },
    getTimeSlots: async (date: string, deliveryType: string = 'REGULAR'): Promise<{ success: boolean; data: DeliveryTimeSlots }> => {
      try {
        const response = await api.get(`/api/delivery/delivery-slots/${deliveryType}`, {
          params: { date }
        });

        // 응답 데이터가 비어있는지 확인
        if (!response.data.loading_times || !response.data.unloading_times) {
          return {
            success: false,
            data: {
              loadingTimes: [],
              unloadingTimes: []
            }
          };
        }

        // 시간대 데이터 변환
        const loadingTimes = response.data.loading_times.map((slot: any) => ({
          time: slot.time,
          available: slot.available,
          remainingCapacity: slot.remaining_capacity
        }));

        const unloadingTimes = response.data.unloading_times.map((slot: any) => ({
          time: slot.time,
          available: slot.available,
          remainingCapacity: slot.remaining_capacity
        }));

        return {
          success: true,
          data: {
            loadingTimes,
            unloadingTimes
          }
        };
      } catch (error: any) {
        console.error('Time slots API 호출 실패:', error);
        return {
          success: false,
          data: {
            loadingTimes: [],
            unloadingTimes: []
          }
        };
      }
    },
    getCalendarData: async (year: number, month: number) => {
      const response = await api.get(`/api/delivery/calendar/${year}/${month}`);
      return response.data;
    },
    getDeliveryTimeSlots: async (date: string) => {
      const response = await api.get(`/api/delivery/time-slots/${date}`);
      return response.data;
    }
  },

  address: {
    search: async (query: string) => {
      const response = await api.post('/api/address/search', { query });
      return response.data;
    },

    save: async (fromAddress: KakaoAddress, toAddress: KakaoAddress) => {
      const response = await api.post('/api/address/save', {
        fromAddress,
        toAddress
      });
      return response.data;
    },
  },
};

export default apiService;
