import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Timeline } from "../../src/components/Timeline";
import type { Task, BusinessHours, LunchBreak } from "../../src/types";

// Mock the timeUtils module
vi.mock("../../src/utils/timeUtils", () => ({
  generateTimeSlots: vi.fn(() => [
    "09:00",
    "09:15", 
    "09:30",
    "09:45",
    "10:00",
    "13:00",
    "13:15",
  ]),
  canPlaceTask: vi.fn(),
  getTaskSlots: vi.fn(),
}));

import { canPlaceTask, getTaskSlots } from "../../src/utils/timeUtils";

describe("Timeline Drag Feedback", () => {
  const mockBusinessHours: BusinessHours = {
    start: "09:00",
    end: "17:00",
  };

  const mockLunchBreak: LunchBreak = {
    start: "12:00",
    end: "13:00",
  };

  const mockTasks: Task[] = [
    {
      id: "1",
      name: "テストタスク1",
      duration: 30,
      resourceType: "self",
      isPlaced: true,
      startTime: "09:00",
    },
    {
      id: "2", 
      name: "テストタスク2",
      duration: 60,
      resourceType: "others",
      isPlaced: false,
    },
  ];

  const mockOnDragStart = vi.fn();
  const mockOnDragEnd = vi.fn();

  const defaultProps = {
    tasks: mockTasks,
    businessHours: mockBusinessHours,
    lunchBreak: mockLunchBreak,
    onTaskDrop: vi.fn(),
    onTaskClick: vi.fn(),
    draggedTaskId: "2",
    onDragStart: mockOnDragStart,
    onDragEnd: mockOnDragEnd,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mocks to default behavior
    vi.mocked(getTaskSlots).mockReturnValue(["09:00", "09:15"]);
  });

  it("should apply drag-over class when dragging over valid slot", () => {
    vi.mocked(canPlaceTask).mockReturnValue(true);
    
    const { container } = render(<Timeline {...defaultProps} />);

    const timeSlot = container.querySelector('[data-time="09:30"]');
    expect(timeSlot).not.toBeNull();

    // Simulate drag enter
    const dragEnterEvent = new Event("dragenter", { bubbles: true });
    Object.defineProperty(dragEnterEvent, "preventDefault", { value: vi.fn() });
    
    fireEvent(timeSlot!, dragEnterEvent);

    // Check that the slot has the drag-over class
    expect(timeSlot).toHaveClass("timeline__slot--drag-over");
  });

  it("should apply drag-invalid class when dragging over invalid slot", () => {
    vi.mocked(canPlaceTask).mockReturnValue(false);
    
    const { container } = render(<Timeline {...defaultProps} />);

    const timeSlot = container.querySelector('[data-time="09:30"]');
    expect(timeSlot).not.toBeNull();

    // Simulate drag enter
    const dragEnterEvent = new Event("dragenter", { bubbles: true });
    Object.defineProperty(dragEnterEvent, "preventDefault", { value: vi.fn() });
    
    fireEvent(timeSlot!, dragEnterEvent);

    // Check that the slot has the drag-invalid class
    expect(timeSlot).toHaveClass("timeline__slot--drag-invalid");
  });

  it("should clear drag feedback on drag leave", () => {
    vi.mocked(canPlaceTask).mockReturnValue(true);
    
    const { container } = render(<Timeline {...defaultProps} />);

    const timeSlot = container.querySelector('[data-time="09:30"]');
    expect(timeSlot).not.toBeNull();

    // Simulate drag enter first
    const dragEnterEvent = new Event("dragenter", { bubbles: true });
    Object.defineProperty(dragEnterEvent, "preventDefault", { value: vi.fn() });
    fireEvent(timeSlot!, dragEnterEvent);

    expect(timeSlot).toHaveClass("timeline__slot--drag-over");

    // Simulate drag leave
    const dragLeaveEvent = new Event("dragleave", { bubbles: true });
    Object.defineProperty(dragLeaveEvent, "preventDefault", { value: vi.fn() });
    Object.defineProperty(dragLeaveEvent, "currentTarget", { value: timeSlot });
    Object.defineProperty(dragLeaveEvent, "relatedTarget", { value: document.body });
    
    fireEvent(timeSlot!, dragLeaveEvent);

    // Check that drag feedback classes are removed
    expect(timeSlot).not.toHaveClass("timeline__slot--drag-over");
    expect(timeSlot).not.toHaveClass("timeline__slot--drag-invalid");
  });

  it("should call onDragEnd when drop occurs", () => {
    const { container } = render(<Timeline {...defaultProps} />);

    const timeSlot = container.querySelector('[data-time="09:30"]');
    const dropEvent = new Event("drop", { bubbles: true });
    Object.defineProperty(dropEvent, "preventDefault", { value: vi.fn() });
    Object.defineProperty(dropEvent, "dataTransfer", {
      value: { getData: vi.fn(() => "2") },
    });

    fireEvent(timeSlot!, dropEvent);

    expect(mockOnDragEnd).toHaveBeenCalled();
  });

  it("should not show drag feedback when no task is being dragged", () => {
    const propsWithoutDrag = {
      ...defaultProps,
      draggedTaskId: null,
    };
    
    const { container } = render(<Timeline {...propsWithoutDrag} />);

    const timeSlot = container.querySelector('[data-time="09:30"]');
    
    // Simulate drag enter
    const dragEnterEvent = new Event("dragenter", { bubbles: true });
    Object.defineProperty(dragEnterEvent, "preventDefault", { value: vi.fn() });
    
    fireEvent(timeSlot!, dragEnterEvent);

    // Should not have any drag feedback classes
    expect(timeSlot).not.toHaveClass("timeline__slot--drag-over");
    expect(timeSlot).not.toHaveClass("timeline__slot--drag-invalid");
  });
});