import { render } from "@testing-library/react";
import { TimelineProvider } from "../../../src/contexts/TimelineContext";
import { Timeline } from "../../../src/components/Timeline/Timeline";
import { TimeSlot } from "../../../src/components/Timeline/TimeSlot";
import type { Task, BusinessHours } from "../../../src/types";
import { vi } from "vitest";

/**
 * Timeline component tests shared utility functions
 */

export const mockBusinessHours: BusinessHours = {
  start: "09:00",
  end: "17:00",
};

export const mockTasks: Task[] = [
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

export interface TimelineTestSetup {
  timelineProps?: Partial<React.ComponentProps<typeof Timeline>>;
  providerProps?: Partial<React.ComponentProps<typeof TimelineProvider>>;
}

export const renderTimelineWithProvider = ({
  timelineProps = {},
  providerProps = {},
}: TimelineTestSetup = {}) => {
  const defaultTimelineProps = {
    selectedTask: null,
    businessHours: mockBusinessHours,
    onTaskClick: vi.fn(),
  };

  const defaultProviderProps = {
    tasks: mockTasks,
    businessHours: mockBusinessHours,
    onTaskDrop: vi.fn(),
  };

  const finalTimelineProps = { ...defaultTimelineProps, ...timelineProps };
  const finalProviderProps = { ...defaultProviderProps, ...providerProps };

  return render(
    <TimelineProvider {...finalProviderProps}>
      <Timeline {...finalTimelineProps} />
    </TimelineProvider>
  );
};

export interface TimeSlotTestSetup {
  timeSlotProps?: Partial<React.ComponentProps<typeof TimeSlot>>;
  providerProps?: Partial<React.ComponentProps<typeof TimelineProvider>>;
}

export const renderTimeSlotWithProvider = ({
  timeSlotProps = {},
  providerProps = {},
}: TimeSlotTestSetup = {}) => {
  const defaultTimeSlotProps = {
    time: "09:00",
    task: undefined,
    isOccupied: false,
    dragOverSlot: null,
    draggedTaskId: null,
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
    businessHours: mockBusinessHours,
    onTaskDrop: vi.fn(),
  };

  const finalTimeSlotProps = { ...defaultTimeSlotProps, ...timeSlotProps };
  const finalProviderProps = { ...defaultProviderProps, ...providerProps };

  return render(
    <TimelineProvider {...finalProviderProps}>
      <TimeSlot {...finalTimeSlotProps} />
    </TimelineProvider>
  );
};