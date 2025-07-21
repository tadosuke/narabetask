import { useState } from 'react';
import type { Task, AppSettings } from './types';
import { TaskStaging } from './components/TaskStaging';
import { Timeline } from './components/Timeline';
import { TaskSidebar } from './components/TaskSidebar';
import './App.css';

/** デフォルトのアプリケーション設定 */
const defaultSettings: AppSettings = {
  businessHours: {
    start: '09:00',
    end: '18:00'
  },
  lunchBreak: {
    start: '12:00',
    end: '13:00'
  }
};

/**
 * 一意のIDを生成します
 * @returns {string} タイムスタンプとランダム文字列を組み合わせた一意ID
 */
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * メインアプリケーションコンポーネント
 * タスク管理とタイムライン配置の機能を提供します
 */

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [settings] = useState<AppSettings>(defaultSettings);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  /** 新しいタスクを追加する */
  const handleAddTask = () => {
    const newTask: Task = {
      id: generateId(),
      name: '新しいタスク',
      duration: 30,
      resourceTypes: ['self'],
      isPlaced: false
    };
    
    setTasks(prev => [...prev, newTask]);
    setSelectedTask(newTask);
  };

  /** タスクの情報を更新する */
  const handleTaskUpdate = (updatedTask: Task) => {
    setTasks(prev => prev.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    ));
    setSelectedTask(updatedTask);
  };

  /** タスクを削除する */
  const handleTaskRemove = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
    if (selectedTask?.id === taskId) {
      setSelectedTask(null);
    }
  };

  /** タスクをタイムラインにドロップした際の処理 */
  const handleTaskDrop = (taskId: string, startTime: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId
        ? { ...task, startTime, isPlaced: true }
        : task
    ));
  };

  /** タスクをタイムラインから一覧に戻す処理 */
  const handleTaskReturn = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId
        ? { ...task, startTime: undefined, isPlaced: false }
        : task
    ));
  };

  /** タスクをクリックした際の処理 */
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };

  /** サイドバーを閉じる */
  const handleSidebarClose = () => {
    setSelectedTask(null);
  };

  /** ドラッグ開始時の処理 */
  const handleDragStart = (taskId: string) => {
    setDraggedTaskId(taskId);
  };

  /** ドラッグ終了時の処理 */
  const handleDragEnd = () => {
    setDraggedTaskId(null);
  };

  /** メインエリアクリック時の処理 - カード以外をクリックした場合は選択解除 */
  const handleMainClick = (e: React.MouseEvent) => {
    // クリックされた要素がタスクカードまたはサイドバー内の要素でない場合のみ選択解除
    const target = e.target as HTMLElement;
    const isTaskCard = target.closest('.task-card');
    const isSidebar = target.closest('.task-sidebar');
    
    if (!isTaskCard && !isSidebar && selectedTask) {
      setSelectedTask(null);
    }
  };

  return (
    <div className="app">
      <header className="app__header">
        <h1>ナラベタスク</h1>
        <p>効率的なタスク実行順序を調整するアプリ</p>
      </header>
      
      <main className="app__main" onClick={handleMainClick}>
        <TaskStaging
          tasks={tasks}
          selectedTask={selectedTask}
          onTaskClick={handleTaskClick}
          onAddTask={handleAddTask}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onTaskReturn={handleTaskReturn}
        />
        
        <Timeline
          tasks={tasks}
          selectedTask={selectedTask}
          businessHours={settings.businessHours}
          lunchBreak={settings.lunchBreak}
          onTaskDrop={handleTaskDrop}
          onTaskClick={handleTaskClick}
          draggedTaskId={draggedTaskId}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        />
        
        <TaskSidebar
          selectedTask={selectedTask}
          onTaskUpdate={handleTaskUpdate}
          onTaskRemove={handleTaskRemove}
          onClose={handleSidebarClose}
        />
      </main>
    </div>
  );
}

export default App;
