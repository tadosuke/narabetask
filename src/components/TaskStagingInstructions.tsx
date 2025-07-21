import React from 'react';
import './TaskStagingInstructions.css';

/**
 * タスクステージング使用方法コンポーネント
 * 使い方の説明を表示します
 */
export const TaskStagingInstructions: React.FC = () => {
  return (
    <div className="task-staging__instructions">
      <p><strong>使い方:</strong></p>
      <ul>
        <li>タスクをクリックして設定を編集</li>
        <li>タスクをドラッグしてタイムラインに配置</li>
        <li>配置したタスクをドラッグしてここに戻すことも可能</li>
      </ul>
    </div>
  );
};