import React, { useState, useEffect, useCallback } from 'react';
import {
  AvailableDate,
  DeliveryOption,
  SelectedDelivery,
  DeliveryTimeSlots,
} from '../../types/delivery';
import { format, isValid } from 'date-fns';
import styled from 'styled-components';
import { fetchTimeSlots } from '../../services/deliveryService';
import DeliveryCalendar from './Calendar/DeliveryCalendar';

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

const CalendarContainer = styled.div`
  .react-calendar {
    width: 100%;
    background: var(--dark-gray);
    border: 1px solid var(--gray-300);
    border-radius: 8px;
    padding: 1rem;
  }
`;

const DeliveryOptionContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin: 2rem 0;
`;

const OptionCard = styled.div<{ isSelected?: boolean }>`
  background: var(--dark-gray);
  border: 2px solid ${(props) => (props.isSelected ? 'var(--cyan)' : 'transparent')};
  border-radius: 8px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: var(--cyan);
  }
`;

const PriceSummary = styled.div`
  background: var(--dark-gray);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
`;

const MessageBox = styled.div`
  background: var(--dark-gray);
  border: 1px solid var(--cyan);
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  color: var(--cyan);
`;

export interface DatePickerProps {
  onDateTimeSelect: (delivery: SelectedDelivery) => void;
  selectedDateTime: SelectedDelivery | null;
  deliveryOption: DeliveryOption;
  basePrice: number;
  availableDates: AvailableDate[];
  message?: string;
  onClose: () => void;
  timeSlotData: DeliveryTimeSlots;
  onTimeSlotDataUpdate: (data: DeliveryTimeSlots) => void;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  onDateTimeSelect,
  selectedDateTime,
  deliveryOption,
  basePrice,
  availableDates,
  message,
  onClose,
  timeSlotData,
  onTimeSlotDataUpdate,
}) => {
  const [totalPrice, setTotalPrice] = useState(basePrice);

  // TimeSlot 업데이트 함수 메모이제이션 추가
  const memoizedTimeSlotUpdate = useCallback((data: DeliveryTimeSlots) => {
    onTimeSlotDataUpdate(data);
  }, [onTimeSlotDataUpdate]);

  // 기존 useEffect 수정
  useEffect(() => {
    const loadTimeSlots = async () => {
      if (!selectedDateTime?.date) {
        memoizedTimeSlotUpdate({ loadingTimes: [], unloadingTimes: [] });
        return;
      }
      
      try {
        const dateObj = selectedDateTime.date instanceof Date
          ? selectedDateTime.date
          : new Date(selectedDateTime.date);
        
        if (!isValid(dateObj)) {
          memoizedTimeSlotUpdate({ loadingTimes: [], unloadingTimes: [] });
          return;
        }
        
        const slots = await fetchTimeSlots(dateObj);
        memoizedTimeSlotUpdate(slots);
      } catch (error) {
        console.error('Failed to load time slots:', error);
        memoizedTimeSlotUpdate({ loadingTimes: [], unloadingTimes: [] });
      }
    };

    loadTimeSlots();
  }, [selectedDateTime?.date, memoizedTimeSlotUpdate]);

  // 가격 계산 useEffect 수정
  useEffect(() => {
    const newTotalPrice = basePrice + deliveryOption.price;
    setTotalPrice(newTotalPrice);
  }, [basePrice, deliveryOption.price]);

  const handleDateSelect = (value: Value) => {
    if (value instanceof Date) {
      const dateStr = format(value, 'yyyy-MM-dd');
      const selectedDate = availableDates.find((d) => d.date === dateStr);

      if (selectedDate && selectedDate.timeSlots.length > 0) {
        const firstSlot = selectedDate.timeSlots[0];
        const loadingTime = firstSlot.time;

        onDateTimeSelect({
          date: new Date(dateStr),
          timeSlot: {
            loadingTime,
            unloadingTime: ''
          }
        });
      }

      const newTotalPrice = basePrice + deliveryOption.price;
      setTotalPrice(newTotalPrice);
    }
  };

  const getSelectedDate = (): Date | null => {
    if (!selectedDateTime?.date) return null;
    const dateObj =
      selectedDateTime.date instanceof Date
        ? selectedDateTime.date
        : new Date(selectedDateTime.date);
    return isValid(dateObj) ? dateObj : null;
  };

  const handleOptionSelect = (optionType: 'SAME_DAY' | 'NEXT_DAY' | 'REGULAR') => {
    let selectedOption: DeliveryOption;
    switch (optionType) {
      case 'SAME_DAY':
        selectedOption = {
          id: 'same-day',
          type: 'SAME_DAY',
          name: '당일 배송',
          label: '당일 배송',
          price: 50000,
          description: '오늘 주문 시 당일 배송',
        };
        break;
      case 'NEXT_DAY':
        selectedOption = {
          id: 'next-day',
          type: 'NEXT_DAY',
          name: '익일 배송',
          label: '익일 배송',
          price: 30000,
          description: '내일 배송 (2일 이후)',
        };
        break;
      case 'REGULAR':
        selectedOption = {
          id: 'regular',
          type: 'REGULAR',
          name: '일반 배송',
          label: '일반 배송',
          price: 0,
          description: '일반 배송 (기본)',
        };
        break;
      default:
        return;
    }

    const newTotalPrice = basePrice + selectedOption.price;
    setTotalPrice(newTotalPrice);

    if (selectedDateTime?.date) {
      onDateTimeSelect({
        date: selectedDateTime.date,
        timeSlot: selectedDateTime.timeSlot,
        option: selectedOption,
      });
    }
  };

  // 날짜 비활성화 체크
  const isDateDisabled = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return !availableDates.some((d) => d.date === dateStr);
  };

  useEffect(() => {
    return () => {
      onClose();
    };
  }, [onClose]);

  return (
    <div className="date-picker-container">
      {message && (
        <MessageBox>
          {message}
        </MessageBox>
      )}
      <DeliveryOptionContainer>
        <OptionCard
          isSelected={deliveryOption.type === 'SAME_DAY'}
          onClick={() => handleOptionSelect('SAME_DAY')}
        >
          <h3>당일 배송</h3>
          <p>추가 요금: 50,000원</p>
        </OptionCard>
        <OptionCard
          isSelected={deliveryOption.type === 'NEXT_DAY'}
          onClick={() => handleOptionSelect('NEXT_DAY')}
        >
          <h3>익일 배송 (2일 이후)</h3>
          <p>추가 요금: 30,000원</p>
        </OptionCard>
        <OptionCard
          isSelected={deliveryOption.type === 'REGULAR'}
          onClick={() => handleOptionSelect('REGULAR')}
        >
          <h3>일반 배송</h3>
          <p>추가 요금: 0원</p>
        </OptionCard>
      </DeliveryOptionContainer>

      <PriceSummary>
        <h3>가격 정보</h3>
        <div>기본 가격: {basePrice.toLocaleString()}원</div>
        <div>배송 옵션 추가: {deliveryOption.price.toLocaleString()}원</div>
        <div className="total-price">총 가격: {totalPrice.toLocaleString()}원</div>
      </PriceSummary>

      <CalendarContainer>
        <DeliveryCalendar
          timeSlotData={timeSlotData}
          onDateTimeSelect={handleDateSelect}
          selectedDate={getSelectedDate()}
          isDateDisabled={isDateDisabled}
          availableDates={availableDates}
        />
      </CalendarContainer>

      {selectedDateTime?.date && (
        <div className="selected-info">
          <h4>선택된 날짜</h4>
          <p>{format(getSelectedDate() || new Date(), 'yyyy년 MM월 dd일')}</p>
        </div>
      )}

      {timeSlotData.loadingTimes.length > 0 && (
        <div className="time-slots">
          <h4>가능한 시간대</h4>
          <ul>
            {timeSlotData.loadingTimes.map((slot, index) => (
              <li key={index}>{`${slot.time.split(':')[0]}:00`}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
