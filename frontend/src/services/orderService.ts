import axios from 'axios';
import { OrderSummary } from '../types/order';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

export const orderService = {
  getOrderSummary: async () => {
    const response = await axios.get(`${API_URL}/api/orders/summary`);
    return response.data as OrderSummary;
  }
};