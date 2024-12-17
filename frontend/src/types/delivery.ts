export interface TimeSlot {
  time: string;
  available: boolean;
  current_bookings: number;
  max_capacity: number;
  hour?: number;
}

export interface TimeSlotOption {
  value: string;
  label: string;
  available: boolean;
}

export interface DeliveryTimeSlots {
  loadingTimes: TimeSlot[];
  unloadingTimes: TimeSlot[];
}

export interface SelectedTimeSlot {
  loadingTime: string | null;
  unloadingTime: string | null;
}

export interface DeliveryOption {
  id: string;
  type: 'SAME_DAY' | 'NEXT_DAY' | 'REGULAR';
  name: string;
  label: string;
  price: number;
  description: string;
}

export interface SelectedDelivery {
  date: Date;
  timeSlot: {
    loadingTime: string;
    unloadingTime: string;
  };
  option?: DeliveryOption;
}

export interface AvailableDate {
  date: string;
  timeSlots: TimeSlot[];
  isHoliday?: boolean;
  holidayName?: string;
  surcharges?: Array<{
    label: string;
    additionalFee: number;
  }>;
}

export interface Surcharge {
  type: string;
  label: string;
  additionalFee: number;
}

export interface CalendarMonth {
  year: number;
  month: number;
  dates: AvailableDate[];
}

export interface DeliveryApiResponse {
  success: boolean;
  data: any;
  message?: string;
}

export interface TimeSlotResponse {
  success: boolean;
  data: DeliveryTimeSlots;
  message?: string;
}

export interface DeliveryCalendarProps {
  timeSlotData: DeliveryTimeSlots;
  onDateSelect: (date: Date | null) => void;
  selectedDate: Date | null;
  isDateDisabled?: (date: Date) => boolean;
}

export interface ApiDeliveryOption {
  type: string;
  label: string;
  additionalFee: number;
  description: string;
}

export interface DeliveryOptionsResponse {
  options: ApiDeliveryOption[];
}

export interface DeliveryOptionItem extends DeliveryOption {
  selected: boolean;
}

export interface DeliveryDatesResponse {
  success: boolean;
  dates: AvailableDate[];
  availableTimes: TimeSlot[];
  message?: string;
}

export interface AvailableDatesResponse {
  success: boolean;
  dates: AvailableDate[];
  message?: string;
}

export interface DistanceCalculationResponse {
  total_distance: number;
  base_distance: number;
  extra_distance: number;
  base_fee: number;
  extra_fee: number;
  total_fee: number;
}
