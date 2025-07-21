import { describe, it, expect } from 'vitest';
import { findOverlappingTasks, doTasksShareResources } from '../../src/utils/timeUtils';

describe('overlap detection', () => {
  describe('doTasksShareResources', () => {
    it('should return true when tasks share at least one resource', () => {
      const resources1 = ['self', 'machine'];
      const resources2 = ['machine', 'network'];
      expect(doTasksShareResources(resources1, resources2)).toBe(true);
    });

    it('should return false when tasks share no resources', () => {
      const resources1 = ['self'];
      const resources2 = ['machine', 'network'];
      expect(doTasksShareResources(resources1, resources2)).toBe(false);
    });

    it('should return true when all resources are the same', () => {
      const resources1 = ['self', 'machine'];
      const resources2 = ['self', 'machine'];
      expect(doTasksShareResources(resources1, resources2)).toBe(true);
    });
  });

  describe('findOverlappingTasks', () => {
    it('should detect overlap when tasks share time and resources', () => {
      const tasks = [
        {
          id: 'task1',
          startTime: '09:00',
          duration: 60,
          resourceTypes: ['self'],
          isPlaced: true
        },
        {
          id: 'task2',
          startTime: '09:30',
          duration: 60,
          resourceTypes: ['self'],
          isPlaced: true
        }
      ];

      const overlapping = findOverlappingTasks(tasks);
      expect(overlapping.has('task1')).toBe(true);
      expect(overlapping.has('task2')).toBe(true);
    });

    it('should not detect overlap when tasks share time but not resources', () => {
      const tasks = [
        {
          id: 'task1',
          startTime: '09:00',
          duration: 60,
          resourceTypes: ['self'],
          isPlaced: true
        },
        {
          id: 'task2',
          startTime: '09:30',
          duration: 60,
          resourceTypes: ['machine'],
          isPlaced: true
        }
      ];

      const overlapping = findOverlappingTasks(tasks);
      expect(overlapping.has('task1')).toBe(false);
      expect(overlapping.has('task2')).toBe(false);
    });

    it('should not detect overlap when tasks share resources but not time', () => {
      const tasks = [
        {
          id: 'task1',
          startTime: '09:00',
          duration: 30,
          resourceTypes: ['self'],
          isPlaced: true
        },
        {
          id: 'task2',
          startTime: '09:30',
          duration: 30,
          resourceTypes: ['self'],
          isPlaced: true
        }
      ];

      const overlapping = findOverlappingTasks(tasks);
      expect(overlapping.has('task1')).toBe(false);
      expect(overlapping.has('task2')).toBe(false);
    });

    it('should ignore unplaced tasks', () => {
      const tasks = [
        {
          id: 'task1',
          startTime: '09:00',
          duration: 60,
          resourceTypes: ['self'],
          isPlaced: true
        },
        {
          id: 'task2',
          startTime: '09:30',
          duration: 60,
          resourceTypes: ['self'],
          isPlaced: false
        }
      ];

      const overlapping = findOverlappingTasks(tasks);
      expect(overlapping.has('task1')).toBe(false);
      expect(overlapping.has('task2')).toBe(false);
    });

    it('should ignore tasks without start time', () => {
      const tasks = [
        {
          id: 'task1',
          startTime: '09:00',
          duration: 60,
          resourceTypes: ['self'],
          isPlaced: true
        },
        {
          id: 'task2',
          startTime: undefined,
          duration: 60,
          resourceTypes: ['self'],
          isPlaced: true
        }
      ];

      const overlapping = findOverlappingTasks(tasks);
      expect(overlapping.has('task1')).toBe(false);
      expect(overlapping.has('task2')).toBe(false);
    });
  });
});