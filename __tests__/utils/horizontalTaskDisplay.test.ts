import { describe, it, expect } from "vitest";
import { getWorkTimeSlots, canPlaceTaskWithWorkTime } from "../../src/utils/timeUtils";

describe("Horizontal Task Display Tests", () => {
  it("Tasks with complementary work/wait times should be able to coexist", () => {
    const startTime = "09:00";
    
    // Task 1: All work time (30 minutes work, 0 wait)
    const task1WorkSlots = getWorkTimeSlots(startTime, 30, 30, 0);
    // Expected: ["09:00", "09:15"]
    
    // Task 2: All wait time (0 work, 30 minutes wait)
    const task2WorkSlots = getWorkTimeSlots(startTime, 30, 0, 30);
    // Expected: [] (empty array - no work time)
    
    // Create occupied slots from task 1
    const occupiedSlots = new Set(task1WorkSlots);
    
    // Task 2 should be able to be placed because it has no work time
    const canPlaceTask2 = canPlaceTaskWithWorkTime(
      startTime, 
      30, // duration
      0,  // workTime 
      30, // waitTime
      occupiedSlots, 
      ["09:00", "09:15", "09:30", "09:45"] // available slots
    );
    
    expect(task1WorkSlots).toEqual(["09:00", "09:15"]);
    expect(task2WorkSlots).toEqual([]);
    expect(canPlaceTask2).toBe(true);
  });

  it("Tasks with overlapping work time should NOT be able to coexist", () => {
    const startTime = "09:00";
    
    // Task 1: 30 minutes work time
    const task1WorkSlots = getWorkTimeSlots(startTime, 30, 30, 0);
    
    // Task 2: Also 30 minutes work time at same start time
    const task2WorkSlots = getWorkTimeSlots(startTime, 30, 30, 0);
    
    // Create occupied slots from task 1
    const occupiedSlots = new Set(task1WorkSlots);
    
    // Task 2 should NOT be able to be placed because work times overlap
    const canPlaceTask2 = canPlaceTaskWithWorkTime(
      startTime, 
      30, // duration
      30, // workTime 
      0,  // waitTime
      occupiedSlots,
      ["09:00", "09:15", "09:30", "09:45"] // available slots
    );
    
    expect(task1WorkSlots).toEqual(["09:00", "09:15"]);
    expect(task2WorkSlots).toEqual(["09:00", "09:15"]);
    expect(canPlaceTask2).toBe(false);
  });

  it("Default tasks (no explicit work/wait time) should conflict", () => {
    const startTime = "09:00";
    
    // Task 1: duration 30, no explicit work/wait time (should default to 30 work, 0 wait)
    const task1WorkSlots = getWorkTimeSlots(startTime, 30);
    
    // Task 2: same as task 1
    const task2WorkSlots = getWorkTimeSlots(startTime, 30);
    
    // Create occupied slots from task 1
    const occupiedSlots = new Set(task1WorkSlots);
    
    // Task 2 should NOT be able to be placed
    const canPlaceTask2 = canPlaceTaskWithWorkTime(
      startTime, 
      30, // duration
      undefined, // workTime - should default to duration
      undefined, // waitTime - should default to 0
      occupiedSlots,
      ["09:00", "09:15", "09:30", "09:45"] // available slots
    );
    
    expect(task1WorkSlots).toEqual(["09:00", "09:15"]);
    expect(task2WorkSlots).toEqual(["09:00", "09:15"]);
    expect(canPlaceTask2).toBe(false);
  });
});