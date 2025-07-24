import { describe, it, expect } from "vitest";
import { 
  getWorkTimeSlots, 
  findOverlappingTasksWithWorkTime,
  canPlaceTaskWithWorkTime 
} from "../../src/utils/timeUtils";

describe("作業時間を考慮した重複検出", () => {
  describe("getWorkTimeSlots", () => {
    it("作業時間のみのスロットを返す（待ち時間は除外）", () => {
      // タスク: 09:00開始、60分duration、45分workTime、15分waitTime
      // 作業時間: 09:00-09:45 (45分)
      // 待ち時間: 09:45-10:00 (15分)
      const slots = getWorkTimeSlots("09:00", 60, 45, 15);
      expect(slots).toEqual([
        "09:00", "09:15", "09:30" // 45分 = 3スロット
      ]);
    });

    it("workTimeが未指定の場合は全durationを作業時間とする（後方互換性）", () => {
      const slots = getWorkTimeSlots("09:00", 60);
      expect(slots).toEqual([
        "09:00", "09:15", "09:30", "09:45" // 60分 = 4スロット
      ]);
    });

    it("waitTimeのみ指定の場合、残りを作業時間とする", () => {
      // 60分duration、waitTime 15分 → workTime 45分
      const slots = getWorkTimeSlots("09:00", 60, undefined, 15);
      expect(slots).toEqual([
        "09:00", "09:15", "09:30" // 45分 = 3スロット
      ]);
    });

    it("workTime + waitTime = durationの場合", () => {
      const slots = getWorkTimeSlots("10:00", 60, 30, 30);
      expect(slots).toEqual([
        "10:00", "10:15" // 30分 = 2スロット
      ]);
    });

    it("workTimeのみ指定でwaitTimeがない場合", () => {
      const slots = getWorkTimeSlots("10:00", 45, 45);
      expect(slots).toEqual([
        "10:00", "10:15", "10:30" // 45分 = 3スロット
      ]);
    });
  });

  describe("findOverlappingTasksWithWorkTime", () => {
    it("作業時間が重複する場合に重複を検出する", () => {
      const tasks = [
        {
          id: "task1",
          startTime: "09:00",
          duration: 60,
          workTime: 45,
          waitTime: 15,
          isPlaced: true,
        },
        {
          id: "task2", 
          startTime: "09:30",
          duration: 60,
          workTime: 45,
          waitTime: 15,
          isPlaced: true,
        },
      ];
      // task1作業時間: 09:00-09:45
      // task2作業時間: 09:30-10:15
      // 重複: 09:30-09:45

      const overlapping = findOverlappingTasksWithWorkTime(tasks);
      expect(overlapping.has("task1")).toBe(true);
      expect(overlapping.has("task2")).toBe(true);
    });

    it("作業時間が重複せず、待ち時間のみ重複する場合は重複を検出しない", () => {
      const tasks = [
        {
          id: "task1",
          startTime: "09:00",
          duration: 60,
          workTime: 30,
          waitTime: 30,
          isPlaced: true,
        },
        {
          id: "task2",
          startTime: "09:45",
          duration: 60,
          workTime: 30,
          waitTime: 30,
          isPlaced: true,
        },
      ];
      // task1作業時間: 09:00-09:30, 待ち時間: 09:30-10:00
      // task2作業時間: 09:45-10:15, 待ち時間: 10:15-10:45
      // 作業時間重複なし、待ち時間のみ重複: 09:45-10:00

      const overlapping = findOverlappingTasksWithWorkTime(tasks);
      expect(overlapping.has("task1")).toBe(false);
      expect(overlapping.has("task2")).toBe(false);
    });

    it("作業時間が完全に分離されている場合は重複を検出しない", () => {
      const tasks = [
        {
          id: "task1",
          startTime: "09:00",
          duration: 60,
          workTime: 30,
          waitTime: 30,
          isPlaced: true,
        },
        {
          id: "task2",
          startTime: "10:00",
          duration: 60,
          workTime: 30,
          waitTime: 30,
          isPlaced: true,
        },
      ];
      // task1作業時間: 09:00-09:30
      // task2作業時間: 10:00-10:30
      // 完全に分離

      const overlapping = findOverlappingTasksWithWorkTime(tasks);
      expect(overlapping.has("task1")).toBe(false);
      expect(overlapping.has("task2")).toBe(false);
    });

    it("workTime未指定のタスクは従来通り全durationで判定", () => {
      const tasks = [
        {
          id: "task1",
          startTime: "09:00",
          duration: 60,
          isPlaced: true,
        },
        {
          id: "task2",
          startTime: "09:30",
          duration: 60,
          isPlaced: true,
        },
      ];
      // 両方とも全duration（60分）で判定されるため重複

      const overlapping = findOverlappingTasksWithWorkTime(tasks);
      expect(overlapping.has("task1")).toBe(true);
      expect(overlapping.has("task2")).toBe(true);
    });
  });

  describe("canPlaceTaskWithWorkTime", () => {
    const availableSlots = [
      "09:00", "09:15", "09:30", "09:45", 
      "10:00", "10:15", "10:30", "10:45",
      "11:00", "11:15", "11:30", "11:45"
    ];

    it("他のタスクの作業時間と重複しない場合、配置可能", () => {
      // 既存タスクの作業時間: 09:00-09:30
      const occupiedWorkSlots = new Set(["09:00", "09:15"]);
      
      // 新しいタスクを09:45に配置（作業時間: 09:45-10:15）
      const result = canPlaceTaskWithWorkTime(
        "09:45", 60, 30, 30, 
        occupiedWorkSlots, 
        availableSlots
      );
      expect(result).toBe(true);
    });

    it("他のタスクの作業時間と重複する場合、配置不可", () => {
      // 既存タスクの作業時間: 09:00-09:30
      const occupiedWorkSlots = new Set(["09:00", "09:15"]);
      
      // 新しいタスクを09:15に配置（作業時間: 09:15-09:45）→ 重複
      const result = canPlaceTaskWithWorkTime(
        "09:15", 60, 30, 30,
        occupiedWorkSlots,
        availableSlots
      );
      expect(result).toBe(false);
    });

    it("workTime未指定の場合、従来のcanPlaceTaskと同じ動作", () => {
      const occupiedWorkSlots = new Set(["09:00", "09:15"]);
      
      // workTime未指定 → 全duration（60分）をチェック
      const result = canPlaceTaskWithWorkTime(
        "09:15", 60, undefined, undefined,
        occupiedWorkSlots,
        availableSlots
      );
      expect(result).toBe(false);
    });
  });
});