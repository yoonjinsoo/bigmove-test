import React from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import styled from 'styled-components';
import { DeliveryTimeSlots, AvailableDate } from '../../../types/delivery';

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

interface DeliveryCalendarProps {
  timeSlotData: DeliveryTimeSlots;
  onDateTimeSelect: (value: Value) => void;
  selectedDate: Date | null;
  isDateDisabled?: (date: Date) => boolean;
  availableDates: AvailableDate[];
}

const DeliveryCalendar = React.forwardRef<HTMLDivElement, DeliveryCalendarProps>(({
  timeSlotData,
  onDateTimeSelect,
  selectedDate,
  isDateDisabled,
  availableDates
}, ref) => {
  const handleDateChange = (value: Value, event: React.MouseEvent<HTMLButtonElement>) => {
    onDateTimeSelect(value);
  };

  return (
    <CalendarContainer ref={ref}>
      <Calendar
        onChange={handleDateChange}
        value={selectedDate}
        tileDisabled={({ date }) => isDateDisabled ? isDateDisabled(date) : false}
      />
    </CalendarContainer>
  );
});

const CalendarContainer = styled.div`
  .react-calendar {
    width: 100%;
    max-width: 400px;
    background: var(--dark-gray);
    border: 1px solid var(--cyan);
    border-radius: 8px;
    padding: 1.5rem;
    color: #f5f5f5;
  }

  .react-calendar__navigation {
    button {
      min-width: 44px;
      background: none;
      color: var(--cyan);
      font-size: 1.2rem;
      
      &:disabled {
        color: #666;
      }
      
      &:enabled:hover,
      &:enabled:focus {
        background-color: rgba(78, 205, 196, 0.1);
      }
    }
  }

  .react-calendar__month-view__weekdays {
    abbr {
      text-decoration: none;
      color: var(--cyan);
      font-weight: bold;
    }
  }

  .react-calendar__tile {
    color: #f5f5f5;
    padding: 0.75em 0.5em;
    background: none;
    
    &:enabled:hover,
    &:enabled:focus {
      background-color: rgba(78, 205, 196, 0.1);
    }
  }

  .react-calendar__month-view__days__day--weekend:nth-child(7n) {
    color: var(--cyan);  // 토요일
  }

  .react-calendar__month-view__days__day--weekend:nth-child(7n + 1) {
    color: #ff6b6b;  // 일요일
  }

  .selected-date {
    background-color: var(--cyan) !important;
    color: var(--dark-gray) !important;
  }

  .date-available {
    color: #f5f5f5;
  }

  .date-unavailable {
    color: #666;
    text-decoration: line-through;
  }

  .react-calendar__tile:disabled {
    background-color: rgba(102, 102, 102, 0.2);
    color: #666;
  }

  // 일요일 스타일 (첫번째 열)
  .react-calendar__month-view__weekdays__weekday:first-child,
  .react-calendar__month-view__days__day--weekend:nth-child(7n + 1) {
    color: #ff4d4d;  // 빨간색
    
    abbr {  // "일" 글자에도 적용
      color: #ff4d4d;
      text-decoration: none;
    }
  }

  // 토요일 스타일 (마지막 열)
  .react-calendar__month-view__weekdays__weekday:last-child,
  .react-calendar__month-view__days__day--weekend:nth-child(7n) {
    color: #4d4dff;  // 파란색
    
    abbr {  // "토" 글자에도 적용
      color: #4d4dff;
      text-decoration: none;
    }
  }

  // 요일 텍스트 스타일
  .react-calendar__month-view__weekdays__weekday {
    abbr {
      text-decoration: none;  // 밑줄 제거
    }
  }

  // 선택 가능한 날짜에만 토/일요일 색상 적용
  .react-calendar__tile:not(:disabled) {
    // 일요일 스타일 (첫번째 열)
    &.react-calendar__month-view__days__day--weekend:nth-child(7n + 1) {
      color: #ff4d4d;
    }
    
    // 토요일 스타일 (마지막 열)
    &.react-calendar__month-view__days__day--weekend:nth-child(7n) {
      color: #4d4dff;
    }
  }

  // 요일 헤더는 그대로 색상 유지
  .react-calendar__month-view__weekdays__weekday:first-child abbr {
    color: #ff4d4d;
    text-decoration: none;
  }

  .react-calendar__month-view__weekdays__weekday:last-child abbr {
    color: #4d4dff;
    text-decoration: none;
  }

  // 선택 불가능한 날짜는 기존 스타일 유지
  .react-calendar__tile:disabled {
    color: #666;
    background-color: rgba(102, 102, 102, 0.2);
  }

  // 요일 헤더 스타일
  .react-calendar__month-view__weekdays__weekday {
    &:first-child abbr {
      color: #ff4d4d;  // 일요일
      text-decoration: none;
    }
    &:last-child abbr {
      color: #4d4dff;  // 토요일
      text-decoration: none;
    }
  }

  // 모든 날짜 타일의 기본 스타일
  .react-calendar__tile {
    color: var(--text-color);  // 기본 텍스트 색상
  }

  // 선택 불가능한 날짜 스타일 (토/일요일 색상 무시)
  .react-calendar__tile:disabled {
    color: #666 !important;  // !important로 다른 색상 설정 덮어쓰기
    background-color: rgba(102, 102, 102, 0.2);
  }

  // 선택 가능한 날짜에만 토/일요일 색상 적용
  .react-calendar__tile:enabled {
    &.react-calendar__month-view__days__day--weekend:nth-child(7n + 1) {
      color: #ff4d4d;  // 일요일
    }
    &.react-calendar__month-view__days__day--weekend:nth-child(7n) {
      color: #4d4dff;  // 토요일
    }
  }

  // 요일 헤더만 색상 적용
  .react-calendar__month-view__weekdays__weekday {
    &:first-child abbr {
      color: #ff4d4d;
      text-decoration: none;
    }
    &:last-child abbr {
      color: #4d4dff;
      text-decoration: none;
    }
  }

  // 날짜 타일 기본 스타일
  .react-calendar__month-view__days__day {
    color: var(--text-color);
  }

  // 활성화된 날짜의 토/일요일만 색상 적용
  button.react-calendar__tile:not([disabled]) {
    &.react-calendar__month-view__days__day--weekend {
      &:nth-child(7n + 1) {
        color: #ff4d4d;  // 일요일
      }
      &:nth-child(7n) {
        color: #4d4dff;  // 토요일
      }
    }
  }

  // 비활성화된 날짜는 모두 동일한 스타일
  button.react-calendar__tile[disabled] {
    color: #666;
    background-color: rgba(102, 102, 102, 0.2);
  }
`;

DeliveryCalendar.displayName = 'DeliveryCalendar';

export default DeliveryCalendar;
