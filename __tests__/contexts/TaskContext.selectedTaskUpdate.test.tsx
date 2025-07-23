import { act, renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TaskProvider } from '../../src/contexts/TaskContext';
import { useTaskContext } from '../../src/contexts/useTaskContext';

// TaskProvider用のヘルパーラッパー
const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <TaskProvider>{children}</TaskProvider>
);

describe('TaskContext - dropTaskとreturnTaskでのselectedTask更新', () => {
  it('選択されたタスクがdropTaskで移動された時にselectedTaskが更新されること', () => {
    const { result } = renderHook(() => useTaskContext(), { wrapper: Wrapper });

    // 最初にタスクを追加
    act(() => {
      result.current.addTask();
    });

    const taskId = result.current.tasks[0].id;
    const originalTask = result.current.tasks[0];
    
    // タスクが最初に選択されていることを確認
    expect(result.current.selectedTask).toEqual(originalTask);
    expect(result.current.selectedTask?.startTime).toBeUndefined();

    // 選択されたタスクをタイムラインに移動
    const startTime = '09:00';
    act(() => {
      result.current.dropTask(taskId, startTime);
    });

    // tasks配列のタスクが更新されること
    expect(result.current.tasks[0]).toMatchObject({
      id: taskId,
      startTime: '09:00',
      isPlaced: true
    });

    // selectedTaskも新しいstartTimeを反映して更新されること
    expect(result.current.selectedTask).toMatchObject({
      id: taskId,
      startTime: '09:00',
      isPlaced: true
    });
    
    // 単に参照が同じオブジェクトではなく、更新されたデータが含まれていることを確認
    expect(result.current.selectedTask?.startTime).toBe('09:00');
  });

  it('異なるタスクがdropTaskで移動された時にselectedTaskは更新されないこと', () => {
    const { result } = renderHook(() => useTaskContext(), { wrapper: Wrapper });

    // 2つのタスクを追加
    act(() => {
      result.current.addTask();
    });
    act(() => {
      result.current.addTask();
    });

    const firstTaskId = result.current.tasks[0].id;
    const secondTaskId = result.current.tasks[1].id;
    
    // 最初のタスクを選択
    act(() => {
      result.current.selectTask(result.current.tasks[0]);
    });

    expect(result.current.selectedTask?.id).toBe(firstTaskId);

    // 2番目のタスク（選択されていない）を移動
    const startTime = '09:00';
    act(() => {
      result.current.dropTask(secondTaskId, startTime);
    });

    // 2番目のタスクはtasks配列で更新されること
    expect(result.current.tasks[1]).toMatchObject({
      id: secondTaskId,
      startTime: '09:00',
      isPlaced: true
    });

    // selectedTaskは最初のタスクのまま変更されないこと
    expect(result.current.selectedTask?.id).toBe(firstTaskId);
    expect(result.current.selectedTask?.startTime).toBeUndefined();
    expect(result.current.selectedTask?.isPlaced).toBe(false);
  });

  it('タスクが選択されていない時のdropTaskを正しく処理すること', () => {
    const { result } = renderHook(() => useTaskContext(), { wrapper: Wrapper });

    // 最初にタスクを追加
    act(() => {
      result.current.addTask();
    });

    const taskId = result.current.tasks[0].id;
    
    // 全てのタスクの選択を解除
    act(() => {
      result.current.selectTask(null);
    });

    expect(result.current.selectedTask).toBeNull();

    // タスクを移動
    const startTime = '09:00';
    act(() => {
      result.current.dropTask(taskId, startTime);
    });

    // タスクがtasks配列で更新されること
    expect(result.current.tasks[0]).toMatchObject({
      id: taskId,
      startTime: '09:00',
      isPlaced: true
    });

    // selectedTaskはnullのままであること
    expect(result.current.selectedTask).toBeNull();
  });

  it('選択されたタスクがreturnTaskで戻された時にselectedTaskが更新されること', () => {
    const { result } = renderHook(() => useTaskContext(), { wrapper: Wrapper });

    // タスクを追加してタイムラインに配置
    act(() => {
      result.current.addTask();
    });

    const taskId = result.current.tasks[0].id;
    
    // タスクをタイムラインに移動
    act(() => {
      result.current.dropTask(taskId, '09:00');
    });

    // タスクが配置されていることを確認
    expect(result.current.selectedTask).toMatchObject({
      id: taskId,
      startTime: '09:00',
      isPlaced: true
    });

    // タスクをタスク一覧に戻す
    act(() => {
      result.current.returnTask(taskId);
    });

    // tasks配列のタスクが更新されること
    expect(result.current.tasks[0]).toMatchObject({
      id: taskId,
      startTime: undefined,
      isPlaced: false,
      isLocked: false
    });

    // selectedTaskも更新されて、startTimeがundefined、isPlacedがfalseになること
    expect(result.current.selectedTask).toMatchObject({
      id: taskId,
      startTime: undefined,
      isPlaced: false,
      isLocked: false
    });
    
    // 確実にstartTimeがundefinedになっていることを確認
    expect(result.current.selectedTask?.startTime).toBeUndefined();
    expect(result.current.selectedTask?.isPlaced).toBe(false);
  });

  it('異なるタスクがreturnTaskで戻された時にselectedTaskは更新されないこと', () => {
    const { result } = renderHook(() => useTaskContext(), { wrapper: Wrapper });

    // 2つのタスクを追加
    act(() => {
      result.current.addTask();
    });
    act(() => {
      result.current.addTask();
    });

    const firstTaskId = result.current.tasks[0].id;
    const secondTaskId = result.current.tasks[1].id;
    
    // 両方のタスクをタイムラインに配置
    act(() => {
      result.current.dropTask(firstTaskId, '09:00');
    });
    act(() => {
      result.current.dropTask(secondTaskId, '10:00');
    });

    // 最初のタスクを選択
    act(() => {
      result.current.selectTask(result.current.tasks[0]);
    });

    expect(result.current.selectedTask?.id).toBe(firstTaskId);
    expect(result.current.selectedTask?.startTime).toBe('09:00');

    // 2番目のタスク（選択されていない）を戻す
    act(() => {
      result.current.returnTask(secondTaskId);
    });

    // 2番目のタスクはtasks配列で更新されること
    expect(result.current.tasks[1]).toMatchObject({
      id: secondTaskId,
      startTime: undefined,
      isPlaced: false,
      isLocked: false
    });

    // selectedTaskは最初のタスクのまま変更されないこと
    expect(result.current.selectedTask?.id).toBe(firstTaskId);
    expect(result.current.selectedTask?.startTime).toBe('09:00');
    expect(result.current.selectedTask?.isPlaced).toBe(true);
  });

  it('タスクが選択されていない時のreturnTaskを正しく処理すること', () => {
    const { result } = renderHook(() => useTaskContext(), { wrapper: Wrapper });

    // タスクを追加してタイムラインに配置
    act(() => {
      result.current.addTask();
    });

    const taskId = result.current.tasks[0].id;
    
    // タスクをタイムラインに移動
    act(() => {
      result.current.dropTask(taskId, '09:00');
    });

    // 全てのタスクの選択を解除
    act(() => {
      result.current.selectTask(null);
    });

    expect(result.current.selectedTask).toBeNull();

    // タスクを戻す
    act(() => {
      result.current.returnTask(taskId);
    });

    // タスクがtasks配列で更新されること
    expect(result.current.tasks[0]).toMatchObject({
      id: taskId,
      startTime: undefined,
      isPlaced: false,
      isLocked: false
    });

    // selectedTaskはnullのままであること
    expect(result.current.selectedTask).toBeNull();
  });
});