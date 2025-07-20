import { useState } from 'react';
import type { Task, AppSettings } from './types';
import { TaskStaging } from './components/TaskStaging';
import { Timeline } from './components/Timeline';
import { TaskSidebar } from './components/TaskSidebar';
import './App.css';

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

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [settings] = useState<AppSettings>(defaultSettings);

  const handleAddTask = () => {
    const newTask: Task = {
      id: generateId(),
      name: '新しいタスク',
      duration: 30,
      resourceType: 'self',
      isPlaced: false
    };
    
    setTasks(prev => [...prev, newTask]);
    setSelectedTask(newTask);
  };

  const handleTaskUpdate = (updatedTask: Task) => {
    setTasks(prev => prev.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    ));
    setSelectedTask(updatedTask);
  };

  const handleTaskRemove = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
    if (selectedTask?.id === taskId) {
      setSelectedTask(null);
    }
  };

  const handleTaskDrop = (taskId: string, startTime: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId
        ? { ...task, startTime, isPlaced: true }
        : task
    ));
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };

  const handleSidebarClose = () => {
    setSelectedTask(null);
  };

  return (
    <div className="app">
      <header className="app__header">
        <h1>ナラベタスク</h1>
        <p>効率的なタスク実行順序を調整するアプリ</p>
      </header>
      
      <main className="app__main">
        <TaskStaging
          tasks={tasks}
          onTaskClick={handleTaskClick}
          onAddTask={handleAddTask}
        />
        
        <Timeline
          tasks={tasks}
          businessHours={settings.businessHours}
          lunchBreak={settings.lunchBreak}
          onTaskDrop={handleTaskDrop}
          onTaskClick={handleTaskClick}
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
