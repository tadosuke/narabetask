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
    
    return parsed;
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