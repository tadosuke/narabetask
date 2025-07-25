import { describe, it, expect } from "vitest";
import { 
  getWorkTimeSlots, 
  findOverlappingTasksWithWorkTime,
  canPlaceTaskWithWorkTime 
} from "../../src/utils/timeUtils";

describe("Phase 5: 作業時間・待ち時間を考慮した重複ロジック - 統合テスト", () => {
  describe("実際のユースケース", () => {
    it("作業時間が重複しない場合、待ち時間が重複しても問題ない", () => {
      const tasks = [
        {
          id: "task1",
          startTime: "09:00",
          duration: 90,  // 90分 = 1時間30分
          workTime: 60,  // 60分の作業時間 (09:00-10:00)
          waitTime: 30,  // 30分の待ち時間 (10:00-10:30)
          isPlaced: true,
        },
        {
          id: "task2",
          startTime: "10:15",
          duration: 60,  // 60分 = 1時間
          workTime: 30,  // 30分の作業時間 (10:15-10:45)
          waitTime: 30,  // 30分の待ち時間 (10:45-11:15)
          isPlaced: true,
        },
      ];
      
      // task1: 作業時間09:00-10:00, 待ち時間10:00-10:30
      // task2: 作業時間10:15-10:45, 待ち時間10:45-11:15
      // 作業時間は重複なし、待ち時間部分(10:15-10:30)が重複
      
      const overlapping = findOverlappingTasksWithWorkTime(tasks);
      expect(overlapping.size).toBe(0); // 重複なしと判定されるべき
    });

    it("作業時間が重複する場合は重複として検出される", () => {
      const tasks = [
        {
          id: "task1",
          startTime: "09:00",
          duration: 90,
          workTime: 75,  // 75分の作業時間 (09:00-10:15)
          waitTime: 15,  // 15分の待ち時間 (10:15-10:30)
          isPlaced: true,
        },
        {
          id: "task2",
          startTime: "10:00",
          duration: 60,
          workTime: 45,  // 45分の作業時間 (10:00-10:45)
          waitTime: 15,  // 15分の待ち時間 (10:45-11:00)
          isPlaced: true,
        },
      ];
      
      // task1: 作業時間09:00-10:15
      // task2: 作業時間10:00-10:45
      // 作業時間が重複: 10:00-10:15
      
      const overlapping = findOverlappingTasksWithWorkTime(tasks);
      expect(overlapping.has("task1")).toBe(true);
      expect(overlapping.has("task2")).toBe(true);
    });

    it("workTime未指定のタスクは従来通り全durationで判定される", () => {
      const tasks = [
        {
          id: "oldTask",
          startTime: "09:00",
          duration: 60, // 全60分が作業時間として扱われる
          isPlaced: true,
        },
        {
          id: "newTask",
          startTime: "09:30",
          duration: 60,
          workTime: 45,
          waitTime: 15,
          isPlaced: true,
        },
      ];
      
      // oldTask: 作業時間09:00-10:00 (全duration)
      // newTask: 作業時間09:30-10:15
      // 作業時間重複: 09:30-10:00
      
      const overlapping = findOverlappingTasksWithWorkTime(tasks);
      expect(overlapping.has("oldTask")).toBe(true);
      expect(overlapping.has("newTask")).toBe(true);
    });

    it("配置可能性チェックも作業時間のみで判定される", () => {
      // 既存タスクの作業時間: 09:00-09:30
      const occupiedWorkSlots = new Set(["09:00", "09:15"]);
      const availableSlots = ["09:00", "09:15", "09:30", "09:45", "10:00", "10:15"];

      // 新しいタスクを09:45に配置
      // 作業時間: 09:45-10:00 (30分), 待ち時間: 10:00-10:15 (15分)
      const canPlace = canPlaceTaskWithWorkTime(
        "09:45", 45, 30, 15,
        occupiedWorkSlots,
        availableSlots
      );
      
      expect(canPlace).toBe(true); // 作業時間が重複しないので配置可能
    });

    it("作業時間が占有されている場合は配置不可能", () => {
      // 既存タスクの作業時間: 09:00-09:30
      const occupiedWorkSlots = new Set(["09:00", "09:15"]);
      const availableSlots = ["09:00", "09:15", "09:30", "09:45", "10:00", "10:15"];

      // 新しいタスクを09:15に配置
      // 作業時間: 09:15-09:45 (30分) → 既存タスクと重複
      const canPlace = canPlaceTaskWithWorkTime(
        "09:15", 45, 30, 15,
        occupiedWorkSlots,
        availableSlots
      );
      
      expect(canPlace).toBe(false); // 作業時間が重複するので配置不可能
    });
  });

  describe("エッジケース", () => {
    it("workTime = 0 の場合、重複なしとして扱われる", () => {
      const tasks = [
        {
          id: "task1",
          startTime: "09:00",
          duration: 30,
          workTime: 30,
          waitTime: 0,
          isPlaced: true,
        },
        {
          id: "task2",
          startTime: "09:00",
          duration: 30,
          workTime: 0,  // 作業時間なし
          waitTime: 30,
          isPlaced: true,
        },
      ];
      
      const overlapping = findOverlappingTasksWithWorkTime(tasks);
      expect(overlapping.size).toBe(0); // task2は作業時間がないので重複なし
    });

    it("waitTime = 0 の場合でも正しく動作する", () => {
      const workSlots = getWorkTimeSlots("09:00", 30, 30, 0);
      expect(workSlots).toEqual(["09:00", "09:15"]); // 30分の作業時間のみ
    });

    it("workTime + waitTime > duration の場合、workTimeが優先される", () => {
      const workSlots = getWorkTimeSlots("09:00", 45, 60, 30); // 合計90分 > duration 45分
      expect(workSlots).toEqual(["09:00", "09:15", "09:30", "09:45"]); // workTime 60分だが、duration 45分まで
    });
  });
});