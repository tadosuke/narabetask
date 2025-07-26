import type { Task, BusinessHours } from '../types';
import { 
  generateTimeSlots, 
  timeToMinutes, 
  minutesToTime, 
  getWorkTimeSlots, 
  canPlaceTaskWithWorkTime 
} from './timeUtils';

/**
 * タスクの最適化配置結果を表すインターフェース
 */
export interface OptimizationResult {
  /** 最適化されたタスクの配列 */
  optimizedTasks: Task[];
  /** 最早終了時間 */
  earliestEndTime: string;
  /** 総待ち時間の削減量 */
  totalWaitTimeReduction: number;
}

/**
 * 配置候補を表すインターフェース
 */
interface PlacementCandidate {
  /** タスク */
  task: Task;
  /** 開始時間 */
  startTime: string;
  /** 終了時間 */
  endTime: string;
  /** 他のタスクの待ち時間に重なる作業時間 */
  overlappedWorkTime: number;
}

/**
 * 全てのタスクを最も効率よく配置する最適化を実行します。
 * 
 * アルゴリズム:
 * 1. 配置済みのロックされたタスクは固定位置として扱う
 * 2. 未配置またはロックされていないタスクを最適化対象とする
 * 3. 各タスクの待ち時間部分に他のタスクの作業時間を詰める
 * 4. 全体の終了時間が最も早くなる組み合わせを採用する
 * 
 * @param tasks - 全タスクの配列
 * @param businessHours - 営業時間設定
 * @returns 最適化結果
 */
export function optimizeTaskPlacement(
  tasks: Task[], 
  businessHours: BusinessHours
): OptimizationResult {
  const timeSlots = generateTimeSlots(businessHours);
  
  // ロックされた配置済みタスクは固定位置として扱う
  const lockedTasks = tasks.filter(task => task.isPlaced && task.isLocked && task.startTime);
  const optimizableTasks = tasks.filter(task => !task.isPlaced || !task.isLocked);
  
  // ロックされたタスクが占有している作業時間スロット
  const lockedOccupiedSlots = new Set<string>();
  lockedTasks.forEach(task => {
    if (task.startTime) {
      const workSlots = getWorkTimeSlots(
        task.startTime, 
        task.duration, 
        task.workTime, 
        task.waitTime
      );
      workSlots.forEach(slot => lockedOccupiedSlots.add(slot));
    }
  });
  
  // 最適化可能なタスクを効率の良い順にソート
  // 待ち時間があるタスクを先に配置し、その後に作業のみのタスクを配置
  const sortedTasks = [...optimizableTasks].sort((a, b) => {
    const aWorkTime = a.workTime ?? a.duration;
    const bWorkTime = b.workTime ?? b.duration;
    const aWaitTime = a.waitTime ?? 0;
    const bWaitTime = b.waitTime ?? 0;
    
    // 1. 待ち時間があるタスクを優先
    if (aWaitTime > 0 && bWaitTime === 0) return -1;
    if (aWaitTime === 0 && bWaitTime > 0) return 1;
    
    // 2. 両方に待ち時間がある場合は、待ち時間が長いものを優先
    if (aWaitTime > 0 && bWaitTime > 0) {
      if (aWaitTime !== bWaitTime) return bWaitTime - aWaitTime;
      // 待ち時間が同じ場合は作業時間が長いものを優先
      return bWorkTime - aWorkTime;
    }
    
    // 3. 両方とも待ち時間がない場合は、作業時間が長いものを優先
    return bWorkTime - aWorkTime;
  });
  
  // 最適配置を計算
  const optimizedPlacements = findOptimalPlacements(
    sortedTasks,
    lockedTasks,
    lockedOccupiedSlots,
    timeSlots
  );
  
  // 結果のタスク配列を作成
  const optimizedTasks = tasks.map(task => {
    // ロックされたタスクはそのまま
    if (task.isPlaced && task.isLocked) {
      return task;
    }
    
    // 最適化されたタスクの配置を適用
    const placement = optimizedPlacements.find(p => p.task.id === task.id);
    if (placement) {
      return {
        ...task,
        startTime: placement.startTime,
        isPlaced: true
      };
    }
    
    // 配置できなかったタスクは未配置に戻す
    return {
      ...task,
      startTime: undefined,
      isPlaced: false,
      isLocked: false
    };
  });
  
  // 最早終了時間を計算
  const earliestEndTime = calculateEarliestEndTime(optimizedTasks);
  
  // 待ち時間削減量を計算
  const totalWaitTimeReduction = calculateWaitTimeReduction(
    optimizableTasks,
    optimizedPlacements
  );
  
  return {
    optimizedTasks,
    earliestEndTime,
    totalWaitTimeReduction
  };
}

/**
 * タスクの最適配置を見つけます。
 */
