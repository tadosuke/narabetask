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
