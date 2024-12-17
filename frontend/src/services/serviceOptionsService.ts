import axios from 'axios';
import { ServiceOptionsResponse, SelectedOptions } from '../types/service-options';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const serviceOptionsService = {
  async getOptions(): Promise<ServiceOptionsResponse> {
    try {
      const response = await axios.get<ServiceOptionsResponse>(`${API_BASE_URL}/api/service-options`);
      return response.data;
    } catch (error) {
      console.error('서비스 옵션 로딩 실패:', error);
      throw error;
    }
  },

  async calculateTotalFee(selectedOptions: SelectedOptions): Promise<number> {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/service-options/calculate`, selectedOptions);
      return response.data.total_fee;
    } catch (error) {
      console.error('요금 계산 실패:', error);
      throw error;
    }
  }
}; 