import { describe, it, expect, beforeEach, vi } from 'vitest';
import { saveToStorage, loadFromStorage, clearStorage } from '../../src/utils/storage';
import type { Task } from '../../src/types';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

// Replace global localStorage with mock
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

const createTestTask = (id: string, name: string): Task => ({
  id,
  name,
  workTime: 15,
  waitTime: 15,
  duration: 30,
  isPlaced: false
});

describe('storage utilities', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('saveToStorage', () => {
    it('should save tasks and selected task to localStorage', () => {
      const tasks = [
        createTestTask('1', 'Task 1'),
        createTestTask('2', 'Task 2'),
      ];
      const selectedTask = tasks[0];

      saveToStorage(tasks, selectedTask);

      const saved = localStorageMock.getItem('narabetask_state');
      expect(saved).toBeTruthy();
      
      const parsed = JSON.parse(saved!);
      expect(parsed.tasks).toEqual(tasks);
      expect(parsed.selectedTaskId).toBe('1');
    });

    it('should save null selectedTaskId when no task is selected', () => {
      const tasks = [createTestTask('1', 'Task 1')];

      saveToStorage(tasks, null);

      const saved = localStorageMock.getItem('narabetask_state');
      const parsed = JSON.parse(saved!);
      expect(parsed.selectedTaskId).toBeNull();
    });

    it('should handle localStorage errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      // Mock setItem to throw an error
      vi.spyOn(localStorageMock, 'setItem').mockImplementationOnce(() => {
        throw new Error('Storage quota exceeded');
      });

      const tasks = [createTestTask('1', 'Task 1')];
      
      // Should not throw
      expect(() => saveToStorage(tasks, null)).not.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith('Failed to save state to localStorage:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });

  describe('loadFromStorage', () => {
    it('should return null when no data exists', () => {
      const result = loadFromStorage();
      expect(result).toBeNull();
    });

    it('should load saved state correctly', () => {
      const tasks = [
        createTestTask('1', 'Task 1'),
        createTestTask('2', 'Task 2'),
      ];
      const selectedTaskId = '1';

      // Save some data first
      localStorageMock.setItem('narabetask_state', JSON.stringify({
        tasks,
        selectedTaskId
      }));

      const result = loadFromStorage();
      expect(result).not.toBeNull();
      expect(result!.tasks).toEqual(tasks);
      expect(result!.selectedTaskId).toBe(selectedTaskId);
    });

    it('should handle JSON parsing errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      // Save invalid JSON
      localStorageMock.setItem('narabetask_state', 'invalid json');

      const result = loadFromStorage();
      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith('Failed to load state from localStorage:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });

    it('should handle invalid state structure gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      // Save data with invalid structure
      localStorageMock.setItem('narabetask_state', JSON.stringify({
        tasks: 'not an array',
        selectedTaskId: '1'
      }));

      const result = loadFromStorage();
      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith('Invalid state structure in localStorage');
      
      consoleSpy.mockRestore();
    });
  });

  describe('clearStorage', () => {
    it('should remove data from localStorage', () => {
      localStorageMock.setItem('narabetask_state', 'some data');
      expect(localStorageMock.getItem('narabetask_state')).toBe('some data');

      clearStorage();
      expect(localStorageMock.getItem('narabetask_state')).toBeNull();
    });

    it('should handle localStorage errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      // Mock removeItem to throw an error
      vi.spyOn(localStorageMock, 'removeItem').mockImplementationOnce(() => {
        throw new Error('Storage error');
      });

      // Should not throw
      expect(() => clearStorage()).not.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith('Failed to clear localStorage:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });
});