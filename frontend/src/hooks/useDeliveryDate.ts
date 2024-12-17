import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { DeliveryTimeSlots, AvailableDate, TimeSlot } from '../types/delivery';
import apiService from '../services/apiService';

interface UseDeliveryDateReturn {
  selectedDate: Date | null;
  selectedLoadingTime: TimeSlot | null;
  selectedUnloadingTime: TimeSlot | null;
  timeSlotData: DeliveryTimeSlots;
  availableDates: AvailableDate[];
  loading: boolean;
  error: Error | null;
  setSelectedDate: (date: Date | null) => void;
  setSelectedLoadingTime: (time: TimeSlot | null) => void;
  setSelectedUnloadingTime: (time: TimeSlot | null) => void;
  setTimeSlotData: React.Dispatch<React.SetStateAction<DeliveryTimeSlots>>;
  handleDateSelect: (date: Date) => void;
}

export const useDeliveryDate = (selectedOptionType: string = 'REGULAR'): UseDeliveryDateReturn => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedLoadingTime, setSelectedLoadingTime] = useState<TimeSlot | null>(null);
  const [selectedUnloadingTime, setSelectedUnloadingTime] = useState<TimeSlot | null>(null);
  const [timeSlotData, setTimeSlotData] = useState<DeliveryTimeSlots>({ 
    loadingTimes: [], 
    unloadingTimes: [] 
  });
  const [availableDates, setAvailableDates] = useState<AvailableDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // 배송 옵션이 변경될 때마다 사용 가능한 날짜 조회
  useEffect(() => {
    const fetchAvailableDates = async () => {
      try {
        setLoading(true);
        setSelectedDate(null);
        setSelectedLoadingTime(null);
        setSelectedUnloadingTime(null);
        
        // 배송 옵션에 따른 날짜 조회
        const response = await apiService.delivery.getAvailableDates(selectedOptionType);
        console.log('배송 가능 날짜 응답:', response);
        
        if (response.success) {
          setAvailableDates(response.dates);  
        } else {
          throw new Error(response.message || '배송 가능 날짜를 불러오는데 실패했습니다');
        }
      } catch (err) {
        console.error('배송 가능 날짜 조회 중 오류 발생:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableDates();
  }, [selectedOptionType]);

  // 날짜 선택 시 해당 날짜의 시간대 조회
  const handleDateSelect = async (date: Date) => {
    try {
      setLoading(true);
      setSelectedDate(date);
      setSelectedLoadingTime(null);
      setSelectedUnloadingTime(null);
      
      const formattedDate = format(date, 'yyyy-MM-dd');
      console.log('선택된 날짜의 시간대 조회:', formattedDate);
      
      // 상차 시간만 먼저 가져오기
      const response = await apiService.delivery.getTimeSlots(formattedDate, selectedOptionType);
      if (response.success) {
        setTimeSlotData({
          loadingTimes: response.data.loadingTimes,
          unloadingTimes: [] // 하차 시간은 상차 시간 선택 시에 필터링
        });
        setError(null);
      }
    } catch (err) {
      console.error('배송 시간대 조회 중 오류 발생:', err);
      // 에러 발생해도 페이지 이동하지 않고 에러 메시지만 표시
      setError(err as Error);
      setTimeSlotData({ 
        loadingTimes: [], 
        unloadingTimes: [] 
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    selectedDate,
    selectedLoadingTime,
    selectedUnloadingTime,
    timeSlotData,
    availableDates,
    loading,
    error,
    setSelectedDate,
    setSelectedLoadingTime,
    setSelectedUnloadingTime,
    setTimeSlotData,
    handleDateSelect
  };
};
