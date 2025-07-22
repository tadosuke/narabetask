import { render } from '@testing-library/react';
import { TimelineProvider } from '../../src/contexts/TimelineContext';
import type { Task, BusinessHours } from '../../src/types';

const defaultBusinessHours: BusinessHours = {
  start: "09:00",
  end: "17:00",
};

const defaultTasks: Task[] = [
  {
    id: "1",
    name: "Test Task 1",
    duration: 30,
    resourceTypes: ["self"],
    isPlaced: true,
    startTime: "09:00",
  },
  {
    id: "2",
    name: "Test Task 2",
    duration: 60,
    resourceTypes: ["others"],
    isPlaced: false,
  },
];

export const renderWithTimelineProvider = (
  ui: React.ReactElement,
  options: {
    tasks?: Task[];
    businessHours?: BusinessHours;
  } = {}
) => {
  const { tasks = defaultTasks, businessHours = defaultBusinessHours } = options;
  
  return render(
    <TimelineProvider tasks={tasks} businessHours={businessHours}>
      {ui}
    </TimelineProvider>
  );
};