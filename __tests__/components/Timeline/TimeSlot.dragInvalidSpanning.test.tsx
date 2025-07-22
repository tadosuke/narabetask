import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderTimeSlotWithProvider } from "./testUtils";
import type { Task } from "../../../src/types";

// timeUtilsモジュールをモック
vi.mock("../../../src/utils/timeUtils", () => ({
  generateTimeSlots: vi.fn(() => ["09:00", "09:15", "09:30", "09:45", "10:00"]),
  canPlaceTask: vi.fn(),
  getTaskSlots: vi.fn(),
  findOverlappingTasks: vi.fn(() => new Set()),
  doTasksShareResources: vi.fn(() => false),
}));

import { canPlaceTask, getTaskSlots } from "../../../src/utils/timeUtils";

describe("TimeSlot 無効ドラッグ時のspanningスタイル", () => {
  const mockTasks: Task[] = [
    {
      id: "1",
      name: "テストタスク1",
      duration: 30,
      resourceTypes: ["self"],
      isPlaced: false,
    },
  ];

  const defaultTimeSlotProps = {
    time: "09:30",
    isOccupied: false,
    dragOverSlot: "09:30",
    draggedTaskId: "1",
    selectedTask: null,
    overlappingTaskIds: new Set<string>(),
    onDragOver: vi.fn(),
    onDragEnter: vi.fn(),
    onDragLeave: vi.fn(),
    onDrop: vi.fn(),
    onTaskClick: vi.fn(),
  };

  const defaultProviderProps = {
    tasks: mockTasks,
    businessHours: { start: "09:00", end: "17:00" },
    onTaskDrop: vi.fn(),
    draggedTaskId: "1",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // デフォルトで30分タスクが2スロットにまたがるようにモック
    vi.mocked(getTaskSlots).mockReturnValue(["09:30", "09:45"]);
  });

  it("無効ドラッグ時にspanningクラスとinvalidクラス両方が適用される", () => {
    vi.mocked(canPlaceTask).mockReturnValue(false);
    
    const { container } = renderTimeSlotWithProvider({
      timeSlotProps: defaultTimeSlotProps,
      providerProps: defaultProviderProps
    });

    const timeSlot = container.querySelector('.timeline__slot');
    expect(timeSlot).toHaveClass("timeline__slot--drag-invalid");
    expect(timeSlot).toHaveClass("timeline__slot--drag-spanning");
    expect(timeSlot).toHaveClass("timeline__slot--drag-spanning-first");
  });

  it("有効ドラッグ時にはspanningクラスのみが適用される", () => {
    vi.mocked(canPlaceTask).mockReturnValue(true);
    
    const { container } = renderTimeSlotWithProvider({
      timeSlotProps: defaultTimeSlotProps,
      providerProps: defaultProviderProps
    });

    const timeSlot = container.querySelector('.timeline__slot');
    expect(timeSlot).not.toHaveClass("timeline__slot--drag-invalid");
    expect(timeSlot).toHaveClass("timeline__slot--drag-spanning");
    expect(timeSlot).toHaveClass("timeline__slot--drag-spanning-first");
  });

  it("単一スロットタスクで無効ドラッグ時に適切なクラスが適用される", () => {
    vi.mocked(canPlaceTask).mockReturnValue(false);
    vi.mocked(getTaskSlots).mockReturnValue(["09:30"]); // 単一スロット
    
    const { container } = renderTimeSlotWithProvider({
      timeSlotProps: defaultTimeSlotProps,
      providerProps: defaultProviderProps
    });

    const timeSlot = container.querySelector('.timeline__slot');
    expect(timeSlot).toHaveClass("timeline__slot--drag-invalid");
    expect(timeSlot).toHaveClass("timeline__slot--drag-spanning");
    expect(timeSlot).toHaveClass("timeline__slot--drag-spanning-single");
  });

  it("最後のスロットで無効ドラッグ時に適切なクラスが適用される", () => {
    vi.mocked(canPlaceTask).mockReturnValue(false);
    vi.mocked(getTaskSlots).mockReturnValue(["09:45", "10:00"]);
    
    // 最後のスロット(10:00)の場合
    const timeSlotPropsForLastSlot = {
      ...defaultTimeSlotProps,
      dragOverSlot: "09:45", // 09:45がdrag target
      time: "10:00", // このスロットは最後のスロット
    };
    
    const { container } = renderTimeSlotWithProvider({
      timeSlotProps: timeSlotPropsForLastSlot,
      providerProps: defaultProviderProps
    });

    const timeSlot = container.querySelector('.timeline__slot');
    // spanning対象でdragが無効な場合、invalidクラスが付く
    expect(timeSlot).toHaveClass("timeline__slot--drag-invalid");
    expect(timeSlot).toHaveClass("timeline__slot--drag-spanning");
    expect(timeSlot).toHaveClass("timeline__slot--drag-spanning-last");
  });

  it("spanning対象でtarget slot以外にもinvalidクラスが付く", () => {
    vi.mocked(canPlaceTask).mockReturnValue(false);
    vi.mocked(getTaskSlots).mockReturnValue(["09:30", "09:45"]);
    
    // 09:30がtargetで、09:45は spanning の一部
    const timeSlotPropsForNonTargetSlot = {
      ...defaultTimeSlotProps,
      dragOverSlot: "09:30", // 09:30がdrag target
      time: "09:45", // このスロットはspanning対象でtargetではない
    };
    
    const { container } = renderTimeSlotWithProvider({
      timeSlotProps: timeSlotPropsForNonTargetSlot,
      providerProps: defaultProviderProps
    });

    const timeSlot = container.querySelector('.timeline__slot');
    // spanning対象でdragが無効な場合、targetスロットでなくてもinvalidクラスが付く
    expect(timeSlot).toHaveClass("timeline__slot--drag-invalid");
    expect(timeSlot).toHaveClass("timeline__slot--drag-spanning");
    expect(timeSlot).toHaveClass("timeline__slot--drag-spanning-last");
  });
});