import { act, renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TaskProvider } from '../../src/contexts/TaskContext';
import { useTaskContext } from '../../src/contexts/useTaskContext';

// Helper wrapper for TaskProvider
const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <TaskProvider>{children}</TaskProvider>
);

describe('TaskContext - selectedTask updates on dropTask', () => {
  it('should update selectedTask when the selected task is moved via dropTask', () => {
    const { result } = renderHook(() => useTaskContext(), { wrapper: Wrapper });

    // Add a task first
    act(() => {
      result.current.addTask();
    });

    const taskId = result.current.tasks[0].id;
    const originalTask = result.current.tasks[0];
    
    // Verify the task is selected initially
    expect(result.current.selectedTask).toEqual(originalTask);
    expect(result.current.selectedTask?.startTime).toBeUndefined();

    // Move the selected task to timeline
    const startTime = '09:00';
    act(() => {
      result.current.dropTask(taskId, startTime);
    });

    // The task in tasks array should be updated
    expect(result.current.tasks[0]).toMatchObject({
      id: taskId,
      startTime: '09:00',
      isPlaced: true,
    });

    // The selectedTask should also be updated to reflect the new startTime
    expect(result.current.selectedTask).toMatchObject({
      id: taskId,
      startTime: '09:00',
      isPlaced: true,
    });
    
    // Ensure it's not just referentially the same object but has the updated data
    expect(result.current.selectedTask?.startTime).toBe('09:00');
  });

  it('should not update selectedTask when a different task is moved via dropTask', () => {
    const { result } = renderHook(() => useTaskContext(), { wrapper: Wrapper });

    // Add two tasks
    act(() => {
      result.current.addTask();
    });
    act(() => {
      result.current.addTask();
    });

    const firstTaskId = result.current.tasks[0].id;
    const secondTaskId = result.current.tasks[1].id;
    
    // Select the first task
    act(() => {
      result.current.selectTask(result.current.tasks[0]);
    });

    expect(result.current.selectedTask?.id).toBe(firstTaskId);

    // Move the second task (not the selected one)
    const startTime = '09:00';
    act(() => {
      result.current.dropTask(secondTaskId, startTime);
    });

    // The second task should be updated in tasks array
    expect(result.current.tasks[1]).toMatchObject({
      id: secondTaskId,
      startTime: '09:00',
      isPlaced: true,
    });

    // The selectedTask should remain the first task and unchanged
    expect(result.current.selectedTask?.id).toBe(firstTaskId);
    expect(result.current.selectedTask?.startTime).toBeUndefined();
    expect(result.current.selectedTask?.isPlaced).toBe(false);
  });

  it('should handle dropTask when no task is selected', () => {
    const { result } = renderHook(() => useTaskContext(), { wrapper: Wrapper });

    // Add a task first
    act(() => {
      result.current.addTask();
    });

    const taskId = result.current.tasks[0].id;
    
    // Deselect all tasks
    act(() => {
      result.current.selectTask(null);
    });

    expect(result.current.selectedTask).toBeNull();

    // Move the task
    const startTime = '09:00';
    act(() => {
      result.current.dropTask(taskId, startTime);
    });

    // The task should be updated in tasks array
    expect(result.current.tasks[0]).toMatchObject({
      id: taskId,
      startTime: '09:00',
      isPlaced: true,
    });

    // selectedTask should remain null
    expect(result.current.selectedTask).toBeNull();
  });
});