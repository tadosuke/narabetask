import type { BusinessHours, LunchBreak } from "../types";

/**
 * 15分間隔でタイムスロットを生成します。
 * @param {BusinessHours} businessHours - 営業開始・終了時刻
 * @param {LunchBreak} lunchBreak - 昼休みの開始・終了時刻
 * @returns {string[]} タイムスロットの配列（例: "09:00"）
 */
export function generateTimeSlots(
  businessHours: BusinessHours,
  lunchBreak: LunchBreak
): string[] {
  const slots: string[] = [];
  const startHour = parseInt(businessHours.start.split(":")[0]);
  const startMinute = parseInt(businessHours.start.split(":")[1]);
  const endHour = parseInt(businessHours.end.split(":")[0]);
  const endMinute = parseInt(businessHours.end.split(":")[1]);

  const lunchStartHour = parseInt(lunchBreak.start.split(":")[0]);
  const lunchStartMinute = parseInt(lunchBreak.start.split(":")[1]);
  const lunchEndHour = parseInt(lunchBreak.end.split(":")[0]);
  const lunchEndMinute = parseInt(lunchBreak.end.split(":")[1]);

  let currentHour = startHour;
  let currentMinute = startMinute;

  while (
    currentHour < endHour ||
    (currentHour === endHour && currentMinute < endMinute)
  ) {
    // 現在時刻が昼休み時間内かどうかを判定
    const currentTotalMinutes = currentHour * 60 + currentMinute;
    const lunchStartTotalMinutes = lunchStartHour * 60 + lunchStartMinute;
    const lunchEndTotalMinutes = lunchEndHour * 60 + lunchEndMinute;

    if (
      currentTotalMinutes < lunchStartTotalMinutes ||
      currentTotalMinutes >= lunchEndTotalMinutes
    ) {
      const timeString = `${currentHour
        .toString()
        .padStart(2, "0")}:${currentMinute.toString().padStart(2, "0")}`;
      slots.push(timeString);
    }

    // 15分進める
    currentMinute += 15;
    if (currentMinute >= 60) {
      currentMinute = 0;
      currentHour += 1;
    }
  }

  return slots;
}

/**
 * 時刻文字列（例: "09:15"）を分単位に変換します。
 * @param {string} time - 時刻文字列
 * @returns {number} 分単位の値
 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

/**
 * 分単位の値を時刻文字列（例: "09:15"）に変換します。
 * @param {number} minutes - 分単位の値
 * @returns {string} 時刻文字列
 */
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins
    .toString()
    .padStart(2, "0")}`;
}

/**
 * 指定したタイムスロットにタスクを配置できるか判定します。
 * @param {string} startTime - タスク開始時刻
 * @param {number} duration - タスクの所要時間（分）
 * @param {Set<string>} occupiedSlots - 既に埋まっているタイムスロット
 * @param {string[]} availableSlots - 利用可能なタイムスロット
 * @returns {boolean} 配置可能ならtrue
 */
export function canPlaceTask(
  startTime: string,
  duration: number,
  occupiedSlots: Set<string>,
  availableSlots: string[]
): boolean {
  const startMinutes = timeToMinutes(startTime);

  for (let i = 0; i < duration; i += 15) {
    const slotTime = minutesToTime(startMinutes + i);
    if (!availableSlots.includes(slotTime) || occupiedSlots.has(slotTime)) {
      return false;
    }
  }

  return true;
}

/**
 * タスクが占有するすべてのタイムスロットを取得します。
 * @param {string} startTime - タスク開始時刻
 * @param {number} duration - タスクの所要時間（分）
 * @returns {string[]} 占有するタイムスロットの配列
 */
export function getTaskSlots(startTime: string, duration: number): string[] {
  const slots: string[] = [];
  const startMinutes = timeToMinutes(startTime);

  for (let i = 0; i < duration; i += 15) {
    slots.push(minutesToTime(startMinutes + i));
  }

  return slots;
}

/**
 * タスクの開始時刻と所要時間から終了時刻を計算します。
 * @param {string} startTime - タスク開始時刻（HH:mm形式）
 * @param {number} duration - タスクの所要時間（分）
 * @returns {string} タスク終了時刻（HH:mm形式）
 */
export function calculateEndTime(startTime: string, duration: number): string {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = startMinutes + duration;
  return minutesToTime(endMinutes);
}

/**
 * 2つのタスクがリソースを共有しているかを判定します。
 * @param {string[]} resourceTypes1 - 1つ目のタスクのリソースタイプ
 * @param {string[]} resourceTypes2 - 2つ目のタスクのリソースタイプ
 * @returns {boolean} リソースを共有している場合はtrue
 */
export function doTasksShareResources(resourceTypes1: string[], resourceTypes2: string[]): boolean {
  return resourceTypes1.some(resource => resourceTypes2.includes(resource));
}

/**
 * 配置済みタスクの中で重複しているタスクのIDを取得します。
 * 重複は時間の重なりとリソースの共有の両方がある場合に発生します。
 * @param {any[]} placedTasks - 配置済みタスクの配列
 * @returns {Set<string>} 重複しているタスクのIDのセット
 */
export function findOverlappingTasks(placedTasks: any[]): Set<string> {
  const overlappingIds = new Set<string>();
  
  // 配置済みで開始時間が設定されているタスクのみを対象とする
  const validTasks = placedTasks.filter(task => task.isPlaced && task.startTime);
  
  for (let i = 0; i < validTasks.length; i++) {
    for (let j = i + 1; j < validTasks.length; j++) {
      const task1 = validTasks[i];
      const task2 = validTasks[j];
      
      // リソースを共有していない場合は重複とみなさない
      if (!doTasksShareResources(task1.resourceTypes, task2.resourceTypes)) {
        continue;
      }
      
      // タスク1の時間スロット
      const task1Slots = getTaskSlots(task1.startTime!, task1.duration);
      // タスク2の時間スロット
      const task2Slots = getTaskSlots(task2.startTime!, task2.duration);
      
      // 時間スロットの重複をチェック
      const hasTimeOverlap = task1Slots.some(slot => task2Slots.includes(slot));
      
      if (hasTimeOverlap) {
        overlappingIds.add(task1.id);
        overlappingIds.add(task2.id);
      }
    }
  }
  
  return overlappingIds;
}
