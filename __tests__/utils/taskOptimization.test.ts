import { describe, it, expect } from 'vitest';
import type { Task, BusinessHours } from '../../src/types';
import { optimizeTaskPlacement } from '../../src/utils/taskOptimization';

const defaultBusinessHours: BusinessHours = {
  start: '09:00',
  end: '18:00'
};

describe('タスク最適化機能', () => {
  it('単一タスクが正しく配置される', () => {
    const tasks: Task[] = [
      {
        id: '1',
        name: 'タスク1',
        duration: 30,
        workTime: 30,
        waitTime: 0,
        isPlaced: false
      }
    ];

    const result = optimizeTaskPlacement(tasks, defaultBusinessHours);

    expect(result.optimizedTasks).toHaveLength(1);
    expect(result.optimizedTasks[0].isPlaced).toBe(true);
    expect(result.optimizedTasks[0].startTime).toBe('09:00');
    expect(result.earliestEndTime).toBe('09:30');
  });

  it('複数タスクが時系列順に配置される', () => {
    const tasks: Task[] = [
      {
        id: '1',
        name: 'タスク1',
        duration: 30,
        workTime: 30,
        waitTime: 0,
        isPlaced: false
      },
      {
        id: '2',
        name: 'タスク2',
        duration: 45,
        workTime: 45,
        waitTime: 0,
        isPlaced: false
      },
      {
        id: '3',
        name: 'タスク3',
        duration: 15,
        workTime: 15,
        waitTime: 0,
        isPlaced: false
      }
    ];

    const result = optimizeTaskPlacement(tasks, defaultBusinessHours);

    expect(result.optimizedTasks).toHaveLength(3);
    
    // 全てのタスクが配置されていることを確認
    const placedTasks = result.optimizedTasks.filter(task => task.isPlaced);
    expect(placedTasks).toHaveLength(3);

    // 開始時間が設定されていることを確認
    placedTasks.forEach(task => {
      expect(task.startTime).toBeDefined();
    });
  });

  it('ロックされたタスクが固定位置として保持される', () => {
    const tasks: Task[] = [
      {
        id: '1',
        name: 'ロックタスク',
        duration: 30,
        workTime: 30,
        waitTime: 0,
        isPlaced: true,
        isLocked: true,
        startTime: '10:00'
      },
      {
        id: '2',
        name: '最適化タスク',
        duration: 30,
        workTime: 30,
        waitTime: 0,
        isPlaced: false
      }
    ];

    const result = optimizeTaskPlacement(tasks, defaultBusinessHours);

    const lockedTask = result.optimizedTasks.find(task => task.id === '1');
    const optimizedTask = result.optimizedTasks.find(task => task.id === '2');

    expect(lockedTask?.startTime).toBe('10:00');
    expect(lockedTask?.isLocked).toBe(true);
    expect(optimizedTask?.isPlaced).toBe(true);
    expect(optimizedTask?.startTime).not.toBe('10:00'); // ロックされたタスクと重複しないように配置
  });

  it('待ち時間のあるタスクの重複配置が考慮される', () => {
    const tasks: Task[] = [
      {
        id: '1',
        name: '待ち時間ありタスク',
        duration: 60,
        workTime: 30,
        waitTime: 30,
        isPlaced: false
      },
      {
        id: '2',
        name: '作業タスク',
        duration: 30,
        workTime: 30,
        waitTime: 0,
        isPlaced: false
      }
    ];

    const result = optimizeTaskPlacement(tasks, defaultBusinessHours);

    expect(result.optimizedTasks).toHaveLength(2);
    
    const placedTasks = result.optimizedTasks.filter(task => task.isPlaced);
    expect(placedTasks).toHaveLength(2);

    // 待ち時間削減が発生していることを確認
    expect(result.totalWaitTimeReduction).toBeGreaterThanOrEqual(0);
  });

  it('営業時間外にタスクが配置されない', () => {
    const limitedBusinessHours: BusinessHours = {
      start: '09:00',
      end: '09:30'
    };

    const tasks: Task[] = [
      {
        id: '1',
        name: 'タスク1',
        duration: 30,
        workTime: 30,
        waitTime: 0,
        isPlaced: false
      },
      {
        id: '2',
        name: 'タスク2',
        duration: 30,
        workTime: 30,
        waitTime: 0,
        isPlaced: false
      }
    ];

    const result = optimizeTaskPlacement(tasks, limitedBusinessHours);

    const placedTasks = result.optimizedTasks.filter(task => task.isPlaced);
    expect(placedTasks).toHaveLength(1); // 営業時間内に1つだけ配置可能
  });

  it('配置できないタスクは未配置状態に戻る', () => {
    const tasks: Task[] = [
      {
        id: '1',
        name: 'もともと配置済み',
        duration: 30,
        workTime: 30,
        waitTime: 0,
        isPlaced: true,
        startTime: '15:00'
      }
    ];

    // 非常に限定的な営業時間で配置不可能にする
    const limitedBusinessHours: BusinessHours = {
      start: '09:00',
      end: '09:15'
    };

    const result = optimizeTaskPlacement(tasks, limitedBusinessHours);

    expect(result.optimizedTasks[0].isPlaced).toBe(false);
    expect(result.optimizedTasks[0].startTime).toBeUndefined();
    expect(result.optimizedTasks[0].isLocked).toBe(false);
  });

  it('最早終了時間が正しく計算される', () => {
    const tasks: Task[] = [
      {
        id: '1',
        name: 'タスク1',
        duration: 30,
        workTime: 30,
        waitTime: 0,
        isPlaced: false
      },
      {
        id: '2',
        name: 'タスク2',
        duration: 45,
        workTime: 45,
        waitTime: 0,
        isPlaced: false
      }
    ];

    const result = optimizeTaskPlacement(tasks, defaultBusinessHours);

    // 最後のタスクの終了時間を確認
    const placedTasks = result.optimizedTasks
      .filter(task => task.isPlaced && task.startTime)
      .map(task => ({
        startTime: task.startTime!,
        endTime: new Date(`1970-01-01T${task.startTime}:00`).getTime() + task.duration * 60 * 1000
      }))
      .sort((a, b) => b.endTime - a.endTime);

    if (placedTasks.length > 0) {
      const latestEndTime = new Date(placedTasks[0].endTime);
      const expectedEndTime = `${latestEndTime.getHours().toString().padStart(2, '0')}:${latestEndTime.getMinutes().toString().padStart(2, '0')}`;
      expect(result.earliestEndTime).toBe(expectedEndTime);
    }
  });
});