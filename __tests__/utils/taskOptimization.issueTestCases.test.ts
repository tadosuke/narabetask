import { describe, it, expect } from 'vitest';
import type { Task, BusinessHours } from '../../src/types';
import { optimizeTaskPlacement } from '../../src/utils/taskOptimization';

const defaultBusinessHours: BusinessHours = {
  start: '09:00',
  end: '18:00'
};

describe('タスク最適化 - Issue Test Cases', () => {
  it('テストケース1: 待ち時間への最適配置', () => {
    const tasks: Task[] = [
      {
        id: 'A',
        name: 'タスクA',
        duration: 30,
        workTime: 30,
        waitTime: 0,
        isPlaced: false
      },
      {
        id: 'B',
        name: 'タスクB',
        duration: 60,
        workTime: 30,
        waitTime: 30,
        isPlaced: false
      }
    ];

    const result = optimizeTaskPlacement(tasks, defaultBusinessHours);

    // 期待する結果: タスクB(9:00) → A(9:30)
    const taskA = result.optimizedTasks.find(t => t.id === 'A');
    const taskB = result.optimizedTasks.find(t => t.id === 'B');

    expect(taskA?.isPlaced).toBe(true);
    expect(taskB?.isPlaced).toBe(true);
    expect(taskB?.startTime).toBe('09:00');
    expect(taskA?.startTime).toBe('09:30');
  });

  it('テストケース2: ロックされたタスクとの最適配置', () => {
    const tasks: Task[] = [
      {
        id: 'A',
        name: 'タスクA',
        duration: 60, // 12:00-13:00
        workTime: 60,
        waitTime: 0,
        isPlaced: true,
        isLocked: true,
        startTime: '12:00'
      },
      {
        id: 'B',
        name: 'タスクB',
        duration: 240, // 3h work + 1h wait = 4h total
        workTime: 180, // 3h
        waitTime: 60,  // 1h
        isPlaced: false
      }
    ];

    const result = optimizeTaskPlacement(tasks, defaultBusinessHours);

    // 期待する結果: B (9:00) → A (12:00)
    const taskA = result.optimizedTasks.find(t => t.id === 'A');
    const taskB = result.optimizedTasks.find(t => t.id === 'B');

    expect(taskA?.isPlaced).toBe(true);
    expect(taskB?.isPlaced).toBe(true);
    expect(taskA?.startTime).toBe('12:00'); // ロックされているので固定
    expect(taskB?.startTime).toBe('09:00');
  });

  it('テストケース3: 複数タスクの複雑な最適配置', () => {
    const tasks: Task[] = [
      {
        id: 'A',
        name: 'タスクA',
        duration: 60, // 12:00-13:00でロック
        workTime: 60,
        waitTime: 0,
        isPlaced: true,
        isLocked: true,
        startTime: '12:00'
      },
      {
        id: 'B',
        name: 'タスクB',
        duration: 180, // 2h work + 1h wait = 3h total
        workTime: 120, // 2h
        waitTime: 60,  // 1h
        isPlaced: false
      },
      {
        id: 'C',
        name: 'タスクC',
        duration: 120, // 2h work, 0m wait
        workTime: 120,
        waitTime: 0,
        isPlaced: false
      },
      {
        id: 'D',
        name: 'タスクD',
        duration: 60, // 1h work, 0m wait
        workTime: 60,
        waitTime: 0,
        isPlaced: false
      }
    ];

    const result = optimizeTaskPlacement(tasks, defaultBusinessHours);

    // 期待する結果: B (9:00) → D (11:00) → A(12:00) → C(13:00)
    const taskA = result.optimizedTasks.find(t => t.id === 'A');
    const taskB = result.optimizedTasks.find(t => t.id === 'B');
    const taskC = result.optimizedTasks.find(t => t.id === 'C');
    const taskD = result.optimizedTasks.find(t => t.id === 'D');

    expect(taskA?.isPlaced).toBe(true);
    expect(taskB?.isPlaced).toBe(true);
    expect(taskC?.isPlaced).toBe(true);
    expect(taskD?.isPlaced).toBe(true);

    expect(taskA?.startTime).toBe('12:00'); // ロックされているので固定
    expect(taskB?.startTime).toBe('09:00');
    expect(taskD?.startTime).toBe('11:00');
    expect(taskC?.startTime).toBe('13:00');
  });
});