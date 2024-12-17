import { SelectedDelivery } from '../../types/delivery';

export interface DatePickerProps {
  onDateTimeSelect: (delivery: SelectedDelivery) => void;
}

export interface TimeSlotOption {
  value: string;
  label: string;
  available: boolean;
}
