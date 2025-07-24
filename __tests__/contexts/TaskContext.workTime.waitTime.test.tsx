import { act, renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TaskProvider } from '../../src/contexts/TaskContext';
import { useTaskContext } from '../../src/contexts/useTaskContext';

// Helper wrapper for TaskProvider
const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <TaskProvider>{children}</TaskProvider>
);

describe('TaskContext with workTime and waitTime', () => {
  it('should create new tasks with workTime and waitTime properties', () => {
    const { result } = renderHook(() => useTaskContext(), { wrapper: Wrapper });

    act(() => {
      result.current.addTask();
    });

    expect(result.current.tasks).toHaveLength(1);
    const newTask = result.current.tasks[0];
    
    // Verify existing properties
    expect(newTask).toMatchObject({
      name: '新しいタスク',
      duration: 30,
      isPlaced: false
    });
    expect(newTask.id).toBeTruthy();

    // Verify new properties
    expect(newTask.workTime).toBe(30);
    expect(newTask.waitTime).toBe(0);
  });

  it('should maintain workTime and waitTime when updating tasks', () => {
    const { result } = renderHook(() => useTaskContext(), { wrapper: Wrapper });

    // Add a task first
    act(() => {
      result.current.addTask();
    });

    const taskToUpdate = result.current.tasks[0];
    const updatedTask = { 
      ...taskToUpdate, 
      name: 'Updated Task', 
      duration: 60,
      workTime: 45,
      waitTime: 15
    };

    act(() => {
      result.current.updateTask(updatedTask);
    });

    expect(result.current.tasks).toHaveLength(1);
    const updatedTaskResult = result.current.tasks[0];
    
    expect(updatedTaskResult.name).toBe('Updated Task');
    expect(updatedTaskResult.duration).toBe(60);
    expect(updatedTaskResult.workTime).toBe(45);
    expect(updatedTaskResult.waitTime).toBe(15);
  });

  it('should preserve workTime and waitTime when task is placed on timeline', () => {
    const { result } = renderHook(() => useTaskContext(), { wrapper: Wrapper });

    // Add a task first
    act(() => {
      result.current.addTask();
    });

    const task = result.current.tasks[0];

    // Update with custom workTime and waitTime
    const updatedTask = { 
      ...task, 
      workTime: 20,
      waitTime: 10
    };

    act(() => {
      result.current.updateTask(updatedTask);
    });

    // Drop the task on timeline
    act(() => {
      result.current.dropTask(task.id, '09:00');
    });

    const placedTask = result.current.tasks[0];
    expect(placedTask.isPlaced).toBe(true);
    expect(placedTask.startTime).toBe('09:00');
    expect(placedTask.workTime).toBe(20);
    expect(placedTask.waitTime).toBe(10);
  });

  it('should preserve workTime and waitTime when task is returned from timeline', () => {
    const { result } = renderHook(() => useTaskContext(), { wrapper: Wrapper });

    // Add a task first
    act(() => {
      result.current.addTask();
    });

    const task = result.current.tasks[0];

    // Update with custom workTime and waitTime
    const updatedTask = { 
      ...task, 
      workTime: 25,
      waitTime: 5
    };

    act(() => {
      result.current.updateTask(updatedTask);
    });

    // Drop the task on timeline
    act(() => {
      result.current.dropTask(task.id, '09:00');
    });

    // Return the task to staging
    act(() => {
      result.current.returnTask(task.id);
    });

    const returnedTask = result.current.tasks[0];
    expect(returnedTask.isPlaced).toBe(false);
    expect(returnedTask.startTime).toBeUndefined();
    expect(returnedTask.workTime).toBe(25);
    expect(returnedTask.waitTime).toBe(5);
  });
});