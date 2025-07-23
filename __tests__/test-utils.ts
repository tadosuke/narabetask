import type { Task } from '../src/types';

/**
 * テスト用のタスクを作成するヘルパー関数
 */
export function createTestTask(overrides: Partial<Task> & { duration?: number }): Task {
  const { duration, workTime, waitTime, ...rest } = overrides;
  
  // durationが指定されていて、workTimeとwaitTimeが指定されていない場合は半々に分割
  let finalWorkTime = workTime ?? 15;
  let finalWaitTime = waitTime ?? 15;
  
  if (duration !== undefined && workTime === undefined && waitTime === undefined) {
    finalWorkTime = Math.floor(duration / 2);
    finalWaitTime = duration - finalWorkTime;
  }
  
  return {
    id: 'test-task',
    name: 'Test Task',
    workTime: finalWorkTime,
    waitTime: finalWaitTime,
    duration: finalWorkTime + finalWaitTime,
    isPlaced: false,
    ...rest,
  };
}