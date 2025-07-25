# 横並びタスク表示機能 (Horizontal Task Display)

## 概要

フェーズ6で実装された機能により、同じ開始時刻で作業時間が重複しないタスクを横並びで表示することができます。

## 動作原理

### 1. 重複検出ロジック

タスクの重複は**作業時間**（workTime）のみで判定されます：
- 待ち時間（waitTime）の重複は許可されます
- 作業時間部分が重複する場合のみ、配置が拒否されます

### 2. 横並び表示の条件

以下の条件を満たすタスクは同じ時刻に配置し、横並びで表示されます：
- 同じ開始時刻（startTime）を持つ
- 作業時間（workTime）が重複しない

### 3. 表示例

```
09:00  [待機タスク]  [作業タスク]
       (待ち時間)   (作業時間)
```

## 技術仕様

### タスク設定例

#### 例1: 同時配置可能な組み合わせ
```typescript
// タスクA: 作業時間のみ
{
  startTime: "09:00",
  duration: 30,
  workTime: 30,
  waitTime: 0
}

// タスクB: 待ち時間のみ  
{
  startTime: "09:00", 
  duration: 30,
  workTime: 0,
  waitTime: 30
}
```

#### 例2: 同時配置不可能な組み合わせ
```typescript
// 両方とも作業時間があるため重複
{
  startTime: "09:00",
  duration: 30,
  workTime: 30,
  waitTime: 0
}

{
  startTime: "09:00",
  duration: 30, 
  workTime: 30,
  waitTime: 0
}
```

### CSS実装

横並び表示は flexbox レイアウトで実現：

```css
.timeline__tasks-container {
  display: flex;
  gap: 4px;
  align-items: stretch;
}
```

各タスクは等幅で配置：
```css
/* TaskCard に適用されるスタイル */
flex: 1 1 50%; /* 2つのタスクの場合 */
```

### ソート順序

同じ時刻の複数タスクは以下の順序でソートされます：
1. 主ソート: 開始時刻（startTime）
2. 副ソート: タスクID（id）の文字列順

## 実装ファイル

- `src/components/Timeline/Timeline.tsx` - 複数タスクの検索とソート
- `src/components/Timeline/TimeSlot.tsx` - 横並び表示の実装  
- `src/components/Timeline/TimeSlot.css` - レイアウト用CSS
- `src/utils/timeUtils.ts` - 重複検出ロジック

## テスト

新機能のテストファイル：
- `__tests__/components/Timeline/HorizontalTaskDisplay.test.tsx`
- `__tests__/utils/horizontalTaskDisplay.test.ts`