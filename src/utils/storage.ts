import type { Task } from '../types';

/**
 * localStorage key for storing task state
 */
const STORAGE_KEY = 'narabetask_state';

/**
 * Application state that will be persisted
 */
export interface PersistedState {
  tasks: Task[];
  selectedTaskId?: string | null;
}

/**
 * Save application state to localStorage
 */
export const saveToStorage = (tasks: Task[], selectedTask: Task | null): void => {
  try {
    const state: PersistedState = {
      tasks,
      selectedTaskId: selectedTask?.id || null,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('Failed to save state to localStorage:', error);
  }
};

/**
 * Migrate legacy tasks to include workTime and waitTime fields
 */
const migrateLegacyTask = (task: any): Task => {
  // If task already has workTime and waitTime, return as is
  if (typeof task.workTime === 'number' && typeof task.waitTime === 'number') {
    return task as Task;
  }
  
  // Legacy task migration: assume all duration was work time
  const duration = task.duration || 30;
  return {
    ...task,
    duration,
    workTime: duration,
    waitTime: 0,
  } as Task;
};

/**
 * Load application state from localStorage
 * Returns null if no saved state exists or if loading fails
 */
export const loadFromStorage = (): PersistedState | null => {
  try {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (!savedState) {
      return null;
    }
    
    const parsed = JSON.parse(savedState) as PersistedState;
    
    // Validate the structure
    if (!Array.isArray(parsed.tasks)) {
      console.warn('Invalid state structure in localStorage');
      return null;
    }
    
    // Migrate legacy tasks
    const migratedTasks = parsed.tasks.map(migrateLegacyTask);
    
    return {
      ...parsed,
      tasks: migratedTasks,
    };
  } catch (error) {
    console.warn('Failed to load state from localStorage:', error);
    return null;
  }
};

/**
 * Clear saved state from localStorage
 */
export const clearStorage = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear localStorage:', error);
  }
};