function findOptimalPlacements(
  sortableTasks: Task[],
  lockedTasks: Task[],
  lockedOccupiedSlots: Set<string>,
  timeSlots: string[]
): PlacementCandidate[] {
  const placements: PlacementCandidate[] = [];
  const currentOccupiedSlots = new Set(lockedOccupiedSlots);
  
  // 既に配置されたタスクを追跡（ロックされたタスク + 新規配置）
  const placedTasks: Task[] = [...lockedTasks];
  
  for (const task of sortableTasks) {
    const bestPlacement = findBestPlacementForTask(
      task,
      placedTasks,
      currentOccupiedSlots,
      timeSlots
    );
    
    if (bestPlacement) {
      placements.push(bestPlacement);
      placedTasks.push({
        ...task,
        startTime: bestPlacement.startTime,
        isPlaced: true
      });
      
      // 作業時間スロットを占有として追加
      const workSlots = getWorkTimeSlots(
        bestPlacement.startTime,
        task.duration,
        task.workTime,
        task.waitTime
      );
      workSlots.forEach(slot => currentOccupiedSlots.add(slot));
    }
  }
  
  return placements;
}

/**
 * 単一タスクの最適配置位置を見つけます。
 */
function findBestPlacementForTask(
  task: Task,
  placedTasks: Task[],
  occupiedSlots: Set<string>,
  timeSlots: string[]
): PlacementCandidate | null {
  let bestCandidate: PlacementCandidate | null = null;
  let maxOverlap = -1;
  let earliestTime = Number.MAX_SAFE_INTEGER;
  
  for (const slot of timeSlots) {
    // このスロットにタスクを配置できるかチェック
    if (!canPlaceTaskWithWorkTime(
      slot,
      task.duration,
      task.workTime,
      task.waitTime,
      occupiedSlots,
      timeSlots
    )) {
      continue;
    }
    
    // 他のタスクの待ち時間と重なる作業時間を計算
    const overlappedWorkTime = calculateOverlappedWorkTime(
      task,
      slot,
      placedTasks
    );
    
    const startMinutes = timeToMinutes(slot);
    const endMinutes = startMinutes + task.duration;
    const endTime = minutesToTime(endMinutes);
    
    const candidate: PlacementCandidate = {
      task,
      startTime: slot,
      endTime,
      overlappedWorkTime
    };
    
    // より多くの重複（効率性）または、より早い時間を優先
    if (overlappedWorkTime > maxOverlap || 
        (overlappedWorkTime === maxOverlap && startMinutes < earliestTime)) {
      bestCandidate = candidate;
      maxOverlap = overlappedWorkTime;
      earliestTime = startMinutes;
    }
  }
  
  return bestCandidate;
}

/**
 * タスクが指定位置に配置された時の、他のタスクの待ち時間との重複作業時間を計算します。
 */
function calculateOverlappedWorkTime(
  task: Task,
  startTime: string,
  placedTasks: Task[]
): number {
  const taskWorkSlots = getWorkTimeSlots(
    startTime,
    task.duration,
    task.workTime,
    task.waitTime
  );
  
  let overlappedTime = 0;
  
  for (const placedTask of placedTasks) {
    if (!placedTask.startTime || !placedTask.waitTime) continue;
    
    // 配置済みタスクの待ち時間スロットを取得
    const waitSlots = getWaitTimeSlots(
      placedTask.startTime,
      placedTask.duration,
      placedTask.workTime,
      placedTask.waitTime
    );
    
    // 重複するスロット数を計算
    const overlapCount = taskWorkSlots.filter(slot => waitSlots.includes(slot)).length;
    overlappedTime += overlapCount * 15; // 15分単位
  }
  
  return overlappedTime;
}

/**
 * タスクの待ち時間部分のタイムスロットを取得します。
 */
function getWaitTimeSlots(
  startTime: string,
  duration: number,
  workTime?: number,
  waitTime?: number
): string[] {
  const actualWaitTime = waitTime ?? 0;
  const actualWorkTime = workTime ?? (duration - actualWaitTime);
  
  if (actualWaitTime === 0) {
    return [];
  }
  
  const slots: string[] = [];
  const startMinutes = timeToMinutes(startTime);
  
  // 待ち時間は作業時間の後に配置される
  for (let i = actualWorkTime; i < duration; i += 15) {
    slots.push(minutesToTime(startMinutes + i));
  }
  
  return slots;
}

/**
 * 最早終了時間を計算します。
 */
function calculateEarliestEndTime(tasks: Task[]): string {
  let latestEndMinutes = 0;
  
  for (const task of tasks) {
    if (task.isPlaced && task.startTime) {
      const endMinutes = timeToMinutes(task.startTime) + task.duration;
      if (endMinutes > latestEndMinutes) {
        latestEndMinutes = endMinutes;
      }
    }
  }
  
  return latestEndMinutes > 0 ? minutesToTime(latestEndMinutes) : "09:00";
}

/**
 * 待ち時間削減量を計算します。
 */
function calculateWaitTimeReduction(
  _originalTasks: Task[],
  placements: PlacementCandidate[]
): number {
  // 簡略化：重複した作業時間の合計を削減量として計算
  return placements.reduce((total, placement) => {
    return total + placement.overlappedWorkTime;
  }, 0);
}