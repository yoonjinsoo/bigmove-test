import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request 인터셉터
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response 인터셉터
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 토큰 만료 (401)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const response = await api.post('/auth/refresh');
        const { token } = response.data;
        
        localStorage.setItem('token', token);
        originalRequest.headers.Authorization = `Bearer ${token}`;
        
        return api(originalRequest);
      } catch (refreshError) {
        // 토큰 갱신 실패 시 로그아웃 및 에러 메시지
        useAuthStore.getState().logout();
        throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
      }
    }

    // 서버 에러 (500)
    if (error.response?.status >= 500) {
      throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }

    // 권한 없음 (403)
    if (error.response?.status === 403) {
      throw new Error('해당 작업에 대한 권한이 없습니다.');
    }

    // 잘못된 요청 (400)
    if (error.response?.status === 400) {
      const message = error.response.data.message || '잘못된 요청입니다.';
      throw new Error(message);
    }

    // 네트워크 오류
    if (!error.response) {
      throw new Error('네트워크 연결을 확인해주세요.');
    }

    return Promise.reject(error);
  }
);

export const getFurnitureCategories = async () => {
  const response = await api.get('/furniture-categories');
  return response.data;
};

export const createOrder = async (orderData: any) => {
  const response = await api.post('/orders', orderData);
  return response.data;
};

export const getOrder = async (orderId: number) => {
  const response = await api.get(`/orders/${orderId}`);
  return response.data;
};

export const getUserOrders = async (userId: number) => {
  const response = await api.get(`/users/${userId}/orders`);
  return response.data;
};

export const processPayment = async (orderId: number) => {
  const response = await api.post(`/orders/${orderId}/pay`);
  return response.data;
};

export const createReview = async (reviewData: any) => {
  const response = await api.post('/reviews', reviewData);
  return response.data;
};

export const getOrderReviews = async (orderId: number) => {
  const response = await api.get(`/orders/${orderId}/reviews`);
  return response.data;
};

export default api;
