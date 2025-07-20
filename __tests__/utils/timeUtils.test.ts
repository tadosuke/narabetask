import { describe, it, expect } from 'vitest';
import { 
  generateTimeSlots, 
  timeToMinutes, 
  minutesToTime, 
  canPlaceTask, 
  getTaskSlots 
} from '../../src/utils/timeUtils';
import type { BusinessHours, LunchBreak } from '../../src/types';

describe('timeUtils', () => {
  const businessHours: BusinessHours = {
    start: '09:00',
    end: '18:00'
  };

  const lunchBreak: LunchBreak = {
    start: '12:00',
    end: '13:00'
  };

  describe('generateTimeSlots', () => {
    it('should generate time slots excluding lunch break', () => {
      const slots = generateTimeSlots(businessHours, lunchBreak);
      
      // Should contain morning slots
      expect(slots).toContain('09:00');
      expect(slots).toContain('11:45');
      
      // Should not contain lunch break slots
      expect(slots).not.toContain('12:00');
      expect(slots).not.toContain('12:30');
      
      // Should contain afternoon slots
      expect(slots).toContain('13:00');
      expect(slots).toContain('17:45');
      
      // Should not contain time after business hours
      expect(slots).not.toContain('18:00');
    });

    it('should generate slots in 15-minute intervals', () => {
      const slots = generateTimeSlots(businessHours, lunchBreak);
      
      // Check that consecutive slots are 15 minutes apart
      const firstMorningSlots = slots.filter(slot => slot < '12:00').slice(0, 4);
      expect(firstMorningSlots).toEqual(['09:00', '09:15', '09:30', '09:45']);
    });
  });

  describe('timeToMinutes and minutesToTime', () => {
    it('should convert time string to minutes correctly', () => {
      expect(timeToMinutes('09:00')).toBe(540);
      expect(timeToMinutes('12:30')).toBe(750);
      expect(timeToMinutes('18:00')).toBe(1080);
    });

    it('should convert minutes to time string correctly', () => {
      expect(minutesToTime(540)).toBe('09:00');
      expect(minutesToTime(750)).toBe('12:30');
      expect(minutesToTime(1080)).toBe('18:00');
    });

    it('should be reversible', () => {
      const testTimes = ['09:00', '12:30', '15:45'];
      testTimes.forEach(time => {
        expect(minutesToTime(timeToMinutes(time))).toBe(time);
      });
    });
  });

  describe('canPlaceTask', () => {
    const availableSlots = ['09:00', '09:15', '09:30', '09:45', '10:00'];
    
    it('should return true for valid placement', () => {
      const occupiedSlots = new Set<string>();
      expect(canPlaceTask('09:00', 30, occupiedSlots, availableSlots)).toBe(true);
    });

    it('should return false for occupied slots', () => {
      const occupiedSlots = new Set(['09:15']);
      expect(canPlaceTask('09:00', 30, occupiedSlots, availableSlots)).toBe(false);
    });

    it('should return false for unavailable time slots', () => {
      const occupiedSlots = new Set<string>();
      expect(canPlaceTask('08:45', 30, occupiedSlots, availableSlots)).toBe(false);
    });
  });

  describe('getTaskSlots', () => {
    it('should return correct slots for 30-minute task', () => {
      const slots = getTaskSlots('09:00', 30);
      expect(slots).toEqual(['09:00', '09:15']);
    });

    it('should return correct slots for 60-minute task', () => {
      const slots = getTaskSlots('10:00', 60);
      expect(slots).toEqual(['10:00', '10:15', '10:30', '10:45']);
    });
  });

  describe('task movement collision detection', () => {
    const availableSlots = ['09:00', '09:15', '09:30', '09:45', '10:00', '10:15', '10:30', '10:45', '11:00', '11:15'];
    
    it('should allow moving a task to a free slot', () => {
      // Simulate task at 09:00-09:30, want to move to 10:00-10:30
      const otherOccupiedSlots = new Set(['11:00', '11:15']); // Another task at 11:00
      
      // For movement, exclude the moving task's current slots
      const occupiedSlotsForCheck = new Set(otherOccupiedSlots);
      
      expect(canPlaceTask('10:00', 30, occupiedSlotsForCheck, availableSlots)).toBe(true);
    });
    
    it('should prevent moving a task to overlap with another task', () => {
      // Simulate task at 09:00-09:30, want to move to 10:45-11:15
      const otherOccupiedSlots = new Set(['11:00', '11:15']); // Another task at 11:00
      
      // For movement, exclude the moving task's current slots
      const occupiedSlotsForCheck = new Set(otherOccupiedSlots);
      
      // Moving to 10:45 would occupy 10:45 and 11:00, conflicting with the task at 11:00
      expect(canPlaceTask('10:45', 30, occupiedSlotsForCheck, availableSlots)).toBe(false);
    });
    
    it('should allow moving a task to its current position', () => {
      // Simulate task at 09:00-09:30, want to move back to 09:00 (same position)
      // For movement, exclude the moving task's current slots
      const occupiedSlotsForCheck = new Set<string>();
      
      expect(canPlaceTask('09:00', 30, occupiedSlotsForCheck, availableSlots)).toBe(true);
    });
  });
});