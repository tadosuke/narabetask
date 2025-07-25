import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Timeline } from "../../../src/components/Timeline/Timeline";
import type { Task, BusinessHours } from "../../../src/types";

// Mock the timeUtils functions
vi.mock("../../../src/utils/timeUtils", async () => {
  const actual = await vi.importActual("../../../src/utils/timeUtils");
  return {
    ...actual,
    generateTimeSlots: vi.fn(() => ["09:00", "09:15", "09:30", "09:45", "10:00"]),
    getWorkTimeSlots: vi.fn((startTime, duration, workTime, waitTime) => {
      const actualWaitTime = waitTime ?? 0;
      const actualWorkTime = workTime ?? (duration - actualWaitTime);
      
      if (actualWorkTime <= 0) return [];
      
      const slots = [];
      const [hours, minutes] = startTime.split(":").map(Number);
      let totalMinutes = hours * 60 + minutes;
      
      for (let i = 0; i < actualWorkTime; i += 15) {
        const h = Math.floor(totalMinutes / 60);
        const m = totalMinutes % 60;
        slots.push(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`);
        totalMinutes += 15;
      }
      
      return slots;
    }),
    canPlaceTaskWithWorkTime: vi.fn((startTime, duration, workTime, waitTime, occupiedSlots) => {
      const actualWaitTime = waitTime ?? 0;
      const actualWorkTime = workTime ?? (duration - actualWaitTime);
      
      if (actualWorkTime <= 0) return true; // No work time = can always be placed
      
      const [hours, minutes] = startTime.split(":").map(Number);
      let totalMinutes = hours * 60 + minutes;
      
      for (let i = 0; i < actualWorkTime; i += 15) {
        const h = Math.floor(totalMinutes / 60);
        const m = totalMinutes % 60;
        const slot = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
        if (occupiedSlots?.has(slot)) return false;
        totalMinutes += 15;
      }
      
      return true;
    }),
    findOverlappingTasksWithWorkTime: vi.fn(() => new Set())
  };
});

describe("Horizontal Task Display", () => {
  const businessHours: BusinessHours = {
    start: "09:00",
    end: "18:00"
  };

  const mockOnTaskDrop = vi.fn();
  const mockOnTaskClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("displays multiple tasks horizontally when they have complementary work/wait times", () => {
    const workTask: Task = {
      id: "work-task",
      name: "Work Task",
      duration: 30,
      workTime: 30,
      waitTime: 0,
      startTime: "09:00",
      isPlaced: true
    };

    const waitTask: Task = {
      id: "wait-task", 
      name: "Wait Task",
      duration: 30,
      workTime: 0,
      waitTime: 30,
      startTime: "09:00",
      isPlaced: true
    };

    const tasks = [workTask, waitTask];

    render(
      <Timeline
        tasks={tasks}
        selectedTask={null}
        businessHours={businessHours}
        onTaskDrop={mockOnTaskDrop}
        onTaskClick={mockOnTaskClick}
      />
    );

    // Both tasks should be visible
    expect(screen.getByText("Work Task")).toBeInTheDocument();
    expect(screen.getByText("Wait Task")).toBeInTheDocument();

    // Find the 09:00 time slot
    const timeSlot = screen.getByText("09:00").closest('.timeline__slot');
    expect(timeSlot).toBeInTheDocument();

    // Check that the tasks container exists and has both tasks
    const tasksContainer = timeSlot?.querySelector('.timeline__tasks-container');
    expect(tasksContainer).toBeInTheDocument();
    expect(tasksContainer?.children).toHaveLength(2);
  });

  it("sorts tasks by ID when multiple tasks are at the same time slot", () => {
    const taskB: Task = {
      id: "task-b",
      name: "Task B",
      duration: 30,
      workTime: 0,
      waitTime: 30,
      startTime: "09:00",
      isPlaced: true
    };

    const taskA: Task = {
      id: "task-a",
      name: "Task A", 
      duration: 30,
      workTime: 0,
      waitTime: 30,
      startTime: "09:00",
      isPlaced: true
    };

    // Add tasks in reverse alphabetical order
    const tasks = [taskB, taskA];

    render(
      <Timeline
        tasks={tasks}
        selectedTask={null}
        businessHours={businessHours}
        onTaskDrop={mockOnTaskDrop}
        onTaskClick={mockOnTaskClick}
      />
    );

    const timeSlot = screen.getByText("09:00").closest('.timeline__slot');
    const tasksContainer = timeSlot?.querySelector('.timeline__tasks-container');
    
    // Tasks should be sorted by ID (task-a should come before task-b)
    const taskElements = tasksContainer?.children;
    expect(taskElements?.[0]).toHaveTextContent("Task A");
    expect(taskElements?.[1]).toHaveTextContent("Task B");
  });

  it("renders single task without tasks container when only one task", () => {
    const singleTask: Task = {
      id: "single-task",
      name: "Single Task",
      duration: 30,
      workTime: 30,
      waitTime: 0,
      startTime: "09:00",
      isPlaced: true
    };

    render(
      <Timeline
        tasks={[singleTask]}
        selectedTask={null}
        businessHours={businessHours}
        onTaskDrop={mockOnTaskDrop}
        onTaskClick={mockOnTaskClick}
      />
    );

    expect(screen.getByText("Single Task")).toBeInTheDocument();
    
    const timeSlot = screen.getByText("09:00").closest('.timeline__slot');
    const tasksContainer = timeSlot?.querySelector('.timeline__tasks-container');
    expect(tasksContainer).toBeInTheDocument();
    expect(tasksContainer?.children).toHaveLength(1);
  });
});