import { describe, it, expect } from 'vitest';
import { findOverlappingTasks } from '../../src/utils/timeUtils';

describe('重複検出', () => {
  describe('findOverlappingTasks', () => {
    it('タスクが時間とリソースを共有する場合に重複を検出する', () => {
      const tasks = [
        {
          id: 'task1',
          startTime: '09:00',
          duration: 60,
          isPlaced: true
        },
        {
          id: 'task2',
          startTime: '09:30',
          duration: 60,
          isPlaced: true
        }
      ];

      const overlapping = findOverlappingTasks(tasks);
      expect(overlapping.has('task1')).toBe(true);
      expect(overlapping.has('task2')).toBe(true);
    });

    it('タスクが時間を重複する場合は重複を検出する', () => {
      const tasks = [
        {
          id: 'task1',
          startTime: '09:00',
          duration: 60,
          isPlaced: true
        },
        {
          id: 'task2',
          startTime: '09:30',
          duration: 60,
          isPlaced: true
        }
      ];

      const overlapping = findOverlappingTasks(tasks);
      expect(overlapping.has('task1')).toBe(true);
      expect(overlapping.has('task2')).toBe(true);
    });

    it('タスクが時間を共有しない場合は重複を検出しない', () => {
      const tasks = [
        {
          id: 'task1',
          startTime: '09:00',
          duration: 30,
          isPlaced: true
        },
        {
          id: 'task2',
          startTime: '09:30',
          duration: 30,
          isPlaced: true
        }
      ];

      const overlapping = findOverlappingTasks(tasks);
      expect(overlapping.has('task1')).toBe(false);
      expect(overlapping.has('task2')).toBe(false);
    });

    it('未配置のタスクを無視する', () => {
      const tasks = [
        {
          id: 'task1',
          startTime: '09:00',
          duration: 60,
          isPlaced: true
        },
        {
          id: 'task2',
          startTime: '09:30',
          duration: 60,
          isPlaced: false
        }
      ];

      const overlapping = findOverlappingTasks(tasks);
      expect(overlapping.has('task1')).toBe(false);
      expect(overlapping.has('task2')).toBe(false);
    });

    it('開始時刻のないタスクを無視する', () => {
      const tasks = [
        {
          id: 'task1',
          startTime: '09:00',
          duration: 60,
          isPlaced: true
        },
        {
          id: 'task2',
          startTime: undefined,
          duration: 60,
          isPlaced: true
        }
      ];

      const overlapping = findOverlappingTasks(tasks);
      expect(overlapping.has('task1')).toBe(false);
      expect(overlapping.has('task2')).toBe(false);
    });
  });
});