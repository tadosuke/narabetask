export type ResourceType = 'self' | 'others' | 'machine' | 'network';

export interface Task {
  id: string;
  name: string;
  duration: number; // in minutes, 15-minute increments
  resourceType: ResourceType;
  startTime?: string; // HH:mm format when placed on timeline
  isPlaced: boolean;
}

export interface TimeSlot {
  time: string; // HH:mm format
  isOccupied: boolean;
  taskId?: string;
}

export interface BusinessHours {
  start: string; // HH:mm format
  end: string; // HH:mm format
}

export interface LunchBreak {
  start: string; // HH:mm format  
  end: string; // HH:mm format
}

export interface AppSettings {
  businessHours: BusinessHours;
  lunchBreak: LunchBreak;
}