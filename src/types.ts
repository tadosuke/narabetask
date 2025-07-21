/**
 * タスクで使用されるリソースの種類
 * - self: 自分自身のリソース
 * - others: 他人のリソース
 * - machine: マシン・機械のリソース
 * - network: ネットワークのリソース
 */
export type ResourceType = 'self' | 'others' | 'machine' | 'network';

/**
 * タスクの情報を表すインターフェース
 */
export interface Task {
  /** タスクの一意識別子 */
  id: string;
  /** タスク名 */
  name: string;
  /** タスクの所要時間（分単位、15分刻み） */
  duration: number; // in minutes, 15-minute increments
  /** タスクで使用するリソースの種類 */
  resourceType: ResourceType;
  /** タイムラインに配置された際の開始時刻（HH:mm形式） */
  startTime?: string; // HH:mm format when placed on timeline
  /** タイムラインに配置されているかどうか */
  isPlaced: boolean;
}

/**
 * タイムラインのタイムスロット情報を表すインターフェース
 */
export interface TimeSlot {
  /** 時刻（HH:mm形式） */
  time: string; // HH:mm format
  /** そのスロットが占有されているかどうか */
  isOccupied: boolean;
  /** 占有しているタスクのID */
  taskId?: string;
}

/**
 * 営業時間を表すインターフェース
 */
export interface BusinessHours {
  /** 営業開始時刻（HH:mm形式） */
  start: string; // HH:mm format
  /** 営業終了時刻（HH:mm形式） */
  end: string; // HH:mm format
}

/**
 * 昼休み時間を表すインターフェース
 */
export interface LunchBreak {
  /** 昼休み開始時刻（HH:mm形式） */
  start: string; // HH:mm format  
  /** 昼休み終了時刻（HH:mm形式） */
  end: string; // HH:mm format
}

/**
 * アプリケーションの設定情報を表すインターフェース
 */
export interface AppSettings {
  /** 営業時間設定 */
  businessHours: BusinessHours;
  /** 昼休み時間設定 */
  lunchBreak: LunchBreak;
}