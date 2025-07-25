import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { TimeSlot } from "../../../src/components/Timeline/TimeSlot";
import type { Task } from "../../../src/types";

// timeUtilsモジュールをモック
vi.mock("../../../src/utils/timeUtils", () => ({
  canPlaceTask: vi.fn(() => true),
  canPlaceTaskWithWorkTime: vi.fn(() => true),
  getTaskSlots: vi.fn(() => ["09:00", "09:15"]),
  getWorkTimeSlots: vi.fn(() => ["09:00", "09:15"])
}));

import { canPlaceTaskWithWorkTime, getTaskSlots } from "../../../src/utils/timeUtils";

describe("TimeSlot 無効ドラッグ時のspanningスタイル", () => {
  const mockTasks: Task[] = [
    {
      id: "1",
      name: "テストタスク1",
      duration: 30,
      isPlaced: false
    },
  ];

  const mockTimeSlots = ["09:00", "09:15", "09:30", "09:45", "10:00"];
  const mockOccupiedSlots = new Set<string>();
  const mockOverlappingTaskIds = new Set<string>();

  const defaultProps = {
    time: "09:30",
    tasks: [],
    isOccupied: false,
    dragOverSlot: "09:30",
    draggedTaskId: "1",
    allTasks: mockTasks,
    timeSlots: mockTimeSlots,
    occupiedSlots: mockOccupiedSlots,
    selectedTask: null,
    overlappingTaskIds: mockOverlappingTaskIds,
    onDragOver: vi.fn(),
    onDragEnter: vi.fn(),
    onDragLeave: vi.fn(),
    onDrop: vi.fn(),
    onTaskClick: vi.fn(),
    onDragStart: vi.fn(),
    onDragEnd: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // デフォルトで30分タスクが2スロットにまたがるようにモック
    vi.mocked(getTaskSlots).mockReturnValue(["09:30", "09:45"]);
  });

  it("無効ドラッグ時にspanningクラスとinvalidクラス両方が適用される", () => {
    vi.mocked(canPlaceTaskWithWorkTime).mockReturnValue(false);
    
    const { container } = render(<TimeSlot {...defaultProps} />);

    const timeSlot = container.querySelector('.timeline__slot');
    expect(timeSlot).toHaveClass("timeline__slot--drag-invalid");
    expect(timeSlot).toHaveClass("timeline__slot--drag-spanning");
    expect(timeSlot).toHaveClass("timeline__slot--drag-spanning-first");
  });

  it("有効ドラッグ時にはspanningクラスのみが適用される", () => {
    vi.mocked(canPlaceTaskWithWorkTime).mockReturnValue(true);
    
    const { container } = render(<TimeSlot {...defaultProps} />);

    const timeSlot = container.querySelector('.timeline__slot');
    expect(timeSlot).not.toHaveClass("timeline__slot--drag-invalid");
    expect(timeSlot).toHaveClass("timeline__slot--drag-spanning");
    expect(timeSlot).toHaveClass("timeline__slot--drag-spanning-first");
  });

  it("単一スロットタスクで無効ドラッグ時に適切なクラスが適用される", () => {
    vi.mocked(canPlaceTaskWithWorkTime).mockReturnValue(false);
    vi.mocked(getTaskSlots).mockReturnValue(["09:30"]); // 単一スロット
    
    const { container } = render(<TimeSlot {...defaultProps} />);

    const timeSlot = container.querySelector('.timeline__slot');
    expect(timeSlot).toHaveClass("timeline__slot--drag-invalid");
    expect(timeSlot).toHaveClass("timeline__slot--drag-spanning");
    expect(timeSlot).toHaveClass("timeline__slot--drag-spanning-single");
  });

  it("最後のスロットで無効ドラッグ時に適切なクラスが適用される", () => {
    vi.mocked(canPlaceTaskWithWorkTime).mockReturnValue(false);
    vi.mocked(getTaskSlots).mockReturnValue(["09:45", "10:00"]);
    
    // 最後のスロット(10:00)の場合
    const propsForLastSlot = {
      ...defaultProps,
      dragOverSlot: "09:45", // 09:45がdrag target
      time: "10:00", // このスロットは最後のスロット
    };
    
    const { container } = render(<TimeSlot {...propsForLastSlot} />);

    const timeSlot = container.querySelector('.timeline__slot');
    // spanning対象でdragが無効な場合、invalidクラスが付く
    expect(timeSlot).toHaveClass("timeline__slot--drag-invalid");
    expect(timeSlot).toHaveClass("timeline__slot--drag-spanning");
    expect(timeSlot).toHaveClass("timeline__slot--drag-spanning-last");
  });

  it("spanning対象でtarget slot以外にもinvalidクラスが付く", () => {
    vi.mocked(canPlaceTaskWithWorkTime).mockReturnValue(false);
    vi.mocked(getTaskSlots).mockReturnValue(["09:30", "09:45"]);
    
    // 09:30がtargetで、09:45は spanning の一部
    const propsForNonTargetSlot = {
      ...defaultProps,
      dragOverSlot: "09:30", // 09:30がdrag target
      time: "09:45", // このスロットはspanning対象でtargetではない
    };
    
    const { container } = render(<TimeSlot {...propsForNonTargetSlot} />);

    const timeSlot = container.querySelector('.timeline__slot');
    // spanning対象でdragが無効な場合、targetスロットでなくてもinvalidクラスが付く
    expect(timeSlot).toHaveClass("timeline__slot--drag-invalid");
    expect(timeSlot).toHaveClass("timeline__slot--drag-spanning");
    expect(timeSlot).toHaveClass("timeline__slot--drag-spanning-last");
  });
});