import { describe, it, expect } from 'vitest';
import type { Task } from '../../src/types';

describe('Task interface with workTime and waitTime properties', () => {
  it('should accept a task with workTime and waitTime properties', () => {
    const task: Task = {
      id: 'test-id',
      name: 'Test Task',
      duration: 60,
      workTime: 45,
      waitTime: 15,
      isPlaced: false,
    };

    expect(task.workTime).toBe(45);
    expect(task.waitTime).toBe(15);
    expect(task.duration).toBe(60);
  });

  it('should accept a task without workTime and waitTime properties (backward compatibility)', () => {
    const task: Task = {
      id: 'test-id',
      name: 'Test Task',
      duration: 30,
      isPlaced: false,
    };

    expect(task.workTime).toBeUndefined();
    expect(task.waitTime).toBeUndefined();
    expect(task.duration).toBe(30);
  });

  it('should accept a task with only workTime property', () => {
    const task: Task = {
      id: 'test-id',
      name: 'Test Task',
      duration: 30,
      workTime: 30,
      isPlaced: false,
    };

    expect(task.workTime).toBe(30);
    expect(task.waitTime).toBeUndefined();
    expect(task.duration).toBe(30);
  });

  it('should accept a task with only waitTime property', () => {
    const task: Task = {
      id: 'test-id',
      name: 'Test Task',
      duration: 30,
      waitTime: 15,
      isPlaced: false,
    };

    expect(task.workTime).toBeUndefined();
    expect(task.waitTime).toBe(15);
    expect(task.duration).toBe(30);
  });

  it('should maintain all existing Task properties along with new properties', () => {
    const task: Task = {
      id: 'test-id',
      name: 'Test Task',
      duration: 90,
      workTime: 60,
      waitTime: 30,
      startTime: '09:00',
      isPlaced: true,
      isLocked: true,
    };

    // Verify existing properties
    expect(task.id).toBe('test-id');
    expect(task.name).toBe('Test Task');
    expect(task.duration).toBe(90);
    expect(task.startTime).toBe('09:00');
    expect(task.isPlaced).toBe(true);
    expect(task.isLocked).toBe(true);

    // Verify new properties
    expect(task.workTime).toBe(60);
    expect(task.waitTime).toBe(30);
  });
});