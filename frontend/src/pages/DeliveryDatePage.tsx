import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { addDays, isBefore, startOfDay, isSameDay } from 'date-fns';
import ProgressBar from '../components/common/ProgressBar';
import Calendar from 'react-calendar';
import type { Value } from 'react-calendar/dist/cjs/shared/types';
import 'react-calendar/dist/Calendar.css';
import { SelectedDelivery, DeliveryOption, TimeSlot, TimeSlotResponse } from '../types/delivery';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import styled from 'styled-components';
import apiService from '../services/apiService';
import TimeSelector from '../components/DateSelection/TimeSelection/TimeSelector';
import { MdArrowBack, MdArrowForward } from 'react-icons/md';
import { ButtonContainer, Button } from './styles/SelectionSummaryStyles';
import useOrderStore from '../store/orderStore'; // orderStore 추가

const PageContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;

  > ${ButtonContainer} {
    margin-top: 0rem;
  }

  @media (min-width: 768px) {
    padding: 2rem;
  }
`;

const DeliveryOptions = styled.div`
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
  margin-bottom: 2rem;
  justify-content: center;
  width: 100%;
`;

const OptionButton = styled.button<{ selected: boolean }>`
  flex: 1;
  min-width: 0;
  padding: 0.75rem;
  border: 2px solid ${props => props.selected ? 'var(--cyan)' : 'var(--mediumGray)'};
  border-radius: 8px;
  background: ${props => props.selected ? 'var(--darkGray)' : '#282B30'};
  cursor: pointer;
  color: ${props => props.selected ? 'var(--cyan)' : 'var(--darkGray)'};
  transition: all 0.2s ease;
  font-size: clamp(0.75rem, 2vw, 1rem);

  &:hover {
    border-color: var(--cyan);
    color: var(--cyan);
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const OptionPrice = styled.div`
  font-weight: bold;
  color: var(--cyan);
  margin-top: 0.25rem;
  font-size: clamp(0.7rem, 1.8vw, 0.9rem);
`;

const OptionDescription = styled.div`
  font-size: clamp(0.65rem, 1.6vw, 0.85rem);
  margin-top: 0.25rem;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 2rem;
  text-align: center;
  color: var(--cyan);
`;

const PageLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0rem;
  margin-top: 2rem;

  @media (min-width: 768px) {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
`;

// 스타일 컴포넌트의 props 타입 정의
interface CalendarContainerProps {
  selectedOption: DeliveryOption | null;
}

const CalendarContainer = styled.div<CalendarContainerProps>`
  .react-calendar {
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
    background: var(--darkGray);
    border: 1px solid var(--cyan);
    border-radius: 8px;
    padding: 16px;
    font-family: Arial, Helvetica, sans-serif;
    color: var(--lightGray);

    @media (min-width: 768px) {
      margin-left: 20px;
    }

    button {
      padding: 8px 4px;
      font-size: 14px;

      @media (min-width: 768px) {
        padding: 8px;
        font-size: 16px;
      }
    }

    .react-calendar__navigation {
      margin-bottom: 16px;

      button {
        min-width: 44px;
        background: none;
        font-size: 16px;
        color: var(--lightGray);

        &:enabled:hover,
        &:enabled:focus {
          background-color: var(--cyan);
          color: var(--darkGray);
        }
      }
    }

    .react-calendar__month-view__weekdays {
      text-align: center;
      text-transform: uppercase;
      font-weight: bold;
      font-size: 14px;
      margin-bottom: 8px;

      abbr {
        text-decoration: none;
        color: var(--cyan);
      }
    }

    .react-calendar__month-view__weekdays__weekday:first-child abbr,
    .react-calendar__month-view__days > div > button:nth-child(7n + 1) {
      color: #ff4d4d;
    }

    .react-calendar__month-view__weekdays__weekday:last-child abbr,
    .react-calendar__month-view__days > div > button:nth-child(7n) {
      color: #4d94ff;
    }

    .react-calendar__month-view__days__day {
      padding: 8px;
      background: none;
      font-size: 14px;
      color: var(--lightGray);

      &:enabled:hover,
      &:enabled:focus {
        background-color: var(--cyan);
        color: var(--darkGray);
      }

      &--weekend {
        color: var(--darkGray);
      }
    }

    .react-calendar__tile--active {
      background: var(--cyan) !important;
      color: var(--darkGray) !important;
      border-radius: 4px;
    }

    .react-calendar__tile--disabled {
      background-color: var(--mediumGray);
      color: var(--lightGray);
    }

    .react-calendar__tile {
      position: relative;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      
      &:enabled {
        background: none;
        transition: all 0.2s ease;
        
        &:hover {
          background-color: rgba(0, 255, 255, 0.2) !important;
          color: var(--cyan) !important;
        }
      }
    }

    .react-calendar__tile--disabled {
      opacity: 0.3;
      background: none !important;
      cursor: default;

      &:hover {
        background: none !important;
        color: var(--lightGray) !important;
      }
    }

    .react-calendar__tile--active {
      background-color: var(--cyan) !important;
      color: var(--darkGray) !important;
      font-weight: bold;
      border-radius: 4px;

      &:hover {
        background-color: var(--cyan) !important;
        color: var(--darkGray) !important;
      }
    }

    .react-calendar__tile--now {
      background: none !important;
      color: inherit;
    }

    .react-calendar__month-view__days__day--weekend {
      &:first-child {
        color: #ff8080 !important;  // 일요일
      }
      &:last-child {
        color: #80b3ff !important;  // 토요일
      }
    }

    .react-calendar__navigation {
      button {
        &:enabled {
          &:hover,
          &:focus {
            background-color: rgba(0, 255, 255, 0.1);
            color: var(--cyan);
          }
        }
      }
    }

    .react-calendar__tile--now:not(.react-calendar__tile--disabled) {
      &:enabled {
        background: ${({ selectedOption }) => {
          if (!selectedOption) return 'none';
          switch (selectedOption.type) {
            case 'SAME_DAY':
              return 'rgba(0, 255, 255, 0.1)';
            default:
              return 'none';
          }
        }};
        border-radius: 4px;
      }
    }

    .react-calendar__tile--nextDay:not(.react-calendar__tile--disabled) {
      &:enabled {
        background: ${({ selectedOption }) => 
          selectedOption?.type === 'NEXT_DAY' 
            ? 'rgba(0, 255, 255, 0.1)' 
            : 'none'
        };
        border-radius: 4px;
      }
    }

    .react-calendar__tile--regular:not(.react-calendar__tile--disabled) {
      &:enabled {
        background: ${({ selectedOption }) => 
          selectedOption?.type === 'REGULAR' 
            ? 'rgba(0, 255, 255, 0.1)' 
            : 'none'
        };
        border-radius: 4px;
      }
    }

    // 가용 날짜 하이라이트 스타일
    .highlight-date {
      background-color: rgba(0, 255, 255, 0.1) !important;
      color: var(--cyan) !important;
      border-radius: 4px;

      &:hover {
        background-color: rgba(0, 255, 255, 0.2) !important;
      }

      &.react-calendar__tile--active {
        background-color: var(--cyan) !important;
        color: var(--darkGray) !important;
        font-weight: bold;
      }
    }

    // 선택 불가능한 날짜
    .react-calendar__tile--disabled {
      opacity: 0.3;
      background: none !important;
      color: var(--lightGray) !important;
    }
  }
`;

const TimeSection = styled.div`
  width: 100%;
  background: var(--darkGray);
  border-radius: 8px;
  padding: 1rem;
  position: relative;

  .select-date-message {
    text-align: center;
    padding: 2rem;
    word-break: keep-all;      // 한글 단어 단위 줄바꿈
    word-wrap: break-word;     // 긴 단어 줄바꿈
    
    .guide-message {
      display: block;
      margin-bottom: 8px;
      color: var(--cyan);
      
      @media (max-width: 768px) {
        padding: 0 1rem;
        font-size: 0.9rem;
      }
    }
    
    .select-message {
      display: block;
      color: var(--white);
      
      @media (max-width: 768px) {
        padding: 0 1rem;
        font-size: 0.9rem;
      }
    }
  }
`;

const SectionTitle = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: var(--darkGray);
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
`;

const ErrorMessageContainer = styled.div`
  white-space: pre-line;     // \n 줄바꿈 적용
  word-break: keep-all;      // 한글 단어 단위 줄바꿈
  word-wrap: break-word;     // 긴 단어 줄바꿈
  text-align: center;
  margin: 1rem 0;
  color: var(--red);
  
  @media (max-width: 768px) {
    padding: 0 1rem;         // 모바일에서 좌우 여백 추가
    font-size: 0.9rem;       // 모바일에서 글자 크기 조정
  }
`;

const deliveryOptions: DeliveryOption[] = [
  {
    id: "1",
    type: 'SAME_DAY',
    name: '당일배송',
    label: '당일 배송',
    price: 50000,
    description: '오늘 중으로 배송'
  },
  {
    id: "2",
    type: 'NEXT_DAY',
    name: '익일배송',
    label: '익일 배송',
    price: 30000,
    description: '내일 배송'
  },
  {
    id: "3",
    type: 'REGULAR',
    name: '일반배송',
    label: '일반 배송',
    price: 0,
    description: '3일 이후 배송'
  },
];

interface TimeSlotCache {
  [key: string]: {
    data: TimeSlotResponse['data'];
    timestamp: number;
  }
}

const DeliveryDatePage: React.FC = () => {
  const navigate = useNavigate();
  const { updateOrderData } = useOrderStore();  // orderStore 추가
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedOption, setSelectedOption] = useState<DeliveryOption | null>(null);
  const [selectedLoadingTime, setSelectedLoadingTime] = useState<TimeSlot | null>(null);
  const [selectedUnloadingTime, setSelectedUnloadingTime] = useState<TimeSlot | null>(null);
  const [timeSlots, setTimeSlots] = useState<{ loading_times: TimeSlot[], unloading_times: TimeSlot[] }>({
    loading_times: [],
    unloading_times: []
  });
  const [timeSlotCache, setTimeSlotCache] = useState<TimeSlotCache>({});
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const now = new Date();
    const hour = now.getHours();
    if (hour >= 14) {
      setErrorMessage('현재 시각은 당일 배송 접수가 마감된 시간입니다.\n(당일 배송 접수 가능 시간 : 14시까지)\n익일 배송이나 일반 배송을 선택해 주세요.');
    }
  }, []);

  const handleOptionSelect = useCallback(async (option: DeliveryOption) => {
    setSelectedOption(option);
    setSelectedDate(null);
    setSelectedLoadingTime(null);
    setSelectedUnloadingTime(null);
    setTimeSlots({ loading_times: [], unloading_times: [] });
    setErrorMessage(null);

    // 당일 배송인 경우 현재 시간 체크
    if (option.type === 'SAME_DAY') {
      const now = new Date();
      const hour = now.getHours();
      if (hour >= 14) {
        setErrorMessage('죄송합니다. 당일 배송은 14시까지만 가능합니다. 익일 배송이나 일반 배송을 이용해주세요.');
        return;
      }
    }
  }, []);

  const isDateDisabled = useCallback((date: Date) => {
    const today = startOfDay(new Date());
    const maxDate = addDays(today, 28);
    
    if (isBefore(maxDate, date)) {
      return true;
    }

    switch (selectedOption?.type) {
      case 'SAME_DAY':
        return !isSameDay(date, today);
      case 'NEXT_DAY':
        return !isSameDay(date, addDays(today, 1));
      case 'REGULAR':
        return isBefore(date, addDays(today, 3)) || isBefore(maxDate, date);
      default:
        return true;
    }
  }, [selectedOption?.type]);

  const fetchTimeSlots = useCallback(async (date: Date) => {
    try {
      setLoading(true);
      const formattedDate = date.toISOString().split('T')[0];
      const cacheKey = `${formattedDate}-${selectedOption?.type}`;
      
      // 캐시 확인
      const cachedData = timeSlotCache[cacheKey];
      const now = Date.now();
      if (cachedData && (now - cachedData.timestamp) < 30 * 60 * 1000) {
        setTimeSlots({
          loading_times: cachedData.data.loadingTimes,
          unloading_times: cachedData.data.unloadingTimes
        });
        setLoading(false);
        return;
      }

      const response: TimeSlotResponse = await apiService.delivery.getTimeSlots(formattedDate, selectedOption?.type);
      
      if (!response.success) {
        setErrorMessage('시간대 조회에 실패했습니다');
        return;
      }

      // 캐시 저장
      setTimeSlotCache(prev => ({
        ...prev,
        [cacheKey]: {
          data: response.data,
          timestamp: now
        }
      }));

      setTimeSlots({
        loading_times: response.data.loadingTimes,
        unloading_times: response.data.unloadingTimes
      });
    } catch (err) {
      setErrorMessage('시간대 조회 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  }, [selectedOption?.type, timeSlotCache]);

  const handleCalendarSelect = useCallback(async (value: Value, event: React.MouseEvent<HTMLButtonElement>) => {
    if (value instanceof Date) {
      setSelectedDate(value);
      setSelectedLoadingTime(null);
      setSelectedUnloadingTime(null);
      await fetchTimeSlots(value);
    } else if (Array.isArray(value) && value[0] instanceof Date) {
      setSelectedDate(value[0]);
      setSelectedLoadingTime(null);
      setSelectedUnloadingTime(null);
      await fetchTimeSlots(value[0]);
    }
  }, [fetchTimeSlots]);

  const getAvailableUnloadingTimes = useCallback(() => {
    if (!selectedLoadingTime) return timeSlots.unloading_times;

    const loadingHour = parseInt(selectedLoadingTime.time.split(':')[0]);
    return timeSlots.unloading_times.filter(slot => {
      const unloadingHour = parseInt(slot.time.split(':')[0]);
      return unloadingHour > loadingHour;
    });
  }, [selectedLoadingTime, timeSlots.unloading_times]);

  const handleNext = useCallback(() => {
    if (!selectedLoadingTime || !selectedUnloadingTime || !selectedOption || !selectedDate) {
      return;
    }

    // delivery_option 타입 매핑
    const deliveryOptionMap = {
      'SAME_DAY': 'same-day',
      'NEXT_DAY': 'next-day',
      'REGULAR': 'regular'
    } as const;

    // orderStore에 배송 정보 저장
    updateOrderData({
      delivery_info: {
        date: selectedDate.toISOString().split('T')[0], // Date를 YYYY-MM-DD 형식의 string으로 변환
        loading_time: selectedLoadingTime.time,
        unloading_time: selectedUnloadingTime.time,
        delivery_option: deliveryOptionMap[selectedOption.type],
        delivery_fee: selectedOption.price || 0
      }
    });

    navigate('/address');
  }, [selectedDate, selectedLoadingTime, selectedUnloadingTime, selectedOption, navigate, updateOrderData]);

  const formattedLoadingTimes = useMemo(() => 
    timeSlots.loading_times.map(slot => ({
      value: slot.time,
      label: slot.time,
      available: true
    }))
  , [timeSlots.loading_times]);

  const formattedUnloadingTimes = useMemo(() => 
    getAvailableUnloadingTimes().map(slot => ({
      value: slot.time,
      label: slot.time,
      available: true
    }))
  , [getAvailableUnloadingTimes]);

  const handleTimeSelect = useCallback((type: 'loading' | 'unloading', time: string) => {
    if (type === 'loading') {
      const selected = timeSlots.loading_times.find(slot => slot.time === time);
      if (selected) {
        setSelectedLoadingTime(selected);
        setSelectedUnloadingTime(null);
      }
    } else {
      const selected = getAvailableUnloadingTimes().find(slot => slot.time === time);
      if (selected) {
        setSelectedUnloadingTime(selected);
      }
    }
  }, [timeSlots.loading_times, getAvailableUnloadingTimes]);

  return (
    <PageContainer>
      <div className="step-progress-bar">
        <ProgressBar currentStep={5} totalSteps={8} />
      </div>
      <h1 className="step-title">배송 날짜 선택</h1>
      
      {(loading || errorMessage) && (
        <div style={{ marginBottom: '1rem' }}>
          {loading ? (
            <LoadingContainer>
              <LoadingSpinner />
            </LoadingContainer>
          ) : (
            <ErrorMessageContainer>
              <ErrorMessage message={errorMessage} />
            </ErrorMessageContainer>
          )}
        </div>
      )}
      
      <DeliveryOptions>
        {deliveryOptions.map(option => {
          const isDisabled = option.type === 'SAME_DAY' && new Date().getHours() >= 14;
          return (
            <OptionButton
              key={option.id}
              selected={selectedOption?.id === option.id}
              onClick={() => handleOptionSelect(option)}
              disabled={isDisabled}
            >
              <div>{option.label}</div>
              <OptionPrice>
                {option.price === 0 ? '추가요금없음' : `${option.price.toLocaleString()}원`}
              </OptionPrice>
              <OptionDescription>{option.description}</OptionDescription>
            </OptionButton>
          );
        })}
      </DeliveryOptions>

      <PageLayout>
        <CalendarContainer selectedOption={selectedOption}>
          <Calendar
            onChange={handleCalendarSelect}
            value={null}
            locale="ko-KR"
            formatDay={(locale, date) => date.getDate().toString()}
            tileDisabled={({ date }) => isDateDisabled(date)}
            tileClassName={({ date }) => {
              if (!selectedOption) return '';
              
              const today = startOfDay(new Date());
              const targetDate = startOfDay(date);
              
              switch (selectedOption.type) {
                case 'SAME_DAY':
                  return isSameDay(targetDate, today) ? 'highlight-date' : '';
                  
                case 'NEXT_DAY':
                  return isSameDay(targetDate, addDays(today, 1)) ? 'highlight-date' : '';
                  
                case 'REGULAR':
                  const threeDaysLater = addDays(today, 3);
                  const ninetyDaysLater = addDays(today, 90);
                  return !isBefore(targetDate, threeDaysLater) && 
                         !isBefore(ninetyDaysLater, targetDate) ? 'highlight-date' : '';
                  
                default:
                  return '';
              }
            }}
            minDate={new Date()}
            maxDate={addDays(new Date(), 90)}
            formatShortWeekday={(locale, date) => {
              const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
              return weekdays[date.getDay()];
            }}
            calendarType="gregory"
            next2Label={null}
            prev2Label={null}
            showNeighboringMonth={false}
          />
        </CalendarContainer>

        <TimeSection>
          {selectedDate ? (
            <TimeSelector
              loadingTime={selectedLoadingTime?.time || null}
              unloadingTime={selectedUnloadingTime?.time || null}
              availableLoadingTimes={formattedLoadingTimes}
              availableUnloadingTimes={formattedUnloadingTimes}
              onTimeSelect={handleTimeSelect}
              isNextDisabled={!selectedLoadingTime || !selectedUnloadingTime}
            />
          ) : (
            <div className="select-date-message">
              <p className="guide-message">배송예약은 4주 이내만 선택 가능합니다</p>
              <p className="select-message">배송 옵션과 날짜를 선택해주세요</p>
            </div>
          )}
        </TimeSection>
      </PageLayout>

      <ButtonContainer>
        <Button onClick={() => navigate(-1)}>
          <MdArrowBack size={16} /> 이전으로
        </Button>
        <Button 
          primary
          disabled={!selectedDate || !selectedLoadingTime || !selectedUnloadingTime}
          onClick={handleNext}
        >
          다음으로 <MdArrowForward size={16} />
        </Button>
      </ButtonContainer>
    </PageContainer>
  );
};

export default DeliveryDatePage;