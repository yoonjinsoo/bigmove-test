import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider } from 'styled-components';
import { ItemSelectionProvider } from '../../../contexts/ItemSelectionContext';
import { DatePicker } from '../DatePicker';
import { theme } from '../../../styles/theme';
import { TimeSlot, AvailableDate, DeliveryOption, SelectedDelivery, DeliveryTimeSlots } from '../../../types/delivery';

const mockTimeSlot: TimeSlot = {
  time: '09:00-12:00',
  available: true,
  current_bookings: 0,
  max_capacity: 10,
  hour: 9
};

const mockDate: AvailableDate = {
  date: '2023-05-20',
  timeSlots: [mockTimeSlot],
  surcharges: []
};

const mockDates: AvailableDate[] = [mockDate];

const mockDeliveryOption: DeliveryOption = {
  id: '1',
  type: 'REGULAR',
  name: '일반 배송',
  price: 10000,
  description: '일반 배송 서비스'
};

const mockSelectedDelivery: SelectedDelivery = {
  date: new Date('2023-05-20'),
  timeSlot: {
    loadingTime: '09:00',
    unloadingTime: '12:00'
  },
  option: mockDeliveryOption
};

const mockTimeSlotData: DeliveryTimeSlots = {
  loadingTimes: [],
  unloadingTimes: []
};

const mockOnDateTimeSelect = jest.fn();
const mockOnClose = jest.fn();
const mockOnTimeSlotDataUpdate = jest.fn();

const renderDatePicker = () => {
  return render(
    React.createElement(
      ThemeProvider,
      { theme },
      React.createElement(
        ItemSelectionProvider,
        null,
        React.createElement(DatePicker, {
          onDateTimeSelect: mockOnDateTimeSelect,
          selectedDateTime: mockSelectedDelivery,
          deliveryOption: mockDeliveryOption,
          basePrice: 10000,
          availableDates: mockDates,
          onClose: mockOnClose,
          timeSlotData: mockTimeSlotData,
          onTimeSlotDataUpdate: mockOnTimeSlotDataUpdate
        })
      )
    )
  );
};

beforeAll(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.clearAllMocks();
});

afterAll(() => {
  jest.useRealTimers();
});

describe('DatePicker', () => {
  beforeEach(() => {
    jest.setSystemTime(new Date('2023-05-20'));
  });

  it('renders available dates', () => {
    renderDatePicker();
    
    const dateButton = screen.getByRole('button', {
      name: /May 20, 2023/i
    });

    jest.advanceTimersByTime(1000);

    expect(dateButton).toBeInTheDocument();
  });

  it('handles date selection', () => {
    renderDatePicker();
    
    const dateButton = screen.getByRole('button', {
      name: /May 20, 2023/i
    });

    jest.advanceTimersByTime(1000);
    fireEvent.click(dateButton);

    expect(mockOnDateTimeSelect).toHaveBeenCalledTimes(1);
  });
});
