import { describe, it, expect } from 'vitest';
import { 
  generateTimeSlots, 
  timeToMinutes, 
  minutesToTime, 
  canPlaceTask, 
  getTaskSlots,
  calculateEndTime
} from '../../src/utils/timeUtils';
import type { BusinessHours } from '../../src/types';

describe('timeUtils', () => {
  const businessHours: BusinessHours = {
    start: '09:00',
    end: '18:00'
  };

  describe('generateTimeSlots', () => {
    it('営業時間内のすべてのタイムスロットを生成できる', () => {
      const slots = generateTimeSlots(businessHours);
      
      // 営業開始のスロットが含まれている
      expect(slots).toContain('09:00');
      expect(slots).toContain('11:45');
      
      // 昼の時間も含まれている（昼休み機能廃止のため）
      expect(slots).toContain('12:00');
      expect(slots).toContain('12:30');
      
      // 午後のスロットが含まれている
      expect(slots).toContain('13:00');
      expect(slots).toContain('17:45');
      
      // 業務時間外の時間は含まれていない
      expect(slots).not.toContain('18:00');
    });

    it('15分間隔でスロットを生成できる', () => {
      const slots = generateTimeSlots(businessHours);
      
      // 連続するスロットが15分間隔であることを確認
      const firstSlots = slots.slice(0, 4);
      expect(firstSlots).toEqual(['09:00', '09:15', '09:30', '09:45']);
    });
  });

  describe('timeToMinutes と minutesToTime', () => {
    it('時刻文字列を分に正しく変換できる', () => {
      expect(timeToMinutes('09:00')).toBe(540);
      expect(timeToMinutes('12:30')).toBe(750);
      expect(timeToMinutes('18:00')).toBe(1080);
    });

    it('分を時刻文字列に正しく変換できる', () => {
      expect(minutesToTime(540)).toBe('09:00');
      expect(minutesToTime(750)).toBe('12:30');
      expect(minutesToTime(1080)).toBe('18:00');
    });

    it('変換が可逆的である', () => {
      const testTimes = ['09:00', '12:30', '15:45'];
      testTimes.forEach(time => {
        expect(minutesToTime(timeToMinutes(time))).toBe(time);
      });
    });
  });

  describe('canPlaceTask', () => {
    const availableSlots = ['09:00', '09:15', '09:30', '09:45', '10:00'];
    
    it('有効な配置に対してtrueを返す', () => {
      const occupiedSlots = new Set<string>();
      expect(canPlaceTask('09:00', 30, occupiedSlots, availableSlots)).toBe(true);
    });

    it('占有済みスロットに対してfalseを返す', () => {
      const occupiedSlots = new Set(['09:15']);
      expect(canPlaceTask('09:00', 30, occupiedSlots, availableSlots)).toBe(false);
    });

    it('利用できないタイムスロットに対してfalseを返す', () => {
      const occupiedSlots = new Set<string>();
      expect(canPlaceTask('08:45', 30, occupiedSlots, availableSlots)).toBe(false);
    });
  });

  describe('getTaskSlots', () => {
    it('30分タスクの正しいスロットを返す', () => {
      const slots = getTaskSlots('09:00', 30);
      expect(slots).toEqual(['09:00', '09:15']);
    });

    it('60分タスクの正しいスロットを返す', () => {
      const slots = getTaskSlots('10:00', 60);
      expect(slots).toEqual(['10:00', '10:15', '10:30', '10:45']);
    });
  });

  describe('calculateEndTime', () => {
    it('30分タスクの終了時間を正しく計算する', () => {
      expect(calculateEndTime('09:00', 30)).toBe('09:30');
      expect(calculateEndTime('14:15', 30)).toBe('14:45');
    });

    it('60分タスクの終了時間を正しく計算する', () => {
      expect(calculateEndTime('09:00', 60)).toBe('10:00');
      expect(calculateEndTime('13:30', 60)).toBe('14:30');
    });

    it('時を跨ぐ時間の計算を正しく行う', () => {
      expect(calculateEndTime('09:45', 30)).toBe('10:15');
      expect(calculateEndTime('11:30', 90)).toBe('13:00');
    });

    it('境界値での計算を正しく行う', () => {
      expect(calculateEndTime('17:45', 30)).toBe('18:15');
      expect(calculateEndTime('00:00', 15)).toBe('00:15');
    });
  });

  describe('タスク移動時の衝突検出', () => {
    const availableSlots = ['09:00', '09:15', '09:30', '09:45', '10:00', '10:15', '10:30', '10:45', '11:00', '11:15'];
    
    it('空いているスロットへのタスク移動を許可する', () => {
      // 09:00-09:30にタスクがあり、10:00-10:30に移動したい場合をシミュレート
      const otherOccupiedSlots = new Set(['11:00', '11:15']); // 11:00に別のタスクがある
      
      // 移動の場合、移動中のタスクの現在のスロットを除外する
      const occupiedSlotsForCheck = new Set(otherOccupiedSlots);
      
      expect(canPlaceTask('10:00', 30, occupiedSlotsForCheck, availableSlots)).toBe(true);
    });
    
    it('他のタスクと重複するタスク移動を防ぐ', () => {
      // 09:00-09:30にタスクがあり、10:45-11:15に移動したい場合をシミュレート
      const otherOccupiedSlots = new Set(['11:00', '11:15']); // 11:00に別のタスクがある
      
      // 移動の場合、移動中のタスクの現在のスロットを除外する
      const occupiedSlotsForCheck = new Set(otherOccupiedSlots);
      
      // 10:45への移動は10:45と11:00を占有し、11:00のタスクと競合する
      expect(canPlaceTask('10:45', 30, occupiedSlotsForCheck, availableSlots)).toBe(false);
    });
    
    it('タスクの現在位置への移動を許可する', () => {
      // 09:00-09:30にタスクがあり、09:00に戻す（同じ位置）場合をシミュレート
      // 移動の場合、移動中のタスクの現在のスロットを除外する
      const occupiedSlotsForCheck = new Set<string>();
      
      expect(canPlaceTask('09:00', 30, occupiedSlotsForCheck, availableSlots)).toBe(true);
    });
  });
});