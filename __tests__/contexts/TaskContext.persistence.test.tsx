import { act, renderHook } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TaskProvider } from '../../src/contexts/TaskContext';
import { useTaskContext } from '../../src/contexts/useTaskContext';
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
    },
  };
})();

// Replace global localStorage with mock
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Helper wrapper for TaskProvider
const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <TaskProvider>{children}</TaskProvider>
);

const createTestTask = (id: string, name: string): Task => ({
  id,
  name,
  duration: 30,
  isPlaced: false,
});

describe('TaskContext persistence', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllTimers();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('should load saved state on mount', async () => {
    const savedTasks = [
      createTestTask('task-1', 'Saved Task 1'),
      createTestTask('task-2', 'Saved Task 2'),
    ];

    // Pre-populate localStorage with saved state
    localStorageMock.setItem('narabetask_state', JSON.stringify({
      tasks: savedTasks,
      selectedTaskId: 'task-1',
    }));

    const { result } = renderHook(() => useTaskContext(), { wrapper: Wrapper });

    // Should load the saved tasks immediately
    expect(result.current.tasks).toEqual(savedTasks);
    expect(result.current.selectedTask).toEqual(savedTasks[0]);
  });

  it('should start with empty state when no saved data exists', () => {
    const { result } = renderHook(() => useTaskContext(), { wrapper: Wrapper });

    expect(result.current.tasks).toEqual([]);
    expect(result.current.selectedTask).toBeNull();
  });

  it('should not restore selectedTask if it does not exist in loaded tasks', () => {
    const savedTasks = [createTestTask('task-1', 'Saved Task 1')];

    // Pre-populate localStorage with non-existent selectedTaskId
    localStorageMock.setItem('narabetask_state', JSON.stringify({
      tasks: savedTasks,
      selectedTaskId: 'non-existent-id',
    }));

    const { result } = renderHook(() => useTaskContext(), { wrapper: Wrapper });

    expect(result.current.tasks).toEqual(savedTasks);
    expect(result.current.selectedTask).toBeNull();
  });

  it('should save state when tasks are added', async () => {
    const { result } = renderHook(() => useTaskContext(), { wrapper: Wrapper });

    act(() => {
      result.current.addTask();
    });

    // Fast-forward timer to trigger the save
    act(() => {
      vi.advanceTimersByTime(200);
    });

    const saved = localStorageMock.getItem('narabetask_state');
    expect(saved).toBeTruthy();
    
    const parsed = JSON.parse(saved!);
    expect(parsed.tasks).toHaveLength(1);
    expect(parsed.tasks[0].name).toBe('新しいタスク');
    expect(parsed.selectedTaskId).toBe(result.current.tasks[0].id);
  });

  it('should save state when tasks are updated', async () => {
    const { result } = renderHook(() => useTaskContext(), { wrapper: Wrapper });

    act(() => {
      result.current.addTask();
    });

    const taskToUpdate = result.current.tasks[0];
    const updatedTask = { ...taskToUpdate, name: 'Updated Task Name' };

    act(() => {
      result.current.updateTask(updatedTask);
    });

    // Fast-forward timer to trigger the save
    act(() => {
      vi.advanceTimersByTime(200);
    });

    const saved = localStorageMock.getItem('narabetask_state');
    const parsed = JSON.parse(saved!);
    expect(parsed.tasks[0].name).toBe('Updated Task Name');
  });

  it('should save state when task selection changes', async () => {
    const { result } = renderHook(() => useTaskContext(), { wrapper: Wrapper });

    act(() => {
      result.current.addTask();
    });

    const task = result.current.tasks[0];

    act(() => {
      result.current.selectTask(null);
    });

    // Fast-forward timer to trigger the save
    act(() => {
      vi.advanceTimersByTime(200);
    });

    const saved = localStorageMock.getItem('narabetask_state');
    const parsed = JSON.parse(saved!);
    expect(parsed.selectedTaskId).toBeNull();

    act(() => {
      result.current.selectTask(task);
    });

    // Fast-forward timer to trigger the save
    act(() => {
      vi.advanceTimersByTime(200);
    });

    const savedAfterSelect = localStorageMock.getItem('narabetask_state');
    const parsedAfterSelect = JSON.parse(savedAfterSelect!);
    expect(parsedAfterSelect.selectedTaskId).toBe(task.id);
  });

  it('should handle corrupted localStorage data gracefully', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    // Put invalid JSON in localStorage
    localStorageMock.setItem('narabetask_state', 'invalid json');

    const { result } = renderHook(() => useTaskContext(), { wrapper: Wrapper });

    // Should start with empty state and not crash
    expect(result.current.tasks).toEqual([]);
    expect(result.current.selectedTask).toBeNull();
    expect(consoleSpy).toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });
});