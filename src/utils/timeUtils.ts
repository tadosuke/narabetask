import type { BusinessHours, LunchBreak } from '../types';

// Generate time slots in 15-minute intervals
export function generateTimeSlots(businessHours: BusinessHours, lunchBreak: LunchBreak): string[] {
  const slots: string[] = [];
  const startHour = parseInt(businessHours.start.split(':')[0]);
  const startMinute = parseInt(businessHours.start.split(':')[1]);
  const endHour = parseInt(businessHours.end.split(':')[0]);
  const endMinute = parseInt(businessHours.end.split(':')[1]);

  const lunchStartHour = parseInt(lunchBreak.start.split(':')[0]);
  const lunchStartMinute = parseInt(lunchBreak.start.split(':')[1]);
  const lunchEndHour = parseInt(lunchBreak.end.split(':')[0]);
  const lunchEndMinute = parseInt(lunchBreak.end.split(':')[1]);

  let currentHour = startHour;
  let currentMinute = startMinute;

  while (
    currentHour < endHour || 
    (currentHour === endHour && currentMinute < endMinute)
  ) {
    // Check if current time is within lunch break
    const currentTotalMinutes = currentHour * 60 + currentMinute;
    const lunchStartTotalMinutes = lunchStartHour * 60 + lunchStartMinute;
    const lunchEndTotalMinutes = lunchEndHour * 60 + lunchEndMinute;

    if (currentTotalMinutes < lunchStartTotalMinutes || currentTotalMinutes >= lunchEndTotalMinutes) {
      const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
      slots.push(timeString);
    }

    // Advance by 15 minutes
    currentMinute += 15;
    if (currentMinute >= 60) {
      currentMinute = 0;
      currentHour += 1;
    }
  }

  return slots;
}

// Convert time string to total minutes for easier comparison
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

// Convert minutes back to time string
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

// Check if a task can be placed at a specific time slot
export function canPlaceTask(
  startTime: string,
  duration: number,
  occupiedSlots: Set<string>,
  availableSlots: string[]
): boolean {
  const startMinutes = timeToMinutes(startTime);
  
  for (let i = 0; i < duration; i += 15) {
    const slotTime = minutesToTime(startMinutes + i);
    if (!availableSlots.includes(slotTime) || occupiedSlots.has(slotTime)) {
      return false;
    }
  }
  
  return true;
}

// Get all time slots occupied by a task
export function getTaskSlots(startTime: string, duration: number): string[] {
  const slots: string[] = [];
  const startMinutes = timeToMinutes(startTime);
  
  for (let i = 0; i < duration; i += 15) {
    slots.push(minutesToTime(startMinutes + i));
  }
  
  return slots;
}