import { addMonths } from 'date-fns';

export const addHours = (timeStr: string, hours: number): string => {
  if (!timeStr.match(/^\d{1,2}:\d{2}$/)) {
    throw new Error('Invalid time format. Expected format: HH:mm');
  }

  const [hour] = timeStr.split(':');
  const newHour = (parseInt(hour, 10) + hours) % 24;
  return newHour.toString().padStart(2, '0');
};

export const formatTimeRange = (startTime: string): string => {
  const endTime = `${addHours(startTime, 3)}:00`;
  return `${startTime} ~ ${endTime}`;
};

export const isValidTimeFormat = (timeStr: string): boolean => {
  return /^\d{1,2}:\d{2}$/.test(timeStr);
};

export const isHoliday = (date: Date): boolean => {
  // 공휴일 체크 로직 구현
  return false;
};

export const isFutureDate = (date: Date | null, months: number): boolean => {
  if (!date) return false;
  const futureDate = addMonths(new Date(), months);
  return date > futureDate;
};

export const getTimeSlotLabel = (
  time: string,
  currentBookings: number,
  maxCapacity: number
): string => {
  return `${formatTimeRange(time)} (예약: ${currentBookings}/${maxCapacity}건)`;
};
