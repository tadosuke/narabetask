import { describe, it, expect } from "vitest";
import { findOverlappingTasks } from "../../src/utils/timeUtils";

describe("重複検出", () => {
  describe("findOverlappingTasks", () => {
    it("タスクの作業時間が重複する場合に重複を検出する", () => {
      const tasks = [
        {
          id: "task1",
          startTime: "09:00",
          workTime: 30, // 09:00-09:30
          duration: 60,
          isPlaced: true,
        },
        {
          id: "task2",
          startTime: "09:15",
          workTime: 30, // 09:15-09:45 (work time overlaps with task1)
          duration: 60,
          isPlaced: true,
        },
      ];

      const overlapping = findOverlappingTasks(tasks);
      expect(overlapping.has("task1")).toBe(true);
      expect(overlapping.has("task2")).toBe(true);
    });

    it("タスクの作業時間が重複しない場合は重複を検出しない", () => {
      const tasks = [
        {
          id: "task1",
          startTime: "09:00",
          workTime: 15, // 09:00-09:15
          duration: 30,
          isPlaced: true,
        },
        {
          id: "task2",
          startTime: "09:15",
          workTime: 15, // 09:15-09:30 (work time doesn't overlap)
          duration: 30,
          isPlaced: true,
        },
      ];

      const overlapping = findOverlappingTasks(tasks);
      expect(overlapping.has("task1")).toBe(false);
      expect(overlapping.has("task2")).toBe(false);
    });

    it("待ち時間のみが重複する場合は重複を検出しない", () => {
      const tasks = [
        {
          id: "task1",
          startTime: "09:00",
          workTime: 15, // 09:00-09:15 (work), 09:15-09:45 (wait)
          duration: 45,
          isPlaced: true,
        },
        {
          id: "task2",
          startTime: "09:30",
          workTime: 15, // 09:30-09:45 (work) - overlaps with task1's wait time
          duration: 30,
          isPlaced: true,
        },
      ];

      const overlapping = findOverlappingTasks(tasks);
      expect(overlapping.has("task1")).toBe(false);
      expect(overlapping.has("task2")).toBe(false);
    });

    it("未配置のタスクを無視する", () => {
      const tasks = [
        {
          id: "task1",
          startTime: "09:00",
          workTime: 30,
          duration: 60,
          isPlaced: true,
        },
        {
          id: "task2",
          startTime: "09:15",
          workTime: 30,
          duration: 60,
          isPlaced: false,
        },
      ];

      const overlapping = findOverlappingTasks(tasks);
      expect(overlapping.has("task1")).toBe(false);
      expect(overlapping.has("task2")).toBe(false);
    });

    it("開始時刻のないタスクを無視する", () => {
      const tasks = [
        {
          id: "task1",
          startTime: "09:00",
          workTime: 30,
          duration: 60,
          isPlaced: true,
        },
        {
          id: "task2",
          startTime: undefined,
          workTime: 30,
          duration: 60,
          isPlaced: true,
        },
      ];

      const overlapping = findOverlappingTasks(tasks);
      expect(overlapping.has("task1")).toBe(false);
      expect(overlapping.has("task2")).toBe(false);
    });
  });
});
