import axios from 'axios';
import {
  DeliveryTimeSlots,
  DeliveryOptionsResponse,
  AvailableDatesResponse,
  DistanceCalculationResponse
} from '../types/delivery';
import { format } from 'date-fns';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
console.log('API_BASE_URL:', API_BASE_URL);

// axios 인스턴스 생성
const api = axios.create({
  baseURL: `${API_BASE_URL}/api/delivery`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchTimeSlots = async (date: Date): Promise<DeliveryTimeSlots> => {
  try {
    const formattedDate = format(date, 'yyyy-MM-dd');
    console.log('Requesting time slots for:', formattedDate);
    
    const response = await api.get<DeliveryTimeSlots>(`/time-slots/${formattedDate}`);
    console.log('Server response:', response.data);
    
    const defaultTimes = ['09:00', '12:00', '15:00', '18:00'];
    
    const loadingTimes = response.data?.loadingTimes?.length > 0 
      ? response.data.loadingTimes 
      : defaultTimes.map(time => ({
          time,
          available: true,
          current_bookings: 0,
          max_capacity: 100,
          hour: parseInt(time.split(':')[0], 10)
        }));
        
    const unloadingTimes = response.data?.unloadingTimes?.length > 0
      ? response.data.unloadingTimes
      : defaultTimes.map(time => ({
          time,
          available: true,
          current_bookings: 0,
          max_capacity: 100,
          hour: parseInt(time.split(':')[0], 10)
        }));

    console.log('Processed time slots:', { loadingTimes, unloadingTimes });
    
    return {
      loadingTimes,
      unloadingTimes
    };
    
  } catch (error) {
    console.error('Time slots fetch error:', error);
    const defaultTimes = ['09:00', '12:00', '15:00', '18:00'];
    const defaultSlots = defaultTimes.map(time => ({
      time,
      available: true,
      current_bookings: 0,
      max_capacity: 100,
      hour: parseInt(time.split(':')[0], 10)
    }));
    
    return {
      loadingTimes: defaultSlots,
      unloadingTimes: defaultSlots
    };
  }
};

export const fetchDeliveryOptions = async (): Promise<DeliveryOptionsResponse> => {
  try {
    const response = await api.get<DeliveryOptionsResponse>('/');
    return response.data;
  } catch (error) {
    console.error('Error fetching delivery options:', error);
    throw error;
  }
};

export const fetchAvailableDates = async (optionType: 'same-day' | 'next-day' | 'regular'): Promise<AvailableDatesResponse> => {
  try {
    console.log('Fetching dates for option:', optionType);
    
    const response = await api.get<AvailableDatesResponse>(`/available-dates/${optionType}`);
    
    if (!response.data) {
      throw new Error('No data received from server');
    }
    
    console.log('Received response:', response.data);
    
    return {
      success: response.data.success,
      dates: response.data.dates || [],
      message: response.data.message || ''
    };
    
  } catch (error) {
    console.error('Error fetching available dates:', error);
    throw error;
  }
};

export const getDeliveryTimeSlots = async (date: string): Promise<DeliveryTimeSlots> => {
  try {
    const response = await api.get<DeliveryTimeSlots>(`/time-slots/${date}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch time slots:', error);
    return {
      loadingTimes: [],
      unloadingTimes: [],
    };
  }
};

export const getAllTimeSlots = async (): Promise<DeliveryTimeSlots> => {
  try {
    const response = await api.get<DeliveryTimeSlots>('/time-slots');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch all time slots:', error);
    return {
      loadingTimes: [],
      unloadingTimes: [],
    };
  }
};

export const calculateDeliveryFee = async (
  startAddress: any,
  endAddress: any
): Promise<DistanceCalculationResponse> => {
  try {
    const response = await api.post('/calculate-fee', {
      start_address: startAddress,
      end_address: endAddress
    });
    
    return response.data;
  } catch (error) {
    console.error('요금 계산 중 오류:', error);
    throw error;
  }
};

export const deliveryService = {
  fetchAvailableDates,
  getDeliveryTimeSlots,
  getAllTimeSlots,
  fetchDeliveryOptions,
  fetchTimeSlots,
  calculateDeliveryFee,
};