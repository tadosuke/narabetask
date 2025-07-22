import { useState, useEffect, useCallback } from 'react';
import type { AppSettings } from './types';
import { TaskProvider } from './contexts/TaskContext';
import { TimelineProvider } from './contexts/TimelineContext';
import { useTaskContext } from './contexts/useTaskContext';
import { TaskStaging } from './components/TaskStaging';
import { Timeline } from './components/Timeline';
import { TaskSidebar } from './components/TaskSidebar';
import './App.css';

/** デフォルトのアプリケーション設定 */
const defaultSettings: AppSettings = {
  businessHours: {
    start: '09:00',
    end: '18:00'
  }
};

/**
 * メインアプリケーション内部コンポーネント
 * TaskContextを使用してタスク管理とタイムライン配置の機能を提供します
 */
function AppContent() {
  const {
    tasks,
    selectedTask,
    draggedTaskId,
    addTask,
    updateTask,
    removeTask,
    dropTask,
    returnTask,
    toggleLock,
    selectTask,
    startDrag,
    endDrag,
  } = useTaskContext();

  const [settings] = useState<AppSettings>(defaultSettings);

  /** メインエリアクリック時の処理 - カード以外をクリックした場合は選択解除 */
  const handleMainClick = (e: React.MouseEvent) => {
    // クリックされた要素がタスクカードまたはサイドバー内の要素でない場合のみ選択解除
    const target = e.target as HTMLElement;
    const isTaskCard = target.closest('.task-card');
    const isSidebar = target.closest('.task-sidebar');
    const isAddButton = target.closest('.task-staging__add-button');
    
    if (!isTaskCard && !isSidebar && !isAddButton && selectedTask) {
      selectTask(null);
    }
  };

  /** キーボードイベントの処理 - Deleteキーでタスクを削除 */
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Deleteキーが押された時の処理
    if (e.key === 'Delete' && selectedTask) {
      // 入力フィールドにフォーカスがある場合は削除処理を行わない
      const activeElement = document.activeElement;
      const isInputFocused = activeElement?.tagName === 'INPUT' || 
                            activeElement?.tagName === 'TEXTAREA' || 
                            activeElement?.tagName === 'SELECT' ||
                            activeElement?.getAttribute('contenteditable') === 'true';
      
      if (!isInputFocused) {
        // 確認ダイアログを表示
        if (window.confirm('このタスクを削除しますか？')) {
          removeTask(selectedTask.id);
        }
      }
    }
  }, [selectedTask, removeTask]);

  /** キーボードイベントリスナーの設定 */
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    
    // クリーンアップ関数でイベントリスナーを削除
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

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
          onTaskClick={selectTask}
          onAddTask={addTask}
          onDragStart={startDrag}
          onDragEnd={endDrag}
          onTaskReturn={returnTask}
        />
        
        <TimelineProvider tasks={tasks} businessHours={settings.businessHours}>
          <Timeline
            tasks={tasks}
            selectedTask={selectedTask}
            businessHours={settings.businessHours}
            onTaskDrop={dropTask}
            onTaskClick={selectTask}
            draggedTaskId={draggedTaskId}
            onDragStart={startDrag}
            onDragEnd={endDrag}
            onLockToggle={toggleLock}
          />
        </TimelineProvider>
        
        <TaskSidebar
          selectedTask={selectedTask}
          onTaskUpdate={updateTask}
          onTaskRemove={removeTask}
        />
      </main>
    </div>
  );
}

/**
 * メインアプリケーションコンポーネント
 * TaskProviderでラップしてタスク管理の状態を提供します
 */
function App() {
  return (
    <TaskProvider>
      <AppContent />
    </TaskProvider>
  );
}

export default App;
