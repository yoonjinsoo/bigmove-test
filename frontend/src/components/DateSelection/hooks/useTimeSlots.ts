import { useMemo } from 'react';
import { addHours } from 'date-fns';
import { DeliveryTimeSlots, TimeSlot } from '../../../types/delivery';

export const useTimeSlots = (
  timeSlotData: DeliveryTimeSlots,
  selectedLoadingTime: string | null
) => {
  const availableLoadingTimes = useMemo(
    () =>
      timeSlotData?.loadingTimes?.map((slot: TimeSlot) => ({
        id: slot.time,
        value: slot.time,
        label: `${slot.time} ~ ${addHours(new Date(`2000/01/01 ${slot.time}`), 3).getHours()}:00`,
        available: slot.available,
      })) || [],
    [timeSlotData]
  );

  const availableUnloadingTimes = useMemo(() => {
    if (!timeSlotData?.unloadingTimes || !selectedLoadingTime) return [];

    const loadingHour = parseInt(selectedLoadingTime.split(':')[0]);

    return timeSlotData.unloadingTimes
      .filter((slot: TimeSlot) => {
        const slotHour = parseInt(slot.time.split(':')[0]);
        return slotHour > loadingHour && slot.current_bookings < slot.max_capacity;
      })
      .map((slot: TimeSlot) => ({
        value: slot.time,
        label: `${slot.time} ~ ${addHours(new Date(`2000/01/01 ${slot.time}`), 3).getHours()}:00 (예약: ${slot.current_bookings}/${slot.max_capacity}건)`,
        available: slot.available,
      }));
  }, [timeSlotData, selectedLoadingTime]);

  return { availableLoadingTimes, availableUnloadingTimes };
};
