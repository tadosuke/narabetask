import "@testing-library/jest-dom";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { TaskCard } from "../../src/components/TaskCard";
import type { Task } from "../../src/types";

describe("TaskCard Height Scaling", () => {
  const baseTask: Task = {
    id: "1",
    name: "テストタスク",
    duration: 15,
    resourceTypes: ["self"],
    isPlaced: false,
  };

  it("should have default height (60px) for staging tasks", () => {
    const stagingTask = { ...baseTask, isPlaced: false };
    const { container } = render(<TaskCard task={stagingTask} />);
    
    const taskCard = container.querySelector('.task-card');
    expect(taskCard).toHaveStyle({ height: '60px' });
  });

  it("should scale height based on duration for placed tasks", () => {
    const placedTask15min = { ...baseTask, isPlaced: true, duration: 15, startTime: "09:00" };
    const { container: container15 } = render(<TaskCard task={placedTask15min} />);
    
    const taskCard15 = container15.querySelector('.task-card');
    expect(taskCard15).toHaveStyle({ height: '40px' }); // 1 slot * 40px

    const placedTask30min = { ...baseTask, isPlaced: true, duration: 30, startTime: "09:00" };
    const { container: container30 } = render(<TaskCard task={placedTask30min} />);
    
    const taskCard30 = container30.querySelector('.task-card');
    expect(taskCard30).toHaveStyle({ height: '80px' }); // 2 slots * 40px
  });

  it("should scale height for longer durations", () => {
    const placedTask90min = { ...baseTask, isPlaced: true, duration: 90, startTime: "09:00" };
    const { container } = render(<TaskCard task={placedTask90min} />);
    
    const taskCard = container.querySelector('.task-card');
    expect(taskCard).toHaveStyle({ height: '240px' }); // 6 slots * 40px (90min/15min = 6 slots)
  });

  it("should use absolute positioning for placed tasks in timeline", () => {
    const placedTask = { ...baseTask, isPlaced: true, startTime: "09:00" };
    const style = {
      position: 'absolute' as const,
      left: '8px',
      right: '8px',
      top: '4px',
      zIndex: 2
    };
    
    const { container } = render(<TaskCard task={placedTask} style={style} />);
    
    const taskCard = container.querySelector('.task-card');
    expect(taskCard).toHaveStyle({
      position: 'absolute',
      left: '8px',
      right: '8px',
      top: '4px',
      zIndex: '2'
    });
  });

  it("should maintain minimum height property", () => {
    const placedTask = { ...baseTask, isPlaced: true, duration: 60, startTime: "09:00" };
    const { container } = render(<TaskCard task={placedTask} />);
    
    const taskCard = container.querySelector('.task-card');
    expect(taskCard).toHaveStyle({ 
      height: '160px',
      minHeight: '160px'
    });
  });
});