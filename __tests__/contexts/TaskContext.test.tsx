import { act, renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TaskProvider } from '../../src/contexts/TaskContext';
import { useTaskContext } from '../../src/contexts/useTaskContext';

// Helper wrapper for TaskProvider
const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <TaskProvider>{children}</TaskProvider>
);

describe('TaskContext', () => {
  it('should provide initial empty tasks state', () => {
    const { result } = renderHook(() => useTaskContext(), { wrapper: Wrapper });

    expect(result.current.tasks).toEqual([]);
    expect(result.current.selectedTask).toBeNull();
    expect(result.current.draggedTaskId).toBeNull();
  });

  it('should add a new task when addTask is called', () => {
    const { result } = renderHook(() => useTaskContext(), { wrapper: Wrapper });

    act(() => {
      result.current.addTask();
    });

    expect(result.current.tasks).toHaveLength(1);
    expect(result.current.tasks[0]).toMatchObject({
      name: '新しいタスク',
      duration: 30,
      isPlaced: false,
    });
    expect(result.current.tasks[0].id).toBeTruthy();
    expect(result.current.selectedTask).toEqual(result.current.tasks[0]);
  });

  it('should update a task when updateTask is called', () => {
    const { result } = renderHook(() => useTaskContext(), { wrapper: Wrapper });

    // Add a task first
    act(() => {
      result.current.addTask();
    });

    const taskToUpdate = result.current.tasks[0];
    const updatedTask = { ...taskToUpdate, name: 'Updated Task', duration: 60 };

    act(() => {
      result.current.updateTask(updatedTask);
    });

    expect(result.current.tasks[0]).toEqual(updatedTask);
    expect(result.current.selectedTask).toEqual(updatedTask);
  });

  it('should remove a task when removeTask is called', () => {
    const { result } = renderHook(() => useTaskContext(), { wrapper: Wrapper });

    // Add a task first
    act(() => {
      result.current.addTask();
    });

    const taskId = result.current.tasks[0].id;

    act(() => {
      result.current.removeTask(taskId);
    });

    expect(result.current.tasks).toHaveLength(0);
    expect(result.current.selectedTask).toBeNull();
  });

  it('should place a task on timeline when dropTask is called', () => {
    const { result } = renderHook(() => useTaskContext(), { wrapper: Wrapper });

    // Add a task first
    act(() => {
      result.current.addTask();
    });

    const taskId = result.current.tasks[0].id;
    const startTime = '09:00';

    act(() => {
      result.current.dropTask(taskId, startTime);
    });

    expect(result.current.tasks[0]).toMatchObject({
      startTime: '09:00',
      isPlaced: true,
    });
  });

  it('should return a task from timeline when returnTask is called', () => {
    const { result } = renderHook(() => useTaskContext(), { wrapper: Wrapper });

    // Add and place a task first
    act(() => {
      result.current.addTask();
    });

    const taskId = result.current.tasks[0].id;

    act(() => {
      result.current.dropTask(taskId, '09:00');
    });

    act(() => {
      result.current.returnTask(taskId);
    });

    expect(result.current.tasks[0]).toMatchObject({
      startTime: undefined,
      isPlaced: false,
      isLocked: false,
    });
  });

  it('should toggle task lock when toggleLock is called', () => {
    const { result } = renderHook(() => useTaskContext(), { wrapper: Wrapper });

    // Add a task first
    act(() => {
      result.current.addTask();
    });

    const taskId = result.current.tasks[0].id;

    act(() => {
      result.current.toggleLock(taskId);
    });

    expect(result.current.tasks[0].isLocked).toBe(true);

    act(() => {
      result.current.toggleLock(taskId);
    });

    expect(result.current.tasks[0].isLocked).toBe(false);
  });

  it('should select and deselect tasks', () => {
    const { result } = renderHook(() => useTaskContext(), { wrapper: Wrapper });

    // Add a task first
    act(() => {
      result.current.addTask();
    });

    const task = result.current.tasks[0];

    // Task should be selected by default when added
    expect(result.current.selectedTask).toEqual(task);

    act(() => {
      result.current.selectTask(null);
    });

    expect(result.current.selectedTask).toBeNull();

    act(() => {
      result.current.selectTask(task);
    });

    expect(result.current.selectedTask).toEqual(task);
  });

  it('should handle drag operations', () => {
    const { result } = renderHook(() => useTaskContext(), { wrapper: Wrapper });

    // Add a task first
    act(() => {
      result.current.addTask();
    });

    const taskId = result.current.tasks[0].id;

    act(() => {
      result.current.startDrag(taskId);
    });

    expect(result.current.draggedTaskId).toBe(taskId);
    expect(result.current.selectedTask).toEqual(result.current.tasks[0]);

    act(() => {
      result.current.endDrag();
    });

    expect(result.current.draggedTaskId).toBeNull();
  });

  it('should throw error when used outside provider', () => {
    // This should be wrapped in expect() to catch the error
    expect(() => {
      renderHook(() => useTaskContext());
    }).toThrow('useTaskContext must be used within a TaskProvider');
  });

  it('should preserve placement state when updating placed tasks', () => {
    const { result } = renderHook(() => useTaskContext(), { wrapper: Wrapper });

    // Add a task first
    act(() => {
      result.current.addTask();
    });

    const task = result.current.tasks[0];
    const startTime = '09:00';

    // Place the task
    act(() => {
      result.current.dropTask(task.id, startTime);
    });

    // Update task without placement info
    const updatedTask = { ...task, name: 'Updated Task' };
    // Remove placement info to test preservation
    delete updatedTask.startTime;
    delete updatedTask.isPlaced;

    act(() => {
      result.current.updateTask(updatedTask);
    });

    // Placement state should be preserved
    expect(result.current.tasks[0]).toMatchObject({
      name: 'Updated Task',
      startTime: '09:00',
      isPlaced: true,
    });
  });
});