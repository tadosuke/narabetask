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
    "12:00",
    "12:15",
    "13:00",
    "13:15",
    "17:00",
  ]),
  canPlaceTask: vi.fn(() => true),
  getTaskSlots: vi.fn(() => ["09:00", "09:15"]),
}));

describe("Timeline", () => {
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
      resourceTypes: ["self"],
      isPlaced: true,
      startTime: "09:00",
    },
    {
      id: "2",
      name: "テストタスク2",
      duration: 60,
      resourceTypes: ["others"],
      isPlaced: false,
    },
  ];

  const defaultProps = {
    tasks: mockTasks,
    businessHours: mockBusinessHours,
    lunchBreak: mockLunchBreak,
    onTaskDrop: vi.fn(),
    onTaskClick: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render timeline header correctly", () => {
    render(<Timeline {...defaultProps} />);

    expect(screen.getByText("タイムライン")).toBeInTheDocument();
    expect(screen.getByText("業務時間: 09:00 - 17:00")).toBeInTheDocument();
  });

  it("should render time slots", () => {
    render(<Timeline {...defaultProps} />);

    // Check for time labels specifically
    const timeLabels = screen.getAllByText("09:00");
    expect(timeLabels.length).toBeGreaterThan(0);
    expect(screen.getByText("09:15")).toBeInTheDocument();
    expect(screen.getByText("09:30")).toBeInTheDocument();
  });

  it("should render placed tasks in their time slots", () => {
    render(<Timeline {...defaultProps} />);

    // The placed task should be rendered in the timeline
    expect(screen.getByText("テストタスク1")).toBeInTheDocument();
  });

  it("should apply lunch time styling to lunch break slots", () => {
    const { container } = render(<Timeline {...defaultProps} />);

    const lunchSlot = container.querySelector('[data-time="12:00"]');
    expect(lunchSlot).toHaveClass("timeline__slot--lunch");
  });

  it("should handle drag over event", () => {
    const { container } = render(<Timeline {...defaultProps} />);

    const timeSlot = container.querySelector('[data-time="09:30"]');
    const dragOverEvent = new Event("dragover", { bubbles: true });
    Object.defineProperty(dragOverEvent, "preventDefault", { value: vi.fn() });

    fireEvent(timeSlot!, dragOverEvent);
    expect(dragOverEvent.preventDefault).toHaveBeenCalled();
  });

  it("should handle task drop and call onTaskDrop", () => {
    const mockOnTaskDrop = vi.fn();
    const { container } = render(
      <Timeline {...defaultProps} onTaskDrop={mockOnTaskDrop} />
    );

    const timeSlot = container.querySelector('[data-time="09:30"]');

    const dropEvent = new Event("drop", { bubbles: true });
    Object.defineProperty(dropEvent, "preventDefault", { value: vi.fn() });
    Object.defineProperty(dropEvent, "dataTransfer", {
      value: { getData: vi.fn(() => "2") },
    });

    fireEvent(timeSlot!, dropEvent);

    expect(dropEvent.preventDefault).toHaveBeenCalled();
    expect(mockOnTaskDrop).toHaveBeenCalledWith("2", "09:30");
  });

  it("should call onTaskClick when placed task is clicked", () => {
    const mockOnTaskClick = vi.fn();
    render(<Timeline {...defaultProps} onTaskClick={mockOnTaskClick} />);

    fireEvent.click(screen.getByText("テストタスク1"));

    expect(mockOnTaskClick).toHaveBeenCalledWith(mockTasks[0]);
  });

  it("should only render placed tasks", () => {
    render(<Timeline {...defaultProps} />);

    // Placed task should be visible
    expect(screen.getByText("テストタスク1")).toBeInTheDocument();
    // Unplaced task should not be visible
    expect(screen.queryByText("テストタスク2")).not.toBeInTheDocument();
  });

  it("should apply occupied styling to occupied slots", () => {
    const { container } = render(<Timeline {...defaultProps} />);

    const occupiedSlot = container.querySelector('[data-time="09:00"]');
    expect(occupiedSlot).toHaveClass("timeline__slot--occupied");
  });
});
